"use client";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "./delete-button";
import { formatCurrency, formatTransactionDate, type Transaction } from "@/lib/transactions";

interface ExpenseRowProps {
  expense: Transaction;
}

export function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Badge
          className={
            expense.type === "IN"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10"
              : "border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/10"
          }
        >
          {expense.type}
        </Badge>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{expense.category}</p>
          <p className="truncate text-xs text-muted-foreground">
            {expense.note || "No note"} · {formatTransactionDate(expense.date)}
          </p>
        </div>
      </div>

      <p
        className={
          expense.type === "IN"
            ? "text-sm font-semibold text-emerald-600"
            : "text-sm font-semibold text-rose-600"
        }
      >
        {expense.type === "IN" ? "+" : "-"}
        {formatCurrency(expense.amount)}
      </p>

      <DeleteButton transactionId={expense.id} />
    </div>
  );
}
