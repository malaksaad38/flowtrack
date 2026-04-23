/**
 * IndexedDB wrapper for offline transaction storage and sync queue.
 *
 * Two object stores:
 *  - `transactions` — local mirror of server transactions
 *  - `syncQueue`    — pending create/update/delete operations
 */

const DB_NAME = "flowtrack-offline";
const DB_VERSION = 1;
const STORE_TRANSACTIONS = "transactions";
const STORE_SYNC_QUEUE = "syncQueue";

export type SyncAction = "create" | "update" | "delete";

export interface SyncQueueItem {
  /** Auto-incremented key */
  id?: number;
  /** The action to replay on the server */
  action: SyncAction;
  /** For create: the full payload. For update: partial payload. For delete: just { id }. */
  payload: Record<string, unknown>;
  /** ISO timestamp of when the action was queued */
  createdAt: string;
  /** Number of times we've attempted to sync this item */
  retries: number;
  /** The temporary client-side ID (for create operations) */
  tempId?: string;
}

// ──────────────────────────────────────────
// Database connection
// ──────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.createObjectStore(STORE_TRANSACTIONS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// ──────────────────────────────────────────
// Generic helpers
// ──────────────────────────────────────────

function tx(
  store: string,
  mode: IDBTransactionMode
): Promise<{ store: IDBObjectStore; done: Promise<void> }> {
  return openDB().then((db) => {
    const transaction = db.transaction(store, mode);
    const objectStore = transaction.objectStore(store);
    const done = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    return { store: objectStore, done };
  });
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ──────────────────────────────────────────
// Transaction store operations
// ──────────────────────────────────────────

export async function getAllTransactions(): Promise<Record<string, unknown>[]> {
  const { store, done } = await tx(STORE_TRANSACTIONS, "readonly");
  const result = await requestToPromise(store.getAll());
  await done;
  return result;
}

export async function putTransaction(
  transaction: Record<string, unknown>
): Promise<void> {
  const { store, done } = await tx(STORE_TRANSACTIONS, "readwrite");
  store.put(transaction);
  await done;
}

export async function putAllTransactions(
  transactions: Record<string, unknown>[]
): Promise<void> {
  const { store, done } = await tx(STORE_TRANSACTIONS, "readwrite");
  // Clear existing and replace with server truth
  store.clear();
  for (const t of transactions) {
    store.put(t);
  }
  await done;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { store, done } = await tx(STORE_TRANSACTIONS, "readwrite");
  store.delete(id);
  await done;
}

export async function updateTransaction(
  id: string,
  changes: Record<string, unknown>
): Promise<void> {
  const { store, done } = await tx(STORE_TRANSACTIONS, "readwrite");
  const existing = await requestToPromise(store.get(id));
  if (existing) {
    store.put({ ...existing, ...changes, id });
  }
  await done;
}

// ──────────────────────────────────────────
// Sync queue operations
// ──────────────────────────────────────────

export async function addToSyncQueue(
  item: Omit<SyncQueueItem, "id">
): Promise<void> {
  const { store, done } = await tx(STORE_SYNC_QUEUE, "readwrite");
  store.add(item);
  await done;
}

export async function getAllSyncQueueItems(): Promise<SyncQueueItem[]> {
  const { store, done } = await tx(STORE_SYNC_QUEUE, "readonly");
  const result = await requestToPromise(store.getAll());
  await done;
  return result;
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const { store, done } = await tx(STORE_SYNC_QUEUE, "readwrite");
  store.delete(id);
  await done;
}

export async function updateSyncQueueItem(
  item: SyncQueueItem
): Promise<void> {
  const { store, done } = await tx(STORE_SYNC_QUEUE, "readwrite");
  store.put(item);
  await done;
}

export async function clearSyncQueue(): Promise<void> {
  const { store, done } = await tx(STORE_SYNC_QUEUE, "readwrite");
  store.clear();
  await done;
}

export async function getSyncQueueCount(): Promise<number> {
  const { store, done } = await tx(STORE_SYNC_QUEUE, "readonly");
  const count = await requestToPromise(store.count());
  await done;
  return count;
}
