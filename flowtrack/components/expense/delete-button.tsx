"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  expenseId: string;
  onDeleted: () => void;
}

export function DeleteButton({ expenseId, onDeleted }: DeleteButtonProps) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted();
      }
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <Button
          id={`confirm-delete-${expenseId}`}
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
        >
          {loading ? "…" : "Delete"}
        </Button>
        <Button
          id={`cancel-delete-${expenseId}`}
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
      id={`delete-expense-${expenseId}`}
      variant="ghost"
      size="sm"
      onClick={() => setConfirm(true)}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      aria-label="Delete expense"
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
