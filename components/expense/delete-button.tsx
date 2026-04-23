"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { deleteTransaction as deleteFromIDB, addToSyncQueue } from "@/lib/indexeddb";
import { useNetworkStatus } from "@/lib/use-network-status";

interface DeleteButtonProps {
  transactionId: string;
}

const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function DeleteButton({ transactionId }: DeleteButtonProps) {
  const queryClient = useQueryClient();
  const isOnline = useNetworkStatus();
  const removeTransaction = useAppStore((state) => state.removeTransaction);
  const [confirm, setConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch(`/api/transactions/${transactionId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Could not delete transaction.");
      }
    },
  });

  async function handleDelete() {
    // Always remove from local state immediately
    removeTransaction(transactionId);

    // Always remove from IndexedDB
    await deleteFromIDB(transactionId);

    if (isOnline && !transactionId.startsWith("temp-")) {
      // Online: delete from server
      try {
        await mutation.mutateAsync(transactionId);
        await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      } catch {
        // Server failed — queue for sync
        await addToSyncQueue({
          action: "delete",
          payload: { id: transactionId },
          createdAt: new Date().toISOString(),
          retries: 0,
        });
      }
    } else if (!transactionId.startsWith("temp-")) {
      // Offline: queue for later sync
      await addToSyncQueue({
        action: "delete",
        payload: { id: transactionId },
        createdAt: new Date().toISOString(),
        retries: 0,
      });
    }
    // If it's a temp- ID, it was never on the server, so just removing locally is enough

    setConfirm(false);
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <Button
          id={`confirm-delete-${transactionId}`}
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={mutation.isPending}
          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
        >
          <Check className="h-3.5 w-3.5" />
          {mutation.isPending ? "..." : "Delete"}
        </Button>
        <Button
          id={`cancel-delete-${transactionId}`}
          variant="ghost"
          size="sm"
          onClick={() => setConfirm(false)}
          className="h-8 px-2 text-xs"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      id={`delete-transaction-${transactionId}`}
      variant="ghost"
      size="sm"
      onClick={() => setConfirm(true)}
      className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      aria-label="Delete transaction"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
