"use client";

import { ExpenseRow, ExpenseTableRow } from "./expense-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Loader2, ReceiptText } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatCurrency, type Transaction } from "@/lib/transactions";

interface ExpenseListProps {
  isRefreshing?: boolean;
  limit?: number;
  showFilters?: boolean;
  fallbackTransactions?: Transaction[];
}

export function ExpenseList({
  isRefreshing = false,
  limit,
  showFilters = true,
  fallbackTransactions = [],
}: ExpenseListProps) {
  const hasLoadedTransactions = useAppStore((state) => state.hasLoadedTransactions);
  const filterType = useAppStore((state) => state.filterType);
  const setFilterType = useAppStore((state) => state.setFilterType);
  const getFilteredTransactions = useAppStore((state) => state.getFilteredTransactions);

  const transactions = hasLoadedTransactions
    ? getFilteredTransactions()
    : filterType === "ALL"
      ? fallbackTransactions
      : fallbackTransactions.filter((transaction) => transaction.type === filterType);
  const visibleTransactions = typeof limit === "number" ? transactions.slice(0, limit) : transactions;
  const totalForFilter = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="rounded-3xl border border-border/50 bg-background/40 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col pb-4">
      <CardHeader className="space-y-4 px-6 py-5 bg-muted/10 border-b border-border/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <ReceiptText className="h-5 w-5 text-primary" />
              Transactions
            </CardTitle>
            <p className="text-sm text-muted-foreground/80">Clean, fast cashbook history.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <CircleDollarSign className="mr-1 inline h-4 w-4" />
            <span className="font-medium text-foreground">{formatCurrency(totalForFilter)}</span>
            <span className="ml-1.5">({transactions.length} items)</span>
            {isRefreshing ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Refreshing...
              </span>
            ) : null}
          </div>
        </div>

        {showFilters ? (
          <div className="flex gap-2">
            {(["ALL", "IN", "OUT"] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                onClick={() => setFilterType(type)}
                className={
                  filterType === type
                    ? "rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    : "rounded-full"
                }
              >
                {type === "IN" ? <ArrowDownRight className="h-4 w-4" /> : null}
                {type === "OUT" ? <ArrowUpRight className="h-4 w-4" /> : null}
                {type}
              </Button>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {isRefreshing && visibleTransactions.length === 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
            <div className="hidden lg:block w-full">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </>
        ) : visibleTransactions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <ReceiptText className="h-8 w-8 text-muted-foreground/60" />
            <p className="font-medium text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground/70">Add your first IN or OUT entry above.</p>
          </div>
        ) : (
          <>
            {/* Mobile / Tablet View: Grid of Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
              {visibleTransactions.map((transaction) => (
                <ExpenseRow key={transaction.id} expense={transaction} />
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden lg:block w-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-bold tracking-wider text-muted-foreground uppercase bg-muted/40 border-b border-border/50">
                  <tr>
                    <th className="px-5 py-4 w-24">Type</th>
                    <th className="px-5 py-4 w-32">Date</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Note</th>
                    <th className="px-5 py-4 text-right w-36">Amount</th>
                    <th className="px-5 py-4 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((transaction) => (
                    <ExpenseTableRow key={transaction.id} expense={transaction} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </div>
  );
}
