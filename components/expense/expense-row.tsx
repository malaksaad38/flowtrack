"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, StickyNote, Pencil } from "lucide-react";
import { DeleteButton } from "./delete-button";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { formatCurrency, formatTransactionDate, type Transaction } from "@/lib/transactions";

interface ExpenseRowProps {
  expense: Transaction;
}

export function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-border hover:bg-muted/30 relative h-full">
      <div className="flex items-start justify-between gap-3">
        <Badge
          className={
            expense.type === "IN"
              ? "border-primary/20 bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors"
              : "border-destructive/20 bg-destructive/10 text-destructive group-hover:bg-destructive/15 transition-colors"
          }
        >
          {expense.type}
        </Badge>
        <p
          className={
            expense.type === "IN"
              ? "text-xl font-bold text-primary tracking-tight"
              : "text-xl font-bold text-destructive tracking-tight"
          }
        >
          {expense.type === "IN" ? "+" : "-"}
          {formatCurrency(expense.amount)}
        </p>
      </div>

      <div className="min-w-0 flex-grow mt-1">
        <p className="text-base font-bold text-foreground mb-1 tracking-tight">{expense.category}</p>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground leading-relaxed break-words line-clamp-2">
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {expense.note || "No note"}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatTransactionDate(expense.date)}
        </span>
        <div className="flex items-center gap-1">
          <EditExpenseDialog expense={expense}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              aria-label="Edit transaction"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </EditExpenseDialog>
          <DeleteButton transactionId={expense.id} />
        </div>
      </div>
    </div>
  );
}

export function ExpenseTableRow({ expense }: ExpenseRowProps) {
  return (
    <tr className="group/row border-b border-border/40 hover:bg-muted/40 transition-colors last:border-0">
      <td className="px-5 py-4 align-middle">
        <Badge
          className={
            expense.type === "IN"
              ? "border-primary/20 bg-primary/10 text-primary group-hover/row:bg-primary/20 transition-colors"
              : "border-destructive/20 bg-destructive/10 text-destructive group-hover/row:bg-destructive/20 transition-colors"
          }
        >
          {expense.type}
        </Badge>
      </td>
      <td className="px-5 py-4 align-middle text-sm text-muted-foreground/90 whitespace-nowrap font-medium">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatTransactionDate(expense.date)}
        </span>
      </td>
      <td className="px-5 py-4 align-middle text-sm font-bold text-foreground whitespace-nowrap tracking-tight">
        {expense.category}
      </td>
      <td className="px-5 py-4 align-middle text-sm text-muted-foreground/90 max-w-xs truncate">
        <span className="inline-flex items-center gap-1.5">
          <StickyNote className="h-3.5 w-3.5 shrink-0" />
          {expense.note || <span className="text-muted-foreground/40 italic font-medium">No note</span>}
        </span>
      </td>
      <td className="px-5 py-4 align-middle text-right">
        <span
          className={
            expense.type === "IN"
              ? "text-base font-bold text-primary whitespace-nowrap tracking-tight"
              : "text-base font-bold text-destructive whitespace-nowrap tracking-tight"
          }
        >
          {expense.type === "IN" ? "+" : "-"}
          {formatCurrency(expense.amount)}
        </span>
      </td>
      <td className="px-5 py-4 align-middle text-right w-20">
        <div className="flex items-center justify-end gap-1">
          <EditExpenseDialog expense={expense}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              aria-label="Edit transaction"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </EditExpenseDialog>
          <DeleteButton transactionId={expense.id} />
        </div>
      </td>
    </tr>
  );
}
