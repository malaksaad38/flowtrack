"use client";

import { useCallback, useEffect, useState } from "react";
import { ExpenseRow } from "./expense-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { CATEGORIES, type Expense } from "@/lib/expense-types";

function currentMonthISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthOptions() {
  const opts: { label: string; value: string }[] = [{ label: "All time", value: "" }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-PK", { month: "long", year: "numeric" });
    opts.push({ label, value });
  }
  return opts;
}

export function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonthISO());
  const [category, setCategory] = useState("all");

  const monthOptions = buildMonthOptions();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month) params.set("month", month);
      if (category !== "all") params.set("category", category);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } finally {
      setLoading(false);
    }
  }, [month, category]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalForFilter = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <Select
          id="filter-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-44"
          aria-label="Filter by month"
        >
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>

        <Select
          id="filter-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-40"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        {!loading && (
          <div className="ml-auto flex items-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(totalForFilter)}
            </span>
            <span className="ml-1.5">({expenses.length} transactions)</span>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-medium text-muted-foreground">No expenses found</p>
          <p className="text-sm text-muted-foreground/70">Try changing your filters or add a new expense.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} onMutate={fetchExpenses} />
          ))}
        </div>
      )}
    </div>
  );
}
