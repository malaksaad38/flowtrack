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
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatCurrency, type Transaction } from "@/lib/transactions";

type DatePreset = "ALL" | "TODAY" | "YESTERDAY" | "THIS_MONTH" | "LAST_7_DAYS" | "CUSTOM";
type ReportGranularity = "DAILY" | "MONTHLY";
type PageSize = "10" | "20" | "30" | "ALL";

interface ExpenseListProps {
  isRefreshing?: boolean;
  limit?: number;
  showFilters?: boolean;
  fallbackTransactions?: Transaction[];
}

interface ReportRow {
  key: string;
  label: string;
  count: number;
  totalIn: number;
  totalOut: number;
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
  const [reportGranularity, setReportGranularity] = useState<ReportGranularity>("DAILY");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [pageSize, setPageSize] = useState<PageSize>("10");
  const [page, setPage] = useState(1);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

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
  const pageStartIndex = canPaginate ? (currentPage - 1) * pageSizeNumber : 0;
  const visibleTransactions = typeof limit === "number"
    ? transactions.slice(0, limit)
    : pageSize === "ALL"
      ? transactions
      : transactions.slice(pageStartIndex, pageStartIndex + pageSizeNumber);

  useEffect(() => {
    if (canPaginate) {
      setPage(1);
    }
  }, [filterType, datePreset, selectedCategory, rangeStart, rangeEnd, pageSize, reportGranularity, canPaginate]);

  useEffect(() => {
    if (canPaginate && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, canPaginate]);

  const reportSummary = useMemo(() => {
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

  const reportRows = useMemo(() => {
    const accumulator = new Map<string, ReportRow>();

    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.date);
      const key = reportGranularity === "DAILY"
        ? format(transactionDate, "yyyy-MM-dd")
        : format(transactionDate, "yyyy-MM");
      const label = reportGranularity === "DAILY"
        ? format(transactionDate, "EEE, MMM d, yyyy")
        : format(transactionDate, "MMMM yyyy");

      const row = accumulator.get(key) ?? { key, label, count: 0, totalIn: 0, totalOut: 0 };
      row.count += 1;
      if (transaction.type === "IN") {
        row.totalIn += transaction.amount;
      } else {
        row.totalOut += transaction.amount;
      }
      accumulator.set(key, row);
    }

    return Array.from(accumulator.values()).sort((left, right) => right.key.localeCompare(left.key));
  }, [transactions, reportGranularity]);

  const periodLabel = getPresetLabel(datePreset, rangeStart, rangeEnd);

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-background/40 pb-4 shadow-sm backdrop-blur-sm">
      <CardHeader className="space-y-4 border-b border-border/50 bg-muted/10 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <ReceiptText className="h-5 w-5 text-primary" />
              Transactions
            </CardTitle>
            <p className="text-sm text-muted-foreground/80">Filter by date/category and review reports instantly.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <CircleDollarSign className="mr-1 inline h-4 w-4" />
            <span className="font-medium text-foreground">{formatCurrency(reportSummary.balance)}</span>
            <span className="ml-1.5">net ({transactions.length} items)</span>
            {isRefreshing ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Refreshing...
              </span>
            ) : null}
          </div>
        </div>

        {showFilters ? (
          <div className="space-y-3 rounded-2xl border border-border/50 bg-background/60 p-3">
            <div className="flex flex-wrap gap-2">
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

            <div className="flex flex-wrap gap-2">
              {([
                ["ALL", "All dates"],
                ["TODAY", "Today"],
                ["YESTERDAY", "Yesterday"],
                ["THIS_MONTH", "This month"],
                ["LAST_7_DAYS", "Last 7 days"],
                ["CUSTOM", "Custom range"],
              ] as const).map(([preset, label]) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  onClick={() => setDatePreset(preset)}
                  className={
                    datePreset === preset
                      ? "rounded-full bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                      : "rounded-full"
                  }
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {label}
                </Button>
              ))}
            </div>

            {datePreset === "CUSTOM" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  type="date"
                  value={rangeStart}
                  onChange={(event) => setRangeStart(event.target.value)}
                  aria-label="Range start date"
                />
                <Input
                  type="date"
                  value={rangeEnd}
                  onChange={(event) => setRangeEnd(event.target.value)}
                  aria-label="Range end date"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <SelectTrigger className="h-9 min-w-44">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <ChartColumnIncreasing className="h-4 w-4 text-muted-foreground" />
                <Button
                  type="button"
                  variant="outline"
                  className={reportGranularity === "DAILY" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setReportGranularity("DAILY")}
                >
                  Daily
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={reportGranularity === "MONTHLY" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setReportGranularity("MONTHLY")}
                >
                  Monthly
                </Button>
              </div>
            </div>

            {canPaginate ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Items per page</span>
                  <Select value={pageSize} onValueChange={(value) => setPageSize(value as PageSize)}>
                    <SelectTrigger className="h-9 min-w-28">
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

                <div className="inline-flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page <span className="font-medium text-foreground">{currentPage}</span> of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Report period</p>
          <p className="mt-1 text-sm font-medium text-foreground">{periodLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              IN {formatCurrency(reportSummary.totalIn)}
            </span>
            <span className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-destructive">
              OUT {formatCurrency(reportSummary.totalOut)}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-foreground">
              Balance {formatCurrency(reportSummary.balance)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {reportGranularity === "DAILY" ? "Daily report" : "Monthly report"}
          </p>
          {reportRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No report data for the selected filters.</p>
          ) : (
            <div className="space-y-2">
              {reportRows.map((row) => (
                <div key={row.key} className="flex flex-col gap-1 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.count} entries</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <span className="text-primary">IN {formatCurrency(row.totalIn)}</span>
                    <span className="text-destructive">OUT {formatCurrency(row.totalOut)}</span>
                    <span className="font-medium text-foreground">NET {formatCurrency(row.totalIn - row.totalOut)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
      </CardContent>
    </div>
  );
}
