"use client";

import { useEffect, useMemo, useState } from "react";
import { endOfDay, format, isSameDay, isSameMonth, parseISO, startOfDay, subDays } from "date-fns";
import { ExpenseRow, ExpenseTableRow } from "./expense-row";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ChartColumnIncreasing,
    CircleDollarSign,
    FolderKanban,
    Loader2,
    ReceiptText,
    ChevronDown, SlidersHorizontal,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatCurrency, type Transaction } from "@/lib/transactions";

type DatePreset = "ALL" | "TODAY" | "YESTERDAY" | "THIS_MONTH" | "LAST_7_DAYS" | "CUSTOM";
type PageSize = "10" | "20" | "30" | "ALL";

interface ExpenseListProps {
  isRefreshing?: boolean;
  limit?: number;
  showFilters?: boolean;
  fallbackTransactions?: Transaction[];
}


function getPresetLabel(preset: DatePreset, rangeStart: string, rangeEnd: string) {
  if (preset === "TODAY") {
    return "Today";
  }
  if (preset === "YESTERDAY") {
    return "Yesterday";
  }
  if (preset === "THIS_MONTH") {
    return "This month";
  }
  if (preset === "LAST_7_DAYS") {
    return "Last 7 days";
  }
  if (preset === "CUSTOM") {
    if (!rangeStart && !rangeEnd) {
      return "Custom range";
    }

    const from = rangeStart ? format(parseISO(rangeStart), "MMM d, yyyy") : "Any start";
    const to = rangeEnd ? format(parseISO(rangeEnd), "MMM d, yyyy") : "Any end";
    return `${from} - ${to}`;
  }

  return "All dates";
}

function matchesDatePreset(transactionDate: Date, preset: DatePreset, rangeStart: string, rangeEnd: string) {
  const now = new Date();

  if (preset === "ALL") {
    return true;
  }

  if (preset === "TODAY") {
    return isSameDay(transactionDate, now);
  }

  if (preset === "YESTERDAY") {
    return isSameDay(transactionDate, subDays(now, 1));
  }

  if (preset === "THIS_MONTH") {
    return isSameMonth(transactionDate, now);
  }

  if (preset === "LAST_7_DAYS") {
    const start = startOfDay(subDays(now, 6));
    const end = endOfDay(now);
    return transactionDate >= start && transactionDate <= end;
  }

  const start = rangeStart ? startOfDay(parseISO(rangeStart)) : null;
  const end = rangeEnd ? endOfDay(parseISO(rangeEnd)) : null;

  if (start && transactionDate < start) {
    return false;
  }

  if (end && transactionDate > end) {
    return false;
  }

  return true;
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

  const [datePreset, setDatePreset] = useState<DatePreset>("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [pageSize, setPageSize] = useState<PageSize>("10");
  const [page, setPage] = useState(1);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [showMore, setShowMore] = useState(false);

  const baseTransactions = hasLoadedTransactions
    ? getFilteredTransactions()
    : filterType === "ALL"
      ? fallbackTransactions
      : fallbackTransactions.filter((transaction) => transaction.type === filterType);

  const categories = useMemo(() => {
    return Array.from(
      new Set(baseTransactions.map((transaction) => transaction.category.trim()).filter(Boolean))
    ).sort((left, right) => left.localeCompare(right));
  }, [baseTransactions]);

  const transactions = useMemo(() => {
    const normalizedCategory = selectedCategory.trim();

    return baseTransactions.filter((transaction) => {
      const date = new Date(transaction.date);
      const dateMatched = matchesDatePreset(date, datePreset, rangeStart, rangeEnd);
      const categoryMatched = normalizedCategory === "ALL" || transaction.category === normalizedCategory;
      return dateMatched && categoryMatched;
    });
  }, [baseTransactions, datePreset, rangeStart, rangeEnd, selectedCategory]);

  const canPaginate = typeof limit !== "number";
  const pageSizeNumber = pageSize === "ALL" ? transactions.length || 1 : Number(pageSize);
  const totalPages = canPaginate ? Math.max(1, Math.ceil(transactions.length / pageSizeNumber)) : 1;
  const currentPage = canPaginate ? Math.min(page, totalPages) : 1;
  const visibleTransactions = typeof limit === "number"
    ? transactions.slice(0, limit)
    : pageSize === "ALL"
      ? transactions
      : transactions.slice(0, currentPage * pageSizeNumber);

  useEffect(() => {
    if (canPaginate) {
      setPage(1);
    }
  }, [filterType, datePreset, selectedCategory, rangeStart, rangeEnd, pageSize, canPaginate]);

  useEffect(() => {
    if (canPaginate && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, canPaginate]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (summary, transaction) => {
        if (transaction.type === "IN") {
          summary.totalIn += transaction.amount;
          summary.balance += transaction.amount;
        } else {
          summary.totalOut += transaction.amount;
          summary.balance -= transaction.amount;
        }

        return summary;
      },
      { totalIn: 0, totalOut: 0, balance: 0 }
    );
  }, [transactions]);


  const periodLabel = getPresetLabel(datePreset, rangeStart, rangeEnd);

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-background/40 shadow-sm backdrop-blur-sm">
        <CardHeader className="space-y-4 border-b border-border/50 bg-muted/10 px-3 py-4 sm:px-6 sm:py-5">
            {/* Top Section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                {/* Title */}
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold sm:font-bold tracking-tight">
                        <ReceiptText className="h-5 w-5 text-primary shrink-0" />
                        Transactions
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                        Filter by date/category and review reports instantly.
                    </p>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between sm:block sm:text-right text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <CircleDollarSign className="h-4 w-4" />
                        <span className="font-medium text-foreground">
          {formatCurrency(summary.balance)}
        </span>
                    </div>

                    <div className="flex items-center gap-2">
        <span className="text-[11px] sm:text-xs">
          ({transactions.length} items)
        </span>

                        {isRefreshing && (
                            <span className="inline-flex items-center gap-1 text-[11px]">
            <Loader2 className="h-3 w-3 animate-spin" />
          </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="space-y-4 rounded-2xl border border-border/50 bg-background/80 p-3 sm:p-4">

                    {/* Top row: always visible */}
                    <div className="flex flex-wrap items-center gap-2">

                        {/* Type */}
                        {(["ALL", "IN", "OUT"] as const).map((type) => (
                            <Button
                                key={type}
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setFilterType(type)}
                                className={`rounded-full text-xs sm:text-sm gap-1.5 ${
                                    filterType === type
                                        ? "bg-primary text-primary-foreground"
                                        : ""
                                }`}
                            >
                                {type === "IN" && <ArrowDownRight className="h-3.5 w-3.5" />}
                                {type === "OUT" && <ArrowUpRight className="h-3.5 w-3.5" />}
                                {type}
                            </Button>

                        ))}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="lg:hidden ml-auto"
                            onClick={() => setShowMore((p) => !p)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1" />
                            More
                        </Button>

                        {/* Category */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* More button (mobile only) */}
                    </div>

                    {/* Desktop filters */}
                    <div className="hidden lg:flex flex-wrap gap-2">
                        {([
                            ["ALL", "All"],
                            ["TODAY", "Today"],
                            ["YESTERDAY", "Yesterday"],
                            ["THIS_MONTH", "Month"],
                            ["LAST_7_DAYS", "7d"],
                            ["CUSTOM", "Custom"],
                        ] as const).map(([preset, label]) => (
                            <Button
                                key={preset}
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setDatePreset(preset)}
                                className={`rounded-full text-xs sm:text-sm gap-1.5 ${
                                    datePreset === preset
                                        ? "bg-primary/10 text-primary border-primary/30"
                                        : ""
                                }`}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                {label}
                            </Button>
                        ))}
                    </div>

                    {/* Mobile expanded filters */}
                    {showMore && (
                        <div className="lg:hidden space-y-3 pt-2 border-t border-border/40">

                            <div className="flex flex-wrap gap-2">
                                {([
                                    ["ALL", "All"],
                                    ["TODAY", "Today"],
                                    ["YESTERDAY", "Yesterday"],
                                    ["THIS_MONTH", "Month"],
                                    ["LAST_7_DAYS", "7d"],
                                    ["CUSTOM", "Custom"],
                                ] as const).map(([preset, label]) => (
                                    <Button
                                        key={preset}
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDatePreset(preset)}
                                        className={`rounded-full text-xs gap-1.5 ${
                                            datePreset === preset ? "bg-primary/10 text-primary" : ""
                                        }`}
                                    >
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {label}
                                    </Button>
                                ))}
                            </div>

                            {datePreset === "CUSTOM" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        value={rangeStart}
                                        onChange={(e) => setRangeStart(e.target.value)}
                                    />
                                    <Input
                                        type="date"
                                        value={rangeEnd}
                                        onChange={(e) => setRangeEnd(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>            )}
        </CardHeader>
      <CardContent className="space-y-3 px-4 py-4 sm:px-6">
        {isRefreshing && visibleTransactions.length === 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
            <div className="hidden w-full lg:block">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </>
        ) : visibleTransactions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <ReceiptText className="h-8 w-8 text-muted-foreground/60" />
            <p className="font-medium text-muted-foreground">No matching transactions</p>
            <p className="text-sm text-muted-foreground/70">Try changing date, category, or type filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
              {visibleTransactions.map((transaction) => (
                <ExpenseRow key={transaction.id} expense={transaction} />
              ))}
            </div>

            <div className="hidden w-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/50 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-24 px-5 py-4">Type</th>
                    <th className="w-32 px-5 py-4">Date</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Note</th>
                    <th className="w-36 px-5 py-4 text-right">Amount</th>
                    <th className="w-16 px-5 py-4 text-center">Action</th>
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

        {canPaginate ? (
          <div className="mt-4 flex items-center gap-3 border-t border-border/40 pt-4  justify-between">
            <div className="inline-flex w-auto items-center gap-2 sm:w-auto">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Items</span>
              <Select value={pageSize} onValueChange={(value) => setPageSize(value as PageSize)}>
                <SelectTrigger className="h-9 w-full min-w-0 sm:min-w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="ALL">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pageSize !== "ALL" && currentPage < totalPages && (
              <div className="flex justify-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  className="min-w-[140px] rounded-full bg-background/50 hover:bg-muted shadow-sm"
                >
                  Load More
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </div>
  );
}
