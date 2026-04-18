"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditSheet } from "./edit-sheet";
import { DeleteButton } from "./delete-button";
import { getCategoryVariant, type Expense } from "@/lib/expense-types";

interface ExpenseRowProps {
  expense: Expense;
  onMutate: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);
}

export function ExpenseRow({ expense, onMutate }: ExpenseRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/40 transition-colors">
        {/* Category dot */}
        <div className="flex-shrink-0">
          <Badge variant={getCategoryVariant(expense.category)} className="text-xs">
            {expense.category}
          </Badge>
        </div>

        {/* Note + date */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {expense.note || <span className="text-muted-foreground italic">No note</span>}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
        </div>

        {/* Amount */}
        <p className="flex-shrink-0 text-sm font-semibold text-foreground">
          {formatAmount(expense.amount)}
        </p>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            id={`edit-expense-${expense.id}`}
            variant="ghost"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-8 w-8 p-0"
            aria-label="Edit expense"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
          <DeleteButton expenseId={expense.id} onDeleted={onMutate} />
        </div>
      </div>

      <EditSheet
        expense={expense}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          setEditOpen(false);
          onMutate();
        }}
      />
    </>
  );
}
