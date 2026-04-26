"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  return (
    <Dialog open={confirm} onOpenChange={setConfirm}>
      <DialogTrigger asChild>
        <Button
          id={`delete-transaction-${transactionId}`}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete transaction"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete transaction</DialogTitle>
          <DialogDescription>
            This removes the entry from your list now and syncs the deletion when possible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirm(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            id={`confirm-delete-${transactionId}`}
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
