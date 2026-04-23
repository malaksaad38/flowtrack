/**
 * React hook for monitoring sync engine status.
 */

import { useEffect, useState } from "react";
import { onSyncStatusChange, type SyncStatus } from "./sync-engine";

interface SyncState {
  status: SyncStatus;
  pending: number;
}

export function useSyncStatus(): SyncState {
  const [state, setState] = useState<SyncState>({
    status: "idle",
    pending: 0,
  });

  useEffect(() => {
    const unsubscribe = onSyncStatusChange((status, pending) => {
      setState({ status, pending });
    });
    return unsubscribe;
  }, []);

  return state;
}
