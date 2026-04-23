"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Landmark, Sun } from "lucide-react";
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
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden border-primary/20 bg-background/50 backdrop-blur-lg shadow-md transition-all hover:shadow-lg hover:border-primary/30 ">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary/10 blur-3xl" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Landmark className="h-3.5 w-3.5" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{formatCurrency(summary.balance)}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/10 bg-background/50 backdrop-blur-lg shadow-sm transition-all hover:shadow-md hover:border-primary/20">
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-4 translate-x-4 rounded-full bg-primary/5 blur-2xl" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <ArrowDownRight className="h-3.5 w-3.5 text-primary" />
              Total IN
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{formatCurrency(summary.totalIn)}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-destructive/10 bg-background/50 backdrop-blur-lg shadow-sm transition-all hover:shadow-md hover:border-destructive/20">
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-4 translate-x-4 rounded-full bg-destructive/5 blur-2xl" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
              Total OUT
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-2xl font-extrabold tracking-tight text-destructive sm:text-3xl">{formatCurrency(summary.totalOut)}</p>
          </CardContent>
        </Card>
      </section>

      <ExpenseForm />

        <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sun className="h-4 w-4 text-primary" />
            Daily Summary
          </CardTitle>
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
