"use client";

/**
 * OfflineProvider — initializes service worker, sync engine,
 * and listens for background sync messages.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { registerServiceWorker } from "@/lib/sw-register";
import {
  initSyncEngine,
  processSyncQueue,
  TRANSACTIONS_SYNCED_EVENT,
} from "@/lib/sync-engine";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Initialize sync engine (sets up online/offline listeners)
    initSyncEngine();

    // Listen for sync requests from service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SYNC_REQUESTED") {
          processSyncQueue();
        }
      });
    }

    const handleTransactionsSynced = () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    };

    window.addEventListener(TRANSACTIONS_SYNCED_EVENT, handleTransactionsSynced);

    return () => {
      window.removeEventListener(TRANSACTIONS_SYNCED_EVENT, handleTransactionsSynced);
    };
  }, [queryClient]);

  return <>{children}</>;
}
