/**
 * Sync Engine — processes the IndexedDB sync queue when the network is available.
 *
 * Flow:
 *  1. On reconnect (or periodic check), read all items from `syncQueue`.
 *  2. For each item, attempt the corresponding API call.
 *  3. On success → remove from queue, update local IndexedDB with server response.
 *  4. On failure → increment retry count; skip after MAX_RETRIES.
 */

import {
  getAllSyncQueueItems,
  getSyncQueueCount,
  onSyncQueueChange,
  removeSyncQueueItem,
  updateSyncQueueItem,
  putTransaction,
  deleteTransaction as deleteLocalTransaction,
  putAllTransactions,
  type SyncQueueItem,
} from "./indexeddb";

const MAX_RETRIES = 5;

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export type SyncListener = (status: SyncStatus, pending: number) => void;

const listeners = new Set<SyncListener>();

let currentStatus: SyncStatus = "idle";
let currentPending = 0;
let isSyncing = false;

// ──────────────────────────────────────────
// Public API
// ──────────────────────────────────────────

export function onSyncStatusChange(listener: SyncListener): () => void {
  listeners.add(listener);
  // Immediately notify with current state
  listener(currentStatus, currentPending);
  return () => listeners.delete(listener);
}

function broadcast(status: SyncStatus, pending: number) {
  currentStatus = status;
  currentPending = pending;
  listeners.forEach((fn) => fn(status, pending));
}

/**
 * Process the entire sync queue. Safe to call multiple times — it won't
 * run concurrently.
 */
export async function processSyncQueue(): Promise<void> {
  if (isSyncing) return;
  if (!navigator.onLine) {
    broadcast("offline", currentPending);
    return;
  }

  isSyncing = true;

  try {
    const items = await getAllSyncQueueItems();
    if (items.length === 0) {
      broadcast("idle", 0);
      isSyncing = false;
      return;
    }

    broadcast("syncing", items.length);

    for (const item of items) {
      if (!navigator.onLine) {
        broadcast("offline", items.length);
        break;
      }

      try {
        await processItem(item);
        await removeSyncQueueItem(item.id!);
        const remaining = (await getAllSyncQueueItems()).length;
        broadcast("syncing", remaining);
      } catch (error) {
        console.error("[SyncEngine] Failed to process item:", item, error);

        if (item.retries >= MAX_RETRIES) {
          // Give up on this item
          console.warn("[SyncEngine] Max retries reached, removing item:", item);
          await removeSyncQueueItem(item.id!);
        } else {
          // Increment retry count
          await updateSyncQueueItem({ ...item, retries: item.retries + 1 });
        }
      }
    }

    const remaining = await getAllSyncQueueItems();
    if (remaining.length === 0) {
      // Full sync complete — re-fetch from server to reconcile
      await reconcileWithServer();
      broadcast("idle", 0);
    } else {
      broadcast("error", remaining.length);
    }
  } catch (error) {
    console.error("[SyncEngine] Queue processing error:", error);
    broadcast("error", currentPending);
  } finally {
    isSyncing = false;
  }
}

// ──────────────────────────────────────────
// Process individual queue items
// ──────────────────────────────────────────

async function processItem(item: SyncQueueItem): Promise<void> {
  switch (item.action) {
    case "create":
      await processCreate(item);
      break;
    case "update":
      await processUpdate(item);
      break;
    case "delete":
      await processDelete(item);
      break;
    default:
      console.warn("[SyncEngine] Unknown action:", item.action);
  }
}

async function processCreate(item: SyncQueueItem): Promise<void> {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item.payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Create failed: ${response.status}`);
  }

  const serverTransaction = await response.json();

  // Replace the temp transaction in IndexedDB with the real server one
  if (item.tempId) {
    await deleteLocalTransaction(item.tempId);
  }
  await putTransaction(serverTransaction);
}

async function processUpdate(item: SyncQueueItem): Promise<void> {
  const { id, ...updateData } = item.payload;

  // Don't sync updates for temp IDs (they haven't been created on server yet)
  if (typeof id === "string" && id.startsWith("temp-")) {
    return;
  }

  const response = await fetch(`/api/transactions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Update failed: ${response.status}`);
  }

  const updatedTransaction = await response.json();
  await putTransaction(updatedTransaction);
}

async function processDelete(item: SyncQueueItem): Promise<void> {
  const { id } = item.payload;

  // Don't try to delete temp IDs from server
  if (typeof id === "string" && id.startsWith("temp-")) {
    return;
  }

  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });

  // 404 is acceptable — it may have been deleted already
  if (!response.ok && response.status !== 404) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}

// ──────────────────────────────────────────
// Reconcile local IndexedDB with server
// ──────────────────────────────────────────

async function reconcileWithServer(): Promise<void> {
  try {
    const response = await fetch("/api/transactions", { cache: "no-store" });
    if (!response.ok) return;

    const serverTransactions = await response.json();
    await putAllTransactions(serverTransactions);
  } catch (error) {
    console.error("[SyncEngine] Reconciliation failed:", error);
  }
}

// ──────────────────────────────────────────
// Auto-sync on reconnect
// ──────────────────────────────────────────

let initialized = false;

export function initSyncEngine(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  void getSyncQueueCount()
    .then((count) => {
      currentPending = count;
      if (!navigator.onLine) {
        broadcast("offline", count);
      } else if (count > 0) {
        broadcast("syncing", count);
      }
    })
    .catch(() => {
      currentPending = 0;
    });

  onSyncQueueChange((pending) => {
    currentPending = pending;

    if (!navigator.onLine) {
      broadcast("offline", pending);
      return;
    }

    if (pending === 0 && !isSyncing) {
      if (currentStatus !== "error") {
        broadcast("idle", 0);
      }
      return;
    }

    if (pending > 0 && !isSyncing) {
      broadcast("syncing", pending);
      void processSyncQueue();
    }
  });

  // Sync when coming back online
  window.addEventListener("online", () => {
    console.log("[SyncEngine] Network reconnected — starting sync");
    void processSyncQueue();
  });

  window.addEventListener("offline", () => {
    broadcast("offline", currentPending);
  });

  // Set initial state
  if (!navigator.onLine) {
    broadcast("offline", 0);
  }

  // Try to process any pending items on startup
  void processSyncQueue();
}
