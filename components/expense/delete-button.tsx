"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

interface DeleteButtonProps {
  transactionId: string;
}

const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function DeleteButton({ transactionId }: DeleteButtonProps) {
  const queryClient = useQueryClient();
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
    removeTransaction(transactionId);

    try {
      await mutation.mutateAsync(transactionId);
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      setConfirm(false);
    } catch {
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      setConfirm(false);
    }
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
          {mutation.isPending ? "..." : "Delete"}
        </Button>
        <Button
          id={`cancel-delete-${transactionId}`}
          variant="ghost"
          size="sm"
          onClick={() => setConfirm(false)}
          className="h-8 px-2 text-xs"
        >
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </Button>
  );
}
