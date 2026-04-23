"use client";

/**
 * SyncStatusBar — a small floating indicator that shows:
 *  - Offline status (amber)
 *  - Syncing progress (blue)
 *  - Sync errors (red)
 *  - Nothing when idle & online
 */

import { useNetworkStatus } from "@/lib/use-network-status";
import { useSyncStatus } from "@/lib/use-sync-status";
import { processSyncQueue } from "@/lib/sync-engine";
import {
  CloudOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

export function SyncStatusBar() {
  const isOnline = useNetworkStatus();
  const { status, pending } = useSyncStatus();
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Show success message briefly after sync completes
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    }

    if (isOnline && wasOffline) {
      setShowSuccess(true);
      setWasOffline(false);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Show success after sync completes from syncing state
  useEffect(() => {
    if (status === "idle" && pending === 0 && showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, pending, showSuccess]);

  // Don't show anything when everything is fine
  if (isOnline && status === "idle" && !showSuccess) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none">
      <div className="pointer-events-auto mt-2 mx-4 max-w-sm w-full">
        {/* Offline */}
        {!isOnline && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-300/50 bg-amber-50/95 dark:border-amber-600/30 dark:bg-amber-950/90 backdrop-blur-md px-4 py-2.5 shadow-lg shadow-amber-500/10">
            <CloudOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                You&apos;re offline
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Changes saved locally{pending > 0 ? ` · ${pending} pending` : ""}
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          </div>
        )}

        {/* Syncing */}
        {isOnline && status === "syncing" && (
          <div className="flex items-center gap-2.5 rounded-xl border border-blue-300/50 bg-blue-50/95 dark:border-blue-600/30 dark:bg-blue-950/90 backdrop-blur-md px-4 py-2.5 shadow-lg shadow-blue-500/10">
            <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 animate-spin" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                Syncing changes...
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400">
                {pending} {pending === 1 ? "item" : "items"} remaining
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {isOnline && status === "error" && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-300/50 bg-red-50/95 dark:border-red-600/30 dark:bg-red-950/90 backdrop-blur-md px-4 py-2.5 shadow-lg shadow-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-800 dark:text-red-200">
                Sync failed
              </p>
              <p className="text-[10px] text-red-600 dark:text-red-400">
                {pending} {pending === 1 ? "item" : "items"} couldn&apos;t sync
              </p>
            </div>
            <button
              onClick={() => processSyncQueue()}
              className="shrink-0 rounded-lg bg-red-100 dark:bg-red-900/40 px-2.5 py-1 text-[10px] font-semibold text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              <RefreshCw className="h-3 w-3 inline mr-1" />
              Retry
            </button>
          </div>
        )}

        {/* Back online success */}
        {isOnline && showSuccess && status === "idle" && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300/50 bg-emerald-50/95 dark:border-emerald-600/30 dark:bg-emerald-950/90 backdrop-blur-md px-4 py-2.5 shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                Back online
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                All changes synced
              </p>
            </div>
            <Wifi className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
