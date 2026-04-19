"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";
import { calculateTransactionSummary, formatCurrency, type Transaction } from "@/lib/transactions";

const TRANSACTIONS_QUERY_KEY = ["transactions"];

async function fetchTransactions() {
  const response = await fetch("/api/transactions", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load transactions.");
  }

  return (await response.json()) as Transaction[];
}

interface CashbookWorkspaceProps {
  initialTransactions: Transaction[];
  mode?: "dashboard" | "add" | "list";
}

export function CashbookWorkspace({
  initialTransactions,
  mode = "dashboard",
}: CashbookWorkspaceProps) {
  const hasLoadedTransactions = useAppStore((state) => state.hasLoadedTransactions);
  const transactions = useAppStore((state) => state.transactions);
  const setTransactions = useAppStore((state) => state.setTransactions);
  const activeTransactions = hasLoadedTransactions ? transactions : initialTransactions;
  const summary = calculateTransactionSummary(activeTransactions);

  const query = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: fetchTransactions,
    initialData: initialTransactions,
  });

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions, setTransactions]);

  useEffect(() => {
    if (query.data) {
      setTransactions(query.data);
    }
  }, [query.dataUpdatedAt, query.data, setTransactions]);

  if (mode === "list") {
    return <ExpenseList isRefreshing={query.isFetching} fallbackTransactions={activeTransactions} />;
  }

  if (mode === "add") {
    return (
      <div className="space-y-4">
        <ExpenseForm />
        <ExpenseList
          isRefreshing={query.isFetching}
          limit={5}
          showFilters={false}
          fallbackTransactions={activeTransactions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3  sm:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(summary.balance)}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Total IN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(summary.totalIn)}</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Total OUT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-destructive">{formatCurrency(summary.totalOut)}</p>
          </CardContent>
        </Card>
      </section>

      <ExpenseForm />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Daily Summary</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2 text-sm">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              IN {formatCurrency(summary.todayIn)}
            </span>
            <span className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-destructive">
              OUT {formatCurrency(summary.todayOut)}
            </span>
          </div>
        </CardHeader>
      </Card>

      <ExpenseList isRefreshing={query.isFetching} fallbackTransactions={activeTransactions} />
    </div>
  );
}
