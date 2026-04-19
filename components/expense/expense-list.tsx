"use client";

import { ExpenseRow } from "./expense-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">Clean, fast cashbook history.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{formatCurrency(totalForFilter)}</span>
            <span className="ml-1.5">({transactions.length} items)</span>
            {isRefreshing ? <span className="ml-2 text-xs">Refreshing...</span> : null}
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
                {type}
              </Button>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {isRefreshing && visibleTransactions.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : visibleTransactions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="font-medium text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground/70">Add your first IN or OUT entry above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleTransactions.map((transaction) => (
              <ExpenseRow key={transaction.id} expense={transaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
