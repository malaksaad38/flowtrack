"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, X } from "lucide-react";
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
