"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO, endOfMonth, startOfMonth, subMonths, differenceInDays } from "date-fns";
import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatCurrency, type Transaction } from "@/lib/transactions";
import { getAllTransactions, onTransactionsChange } from "@/lib/indexeddb";
import { useAppStore } from "@/store/app-store";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import {
    ChartColumnIncreasing,
    PieChart,
    TrendingDown,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    BarChart3,
    LineChart,
    Activity,
    Target,
    Layers,
    Minus,
    ChevronsUpDown,
    ChevronDown,
} from "lucide-react";

interface ReportsViewProps {
    initialTransactions: Transaction[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

function pct(value: number, total: number) {
    return total === 0 ? 0 : Math.round((value / total) * 100);
}

function deltaLabel(current: number, prev: number) {
    if (prev === 0) return null;
    const change = ((current - prev) / prev) * 100;
    return { change: Math.abs(change).toFixed(1), up: change >= 0 };
}

// ─── sub-components ─────────────────────────────────────────────────────────

function StatCard({
                      icon: Icon,
                      iconClass,
                      label,
                      value,
                      delta,
                      footer,
                  }: {
    icon: React.ElementType;
    iconClass?: string;
    label: string;
    value: string;
    delta?: { change: string; up: boolean } | null;
    footer?: string;
}) {
    return (
        <Card className="relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            {/* decorative gradient corner */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
                        <span className="text-2xl font-bold tabular-nums tracking-tight">{value}</span>
                    </div>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass ?? "bg-primary/10"}`}>
            <Icon className={`h-5 w-5 ${iconClass ? "" : "text-primary"}`} />
          </span>
                </div>
                {(delta || footer) && (
                    <div className="mt-3 flex items-center gap-2">
                        {delta && (
                            <Badge
                                variant="outline"
                                className={`gap-1 text-[11px] font-semibold ${
                                    delta.up
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}
                            >
                                {delta.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {delta.change}%
                            </Badge>
                        )}
                        {footer && <span className="text-[11px] text-muted-foreground">{footer}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CategoryRow({ label, value, total, index }: { label: string; value: number; total: number; index: number }) {
    const colors = [
        "bg-violet-500",
        "bg-sky-500",
        "bg-emerald-500",
        "bg-amber-500",
        "bg-rose-500",
        "bg-indigo-500",
        "bg-teal-500",
        "bg-orange-500",
    ];
    const barColors = [
        "bg-violet-500/80",
        "bg-sky-500/80",
        "bg-emerald-500/80",
        "bg-amber-500/80",
        "bg-rose-500/80",
        "bg-indigo-500/80",
        "bg-teal-500/80",
        "bg-orange-500/80",
    ];
    const color = colors[index % colors.length];
    const barColor = barColors[index % barColors.length];
    const percentage = pct(value, total);

    return (
        <div className="group flex flex-col gap-1.5 rounded-xl p-3 transition-colors hover:bg-muted/40">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                    <span className="truncate text-sm font-medium">{label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                    <span className="min-w-[80px] text-right text-sm font-semibold tabular-nums">{formatCurrency(value)}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                        className={`h-full rounded-full ${barColor} transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── main component ──────────────────────────────────────────────────────────

export function ReportsView({ initialTransactions }: ReportsViewProps) {
    const hasLoadedTransactions = useAppStore((state) => state.hasLoadedTransactions);
    const storedTransactions = useAppStore((state) => state.transactions);
    const setTransactions = useAppStore((state) => state.setTransactions);
    const activeTransactions = hasLoadedTransactions ? storedTransactions : initialTransactions;

    useEffect(() => {
        async function syncTransactionsFromIDB() {
            try {
                const idbTransactions = await getAllTransactions();
                if (idbTransactions.length > 0) {
                    setTransactions(idbTransactions as unknown as Transaction[]);
                } else {
                    setTransactions(initialTransactions);
                }
            } catch {
                setTransactions(initialTransactions);
            }
        }

        void syncTransactionsFromIDB();
        return onTransactionsChange(() => {
            void syncTransactionsFromIDB();
        });
    }, [initialTransactions, setTransactions]);

    const months = useMemo(() => {
        const uniqueMonths = new Set<string>();
        activeTransactions.forEach((t) => {
            uniqueMonths.add(format(new Date(t.date), "yyyy-MM"));
        });
        return Array.from(uniqueMonths).sort().reverse();
    }, [activeTransactions]);

    const [selectedMonth, setSelectedMonth] = useState(months.length > 0 ? months[0] : format(new Date(), "yyyy-MM"));
    const [dailyVisibleCount, setDailyVisibleCount] = useState(10);

    useEffect(() => {
        if (selectedMonth !== "ALL" && months.length > 0 && !months.includes(selectedMonth)) {
            setSelectedMonth(months[0]);
        }
    }, [months, selectedMonth]);

    // current period transactions
    const transactions = useMemo(() => {
        if (selectedMonth === "ALL") return activeTransactions;
        return activeTransactions.filter((t) => format(new Date(t.date), "yyyy-MM") === selectedMonth);
    }, [activeTransactions, selectedMonth]);

    // previous period transactions (for delta)
    const prevTransactions = useMemo(() => {
        if (selectedMonth === "ALL") return [];
        const [y, m] = selectedMonth.split("-").map(Number);
        const prevDate = subMonths(new Date(y, m - 1, 1), 1);
        const prevKey = format(prevDate, "yyyy-MM");
        return activeTransactions.filter((t) => format(new Date(t.date), "yyyy-MM") === prevKey);
    }, [activeTransactions, selectedMonth]);

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

    const prevSummary = useMemo(() => {
        return prevTransactions.reduce(
            (acc, t) => {
                if (t.type === "IN") acc.income += t.amount;
                else acc.expenses += t.amount;
                return acc;
            },
            { income: 0, expenses: 0 }
        );
    }, [prevTransactions]);

    // category breakdown
    const categoryData = useMemo(() => {
        const categories = new Map<string, number>();
        transactions.forEach((t) => {
            if (t.type === "OUT") {
                const cat = t.category?.trim() || "Uncategorized";
                categories.set(cat, (categories.get(cat) || 0) + t.amount);
            }
        });
        return Array.from(categories.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // income category breakdown
    const incomeCategoryData = useMemo(() => {
        const categories = new Map<string, number>();
        transactions.forEach((t) => {
            if (t.type === "IN") {
                const cat = t.category?.trim() || "Other";
                categories.set(cat, (categories.get(cat) || 0) + t.amount);
            }
        });
        return Array.from(categories.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // daily spending bar chart
    const dailyData = useMemo(() => {
        const days = new Map<string, number>();
        if (selectedMonth !== "ALL") {
            const [y, m] = selectedMonth.split("-").map(Number);
            const end = endOfMonth(new Date(y, m - 1, 1));
            for (let d = 1; d <= end.getDate(); d++) {
                days.set(format(new Date(y, m - 1, d), "MMM d"), 0);
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

    // weekly aggregation
    const weeklyData = useMemo(() => {
        const weeks = new Map<string, { income: number; expenses: number }>();
        transactions.forEach((t) => {
            const d = new Date(t.date);
            const weekNum = Math.ceil(d.getDate() / 7);
            const label = `Week ${weekNum}`;
            const existing = weeks.get(label) ?? { income: 0, expenses: 0 };
            if (t.type === "IN") existing.income += t.amount;
            else existing.expenses += t.amount;
            weeks.set(label, existing);
        });
        return Array.from(weeks.entries()).map(([label, v]) => ({
            label,
            value: v.expenses,
            income: v.income,
        }));
    }, [transactions]);

    // top merchants / descriptions
    const topMerchants = useMemo(() => {
        const merchants = new Map<string, { count: number; total: number }>();
        transactions.forEach((t) => {
            if (t.type === "OUT" && t.note) {
                const key = t.note.trim();
                const existing = merchants.get(key) ?? { count: 0, total: 0 };
                existing.count += 1;
                existing.total += t.amount;
                merchants.set(key, existing);
            }
        });
        return Array.from(merchants.entries())
            .map(([name, v]) => ({ name, ...v }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [transactions]);

    // daily report rows
    const reportRows = useMemo(() => {
        const accumulator = new Map<string, any>();
        transactions.forEach((t) => {
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

    // savings rate
    const savingsRate = summary.income > 0 ? pct(summary.income - summary.expenses, summary.income) : 0;

    // avg daily spend
    const avgDailySpend = useMemo(() => {
        if (transactions.length === 0) return 0;
        const dates = transactions.map((t) => new Date(t.date).getTime());
        const span = Math.max(1, differenceInDays(new Date(Math.max(...dates)), new Date(Math.min(...dates))) + 1);
        return summary.expenses / span;
    }, [transactions, summary.expenses]);

    const totalExpenses = categoryData.reduce((s, c) => s + c.value, 0);
    const totalIncome = incomeCategoryData.reduce((s, c) => s + c.value, 0);

    return (
        <div className="space-y-6">
            {/* ── Period Selector ── */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">

                    {/* Label + Select group */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-semibold">Period</span>
                        </div>

                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-full sm:w-[200px] font-medium">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Time</SelectItem>
                                {months.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {format(parseISO(m + "-01"), "MMMM yyyy")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Badge */}
                    {selectedMonth !== "ALL" && (
                        <div className="flex sm:justify-end">
                            <Badge variant="secondary" className="text-xs w-fit">
                                {transactions.length} transactions
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* ── KPI Cards ── */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={TrendingUp}
                    iconClass="bg-emerald-500/10 text-emerald-500"
                    label="Total Income"
                    value={formatCurrency(summary.income)}
                    delta={deltaLabel(summary.income, prevSummary.income)}
                    footer="vs last month"
                />
                <StatCard
                    icon={TrendingDown}
                    iconClass="bg-rose-500/10 text-rose-500"
                    label="Total Expenses"
                    value={formatCurrency(summary.expenses)}
                    delta={
                        deltaLabel(summary.expenses, prevSummary.expenses)
                            ? { ...deltaLabel(summary.expenses, prevSummary.expenses)!, up: !deltaLabel(summary.expenses, prevSummary.expenses)!.up }
                            : null
                    }
                    footer="vs last month"
                />
                <StatCard
                    icon={Wallet}
                    iconClass={summary.income >= summary.expenses ? "bg-sky-500/10 text-sky-500" : "bg-amber-500/10 text-amber-500"}
                    label="Net Balance"
                    value={formatCurrency(summary.income - summary.expenses)}
                />
                <StatCard
                    icon={Activity}
                    iconClass="bg-violet-500/10 text-violet-500"
                    label="Avg Daily Spend"
                    value={formatCurrency(avgDailySpend)}
                    footer={`${reportRows.length} active days`}
                />
            </div>

            {/* ── Savings Rate ── */}
            {summary.income > 0 && (
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Target className="h-5 w-5 text-violet-500" />
                </span>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Savings Rate</p>
                                    <p className="text-xl font-bold">{savingsRate}%</p>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <Progress
                                    value={Math.max(0, savingsRate)}
                                    className="h-3"
                                />
                            </div>
                            <Badge
                                variant="outline"
                                className={`shrink-0 text-xs font-semibold ${
                                    savingsRate >= 20
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : savingsRate >= 0
                                            ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                            : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}
                            >
                                {savingsRate >= 20 ? "On Track" : savingsRate >= 0 ? "Moderate" : "Over Budget"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Tabs: Charts ── */}
            <Tabs defaultValue="overview" className="space-y-4 flex flex-col">
                <TabsList
                    className="
    grid w-full grid-cols-5 gap-2
    rounded-xl bg-muted/50 p-1.5
    sm:grid-cols-5
  "
                >
                    {[
                        { value: "overview", label: "Overview", icon: BarChart3 },
                        { value: "categories", label: "Categories", icon: PieChart },
                        { value: "trends", label: "Trends", icon: LineChart },
                        { value: "merchants", label: "Merchants", icon: Layers },
                        { value: "daily", label: "Daily", icon: Calendar },
                    ].map(({ value, label, icon: Icon }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className="
        flex flex-col items-center justify-center gap-1
        rounded-lg px-2 py-2.5
        text-[11px] font-medium leading-none
        transition-all duration-200

        text-muted-foreground
        hover:text-foreground

        data-[state=active]:bg-background
        data-[state=active]:text-foreground
        data-[state=active]:shadow-md
        data-[state=active]:ring-1
        data-[state=active]:ring-border

        sm:flex-row sm:gap-2 sm:px-3 sm:py-2 sm:text-sm
      "
                        >
                            <Icon
                                className="
          h-4 w-4 shrink-0
          transition-colors
          data-[state=active]:text-primary
        "
                            />
                            <span className="truncate">{label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {/* ── OVERVIEW TAB ── */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm flex flex-col">
                            <CardHeader className="border-b border-border/40 p-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <PieChart className="h-4 w-4 text-primary" />
                                    Expense Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-1 items-center justify-center p-6">
                                {categoryData.length > 0 ? (
                                    <DonutChart data={categoryData} />
                                ) : (
                                    <p className="text-sm text-muted-foreground">No expenses this period</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm flex flex-col">
                            <CardHeader className="border-b border-border/40 p-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <ChartColumnIncreasing className="h-4 w-4 text-primary" />
                                    Daily Expenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-1 items-end p-6">
                                <BarChart data={dailyData} height={200} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Income vs Expense summary bar */}
                    {(summary.income > 0 || summary.expenses > 0) && (
                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="border-b border-border/40 p-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <ChevronsUpDown className="h-4 w-4 text-primary" />
                                    Income vs Expenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Income
                    </span>
                                        <span className="font-semibold tabular-nums">{formatCurrency(summary.income)}</span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-emerald-500/80 transition-all duration-700"
                                            style={{ width: `${pct(summary.income, Math.max(summary.income, summary.expenses))}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Expenses
                    </span>
                                        <span className="font-semibold tabular-nums">{formatCurrency(summary.expenses)}</span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-rose-500/80 transition-all duration-700"
                                            style={{ width: `${pct(summary.expenses, Math.max(summary.income, summary.expenses))}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ── CATEGORIES TAB ── */}
                <TabsContent value="categories" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Expense categories */}
                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="border-b border-border/40 p-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <TrendingDown className="h-4 w-4 text-rose-500" />
                                    Expense Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                {categoryData.length > 0 ? (
                                    <div className="space-y-1">
                                        {categoryData.map((cat, i) => (
                                            <CategoryRow key={cat.label} label={cat.label} value={cat.value} total={totalExpenses} index={i} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="p-4 text-center text-sm text-muted-foreground">No expense data</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Income categories */}
                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="border-b border-border/40 p-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    Income Sources
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                {incomeCategoryData.length > 0 ? (
                                    <div className="space-y-1">
                                        {incomeCategoryData.map((cat, i) => (
                                            <CategoryRow key={cat.label} label={cat.label} value={cat.value} total={totalIncome} index={i} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="p-4 text-center text-sm text-muted-foreground">No income data</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── TRENDS TAB ── */}
                <TabsContent value="trends" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="border-b border-border/40 p-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    Weekly Expenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-end p-6">
                                <BarChart data={weeklyData} height={200} />
                            </CardContent>
                        </Card>

                        {/* Month-over-month comparison */}
                        {prevSummary.income > 0 || prevSummary.expenses > 0 ? (
                            <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                                <CardHeader className="border-b border-border/40 p-4">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Activity className="h-4 w-4 text-primary" />
                                        Month-over-Month
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-6">
                                    {[
                                        {
                                            label: "Income",
                                            current: summary.income,
                                            prev: prevSummary.income,
                                            color: "text-emerald-500",
                                            bgColor: "bg-emerald-500/10",
                                        },
                                        {
                                            label: "Expenses",
                                            current: summary.expenses,
                                            prev: prevSummary.expenses,
                                            color: "text-rose-500",
                                            bgColor: "bg-rose-500/10",
                                        },
                                        {
                                            label: "Net",
                                            current: summary.income - summary.expenses,
                                            prev: prevSummary.income - prevSummary.expenses,
                                            color: "text-sky-500",
                                            bgColor: "bg-sky-500/10",
                                        },
                                    ].map((item) => {
                                        const d = deltaLabel(item.current, item.prev);
                                        return (
                                            <div key={item.label} className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                                                    {d && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`gap-1 text-[11px] font-semibold ${
                                                                d.up
                                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                            }`}
                                                        >
                                                            {d.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                            {d.change}%
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-baseline gap-2">
                          <span className={`text-lg font-bold tabular-nums ${item.color}`}>
                            {formatCurrency(item.current)}
                          </span>
                                                    <span className="text-xs text-muted-foreground">
                            vs {formatCurrency(item.prev)}
                          </span>
                                                </div>
                                                <Separator />
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-border/40 bg-card/60 backdrop-blur-sm flex items-center justify-center p-8">
                                <p className="text-sm text-muted-foreground text-center">
                                    No previous month data available for comparison.
                                </p>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ── TOP MERCHANTS TAB ── */}
                <TabsContent value="merchants">
                    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/40 p-4">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Layers className="h-4 w-4 text-primary" />
                                Top 5 Merchants by Spend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {topMerchants.length > 0 ? (
                                <div className="divide-y divide-border/40">
                                    {topMerchants.map((m, i) => (
                                        <div
                                            key={m.name}
                                            className="flex flex-col gap-1 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          #{i + 1}
                        </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">{m.name}</p>
                                                    <p className="text-xs text-muted-foreground">{m.count} transaction{m.count !== 1 ? "s" : ""}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                                <span className="text-base font-bold tabular-nums">{formatCurrency(m.total)}</span>
                                                <span className="text-xs text-muted-foreground">
                          avg {formatCurrency(m.total / m.count)}/txn
                        </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="p-8 text-center text-sm text-muted-foreground">No merchant data available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── DAILY LOG TAB ── */}
                <TabsContent value="daily">
                    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/40 p-4">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Calendar className="h-4 w-4 text-primary" />
                                Daily Transaction Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {reportRows.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">No transactions for this period.</div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {reportRows.slice(0, dailyVisibleCount).map((row) => {
                                        const net = row.totalIn - row.totalOut;
                                        return (
                                            <div
                                                key={row.key}
                                                className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold tabular-nums">
                                                        {format(new Date(row.key), "d")}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{row.label}</p>
                                                        <p className="text-xs text-muted-foreground">{row.count} transaction{row.count !== 1 ? "s" : ""}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 pl-12 sm:pl-0">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">In</p>
                                                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(row.totalIn)}</p>
                                                    </div>
                                                    <div className="h-8 w-px bg-border/60" />
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Out</p>
                                                        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{formatCurrency(row.totalOut)}</p>
                                                    </div>
                                                    <div className="h-8 w-px bg-border/60" />
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Net</p>
                                                        <p className={`flex items-center gap-0.5 text-sm font-bold tabular-nums ${
                                                            net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                        }`}>
                                                            {net > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : net < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                                                            {formatCurrency(Math.abs(net))}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {dailyVisibleCount < reportRows.length && (
                                <div className="border-t border-border/40 p-4 flex justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDailyVisibleCount(prev => prev + 10)}
                                        className="rounded-full shadow-sm bg-background/50 hover:bg-muted"
                                    >
                                        Load More
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
