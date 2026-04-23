"use client";

/**
 * OfflineProvider — initializes service worker, sync engine,
 * and listens for background sync messages.
 */

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/sw-register";
import { initSyncEngine, processSyncQueue } from "@/lib/sync-engine";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
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
  }, []);

  return <>{children}</>;
}
