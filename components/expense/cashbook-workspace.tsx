"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowDownRight,
    ArrowUpRight,
    Landmark,
    CalendarDays,
    TrendingUp,
    TrendingDown,
    Loader2,
    CloudOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/app-store";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";
import {
    calculateTransactionSummary,
    formatCurrency,
    type Transaction,
} from "@/lib/transactions";
import { getAllTransactions, putAllTransactions } from "@/lib/indexeddb";
import { useNetworkStatus } from "@/lib/use-network-status";

const TRANSACTIONS_QUERY_KEY = ["transactions"];

async function fetchTransactions() {
    const response = await fetch("/api/transactions", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load transactions.");
    return (await response.json()) as Transaction[];
}

interface CashbookWorkspaceProps {
    initialTransactions: Transaction[];
    mode?: "dashboard" | "add" | "list";
}

/* ─── Stat Card ─────────────────────────────────────────────────── */
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    accent: "neutral" | "income" | "expense";
    trend?: string;
}

function StatCard({ title, value, icon, accent, trend }: StatCardProps) {
    const accentMap = {
        neutral: {
            border: "border-zinc-200 dark:border-zinc-700/60",
            glow: "from-zinc-100 to-transparent dark:from-zinc-800/40",
            iconBg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
            value: "text-zinc-900 dark:text-zinc-50",
            badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
        },
        income: {
            border: "border-emerald-200/60 dark:border-emerald-700/30",
            glow: "from-emerald-50 to-transparent dark:from-emerald-900/20",
            iconBg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
            value: "text-emerald-600 dark:text-emerald-400",
            badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        },
        expense: {
            border: "border-rose-200/60 dark:border-rose-700/30",
            glow: "from-rose-50 to-transparent dark:from-rose-900/20",
            iconBg: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
            value: "text-rose-600 dark:text-rose-400",
            badge: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
        },
    };

    const styles = accentMap[accent];

    return (
        <Card
            className={`relative overflow-hidden border ${styles.border} bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-200 group`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.glow} opacity-70 pointer-events-none`} />

            {/* ── Mobile: horizontal single-row layout ── */}
            <div className="relative z-10 flex items-center gap-3 px-4 py-3 sm:hidden">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}>
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 leading-none mb-1">
                        {title}
                    </p>
                    <p className={`text-lg font-bold tracking-tight truncate ${styles.value}`}>{value}</p>
                </div>
                {trend && (
                    <p className={`shrink-0 text-[10px] font-medium rounded-full px-2 py-0.5 ${styles.badge}`}>
                        {trend}
                    </p>
                )}
            </div>

            {/* ── Desktop: stacked layout ── */}
            <CardHeader className="relative z-10 hidden sm:flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {title}
                </CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.iconBg} transition-transform group-hover:scale-105`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="relative z-10 hidden sm:block px-5 pb-5">
                <p className={`text-3xl font-bold tracking-tight ${styles.value}`}>{value}</p>
                {trend && (
                    <p className={`mt-1.5 text-[11px] font-medium rounded-full inline-flex items-center gap-1 px-2 py-0.5 ${styles.badge}`}>
                        {trend}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

/* ─── Daily Summary Strip ────────────────────────────────────────── */
interface DailySummaryProps {
    todayIn: number;
    todayOut: number;
}

function DailySummary({ todayIn, todayOut }: DailySummaryProps) {
    const net = todayIn - todayOut;
    const isPositive = net >= 0;

    return (
        <Card className="border border-zinc-200/80 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm">

            <CardContent className="px-4  sm:px-5 sm:py-4">
                <div className="flex sm:hidden items-center mb-3  gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Today
                </div>

                {/* ── Mobile: compact 3-column pill grid ── */}
                <div className="grid grid-cols-3 gap-2 sm:hidden">
                    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-2 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">IN</span>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums truncate w-full text-center">
              {formatCurrency(todayIn)}
            </span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 px-2 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">OUT</span>
                        <span className="text-sm font-bold text-rose-700 dark:text-rose-300 tabular-nums truncate w-full text-center">
              {formatCurrency(todayOut)}
            </span>
                    </div>
                    <div className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 ${isPositive ? "bg-zinc-50 dark:bg-zinc-800/50" : "bg-rose-50/50 dark:bg-rose-900/10"}`}>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">NET</span>
                        <span className={`text-sm font-bold tabular-nums w-full text-center flex items-center justify-center gap-0.5 ${isPositive ? "text-zinc-700 dark:text-zinc-200" : "text-rose-600 dark:text-rose-400"}`}>
              {isPositive
                  ? <TrendingUp className="h-3 w-3 shrink-0" />
                  : <TrendingDown className="h-3 w-3 shrink-0" />}
                            {formatCurrency(Math.abs(net))}
            </span>
                    </div>
                </div>

                {/* ── Desktop: horizontal pill row ── */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Today
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-700/30 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium text-xs px-3 py-1">
                            <ArrowDownRight className="h-3 w-3" />
                            IN {formatCurrency(todayIn)}
                        </Badge>
                        <Badge variant="secondary" className="gap-1.5 rounded-full border border-rose-200/60 bg-rose-50 text-rose-700 dark:border-rose-700/30 dark:bg-rose-900/20 dark:text-rose-400 font-medium text-xs px-3 py-1">
                            <ArrowUpRight className="h-3 w-3" />
                            OUT {formatCurrency(todayOut)}
                        </Badge>
                        <Separator orientation="vertical" className="h-4" />
                        <span className={`text-xs font-semibold flex items-center gap-1 ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {isPositive
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />}
                            Net {formatCurrency(Math.abs(net))}
            </span>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function CashbookWorkspace({
                                      initialTransactions,
                                      mode = "dashboard",
                                  }: CashbookWorkspaceProps) {
    const isOnline = useNetworkStatus();
    const hasLoadedTransactions = useAppStore((s) => s.hasLoadedTransactions);
    const transactions = useAppStore((s) => s.transactions);
    const setTransactions = useAppStore((s) => s.setTransactions);

    const activeTransactions = hasLoadedTransactions ? transactions : initialTransactions;
    const summary = calculateTransactionSummary(activeTransactions);

    const query = useQuery({
        queryKey: TRANSACTIONS_QUERY_KEY,
        queryFn: fetchTransactions,
        initialData: initialTransactions,
        // Don't refetch when offline
        enabled: isOnline,
    });

    // Load from IndexedDB on mount (instant offline-first data)
    useEffect(() => {
        async function loadFromIDB() {
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
        loadFromIDB();
    }, []);

    // When server data arrives, update both state and IndexedDB
    useEffect(() => {
        if (query.data && isOnline) {
            setTransactions(query.data);
            // Save to IndexedDB for offline access
            putAllTransactions(query.data as unknown as Record<string, unknown>[]).catch((err) =>
                console.error("[Workspace] Failed to cache transactions to IndexedDB:", err)
            );
        }
    }, [query.dataUpdatedAt, query.data, setTransactions, isOnline]);

    /* ── List mode ── */
    if (mode === "list") {
        return (
            <ExpenseList
                isRefreshing={query.isFetching}
                fallbackTransactions={activeTransactions}
            />
        );
    }

    /* ── Add mode ── */
    if (mode === "add") {
        return (
            <div className="space-y-3 sm:space-y-4">
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

    /* ── Dashboard mode ── */
    return (
        <div className="space-y-2.5 sm:space-y-5">
            {/* Syncing indicator */}
            {query.isFetching && (
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Syncing…
                </div>
            )}

            {/* Offline data notice */}
            {!isOnline && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <CloudOff className="h-3 w-3" />
                    Showing cached data
                </div>
            )}

            {/* Stat Cards — stacked on mobile, 3-col on sm+ */}
            <section className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                <StatCard
                    title="Total Balance"
                    value={formatCurrency(summary.balance)}
                    icon={<Landmark className="h-4 w-4" />}
                    accent="neutral"
                    trend="All time"
                />
                <StatCard
                    title="Total In"
                    value={formatCurrency(summary.totalIn)}
                    icon={<ArrowDownRight className="h-4 w-4" />}
                    accent="income"
                    trend="Lifetime income"
                />
                <StatCard
                    title="Total Out"
                    value={formatCurrency(summary.totalOut)}
                    icon={<ArrowUpRight className="h-4 w-4" />}
                    accent="expense"
                    trend="Lifetime expenses"
                />
            </section>

            {/* Daily Summary */}
            <DailySummary todayIn={summary.todayIn} todayOut={summary.todayOut} />

            {/* Add Transaction Form */}
            <ExpenseForm />

            {/* Transaction List */}
            <ExpenseList
                isRefreshing={query.isFetching}
                fallbackTransactions={activeTransactions}
            />
        </div>
    );
}