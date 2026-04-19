"use client";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "./delete-button";
import { formatCurrency, formatTransactionDate, type Transaction } from "@/lib/transactions";

interface ExpenseRowProps {
  expense: Transaction;
}

export function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40 relative h-full">
      <div className="flex items-start justify-between gap-3">
        <Badge
          className={
            expense.type === "IN"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10"
              : "border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/10"
          }
        >
          {expense.type}
        </Badge>
        <p
          className={
            expense.type === "IN"
              ? "text-lg font-bold text-emerald-600"
              : "text-lg font-bold text-rose-600"
          }
        >
          {expense.type === "IN" ? "+" : "-"}
          {formatCurrency(expense.amount)}
        </p>
      </div>

      <div className="min-w-0 flex-grow">
        <p className="text-base font-semibold text-foreground mb-1">{expense.category}</p>
        <p className="text-sm text-muted-foreground break-words line-clamp-2">
          {expense.note || "No note"}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground font-medium">{formatTransactionDate(expense.date)}</span>
        <DeleteButton transactionId={expense.id} />
      </div>
    </div>
  );
}

export function ExpenseTableRow({ expense }: ExpenseRowProps) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/40 transition-colors last:border-0">
      <td className="px-4 py-3 align-middle">
        <Badge
          className={
            expense.type === "IN"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10"
              : "border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/10"
          }
        >
          {expense.type}
        </Badge>
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground whitespace-nowrap">
        {formatTransactionDate(expense.date)}
      </td>
      <td className="px-4 py-3 align-middle text-sm font-semibold text-foreground whitespace-nowrap">
        {expense.category}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground max-w-xs truncate">
        {expense.note || <span className="text-muted-foreground/50 italic">No note</span>}
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <span
          className={
            expense.type === "IN"
              ? "text-sm font-bold text-emerald-600 whitespace-nowrap"
              : "text-sm font-bold text-rose-600 whitespace-nowrap"
          }
        >
          {expense.type === "IN" ? "+" : "-"}
          {formatCurrency(expense.amount)}
        </span>
      </td>
      <td className="px-4 py-3 align-middle text-center w-14">
        <DeleteButton transactionId={expense.id} />
      </td>
    </tr>
  );
}
