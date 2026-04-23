"use client";

import { useMemo, useState } from "react";
import { format, parseISO, endOfMonth } from "date-fns";
import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, type Transaction } from "@/lib/transactions";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { ChartColumnIncreasing, PieChart, TrendingDown, TrendingUp, Calendar } from "lucide-react";

interface ReportsViewProps {
  initialTransactions: Transaction[];
}

export function ReportsView({ initialTransactions }: ReportsViewProps) {
  const months = useMemo(() => {
    const uniqueMonths = new Set<string>();
    initialTransactions.forEach((t) => {
      uniqueMonths.add(format(new Date(t.date), "yyyy-MM"));
    });
    return Array.from(uniqueMonths).sort().reverse();
  }, [initialTransactions]);

  const [selectedMonth, setSelectedMonth] = useState(
    months.length > 0 ? months[0] : format(new Date(), "yyyy-MM")
  );

  const transactions = useMemo(() => {
    if (selectedMonth === "ALL") return initialTransactions;
    return initialTransactions.filter((t) => format(new Date(t.date), "yyyy-MM") === selectedMonth);
  }, [initialTransactions, selectedMonth]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "IN") acc.income += t.amount;
        else acc.expenses += t.amount;
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.type === "OUT") {
        const cat = t.category.trim() || "Uncategorized";
        categories.set(cat, (categories.get(cat) || 0) + t.amount);
      }
    });
    return Array.from(categories.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const dailyData = useMemo(() => {
    const days = new Map<string, number>();
    if (selectedMonth !== "ALL") {
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]) - 1;
      const date = new Date(year, month, 1);
      const end = endOfMonth(date);
      for (let d = 1; d <= end.getDate(); d++) {
        days.set(format(new Date(year, month, d), "MMM d"), 0);
      }
    }

    transactions.forEach((t) => {
      if (t.type === "OUT") {
        const label = format(new Date(t.date), "MMM d");
        days.set(label, (days.get(label) || 0) + t.amount);
      }
    });

    return Array.from(days.entries()).map(([label, value]) => ({ label, value }));
  }, [transactions, selectedMonth]);

  const reportRows = useMemo(() => {
    const accumulator = new Map<string, any>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = format(date, "yyyy-MM-dd");
      const label = format(date, "EEE, MMM d, yyyy");

      const row = accumulator.get(key) ?? { key, label, count: 0, totalIn: 0, totalOut: 0 };
      row.count += 1;
      if (t.type === "IN") row.totalIn += t.amount;
      else row.totalOut += t.amount;
      accumulator.set(key, row);
    });
    return Array.from(accumulator.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [transactions]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-background/40 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Period</span>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Time</SelectItem>
              {months.map(m => (
                <SelectItem key={m} value={m}>
                  {format(parseISO(m + "-01"), "MMMM yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-background/40 backdrop-blur-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{formatCurrency(summary.income)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-background/40 backdrop-blur-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{formatCurrency(summary.expenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-background/40 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ChartColumnIncreasing className="h-4 w-4" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{formatCurrency(summary.income - summary.expenses)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-background/40 backdrop-blur-sm flex flex-col">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <DonutChart data={categoryData} />
            ) : (
              <p className="text-sm text-muted-foreground">No expenses for this period</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/40 backdrop-blur-sm flex flex-col">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <ChartColumnIncreasing className="h-4 w-4 text-primary" />
              Daily Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex items-end">
            <BarChart data={dailyData} height={200} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-background/40 backdrop-blur-sm">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Daily Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions for this period.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {reportRows.map((row) => (
                <div key={row.key} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.count} transactions</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">In</p>
                      <p className="font-medium text-primary">{formatCurrency(row.totalIn)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Out</p>
                      <p className="font-medium text-destructive">{formatCurrency(row.totalOut)}</p>
                    </div>
                    <div className="text-right pl-4 border-l border-border/50">
                      <p className="text-xs text-muted-foreground">Net</p>
                      <p className="font-medium">{formatCurrency(row.totalIn - row.totalOut)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
