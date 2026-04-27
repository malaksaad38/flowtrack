"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { parseQuickTransaction, type Transaction, type TransactionType } from "@/lib/transactions";
import { putTransaction, addToSyncQueue } from "@/lib/indexeddb";
import { useNetworkStatus } from "@/lib/use-network-status";
import { useEntryMode } from "@/lib/entry-mode";
import { format, isToday } from "date-fns";
import { ArrowDownRight, ArrowUpRight, CalendarDays, CloudOff, Plus, Sparkles, SlidersHorizontal } from "lucide-react";

const TRANSACTIONS_QUERY_KEY = ["transactions"];

type AutomaticPayload = {
  input: string;
  type: TransactionType;
  date: string;
};

type ManualPayload = {
  amount: number;
  category: string;
  note: string | null;
  type: TransactionType;
  date: string;
};

type TransactionPayload = AutomaticPayload | ManualPayload;

function getDefaultCategory(type: TransactionType) {
  return type === "IN" ? "Income" : "Expense";
}

export function ExpenseForm() {
  const queryClient = useQueryClient();
  const isOnline = useNetworkStatus();
  const entryMode = useEntryMode();
  const quickInput = useAppStore((state) => state.quickInput);
  const fallbackType = useAppStore((state) => state.fallbackType);
  const setQuickInput = useAppStore((state) => state.setQuickInput);
  const setFallbackType = useAppStore((state) => state.setFallbackType);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const replaceTransaction = useAppStore((state) => state.replaceTransaction);
  const removeTransaction = useAppStore((state) => state.removeTransaction);
  const [error, setError] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [manualAmount, setManualAmount] = useState("");
  const [manualCategory, setManualCategory] = useState("");
  const [manualNote, setManualNote] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload: TransactionPayload) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save transaction.");
      }

      return data as Transaction;
    },
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const currentInput = quickInput;
    const currentManualAmount = manualAmount;
    const currentManualCategory = manualCategory;
    const currentManualNote = manualNote;
    let optimisticTransaction: Transaction | null = null;

    try {
      const parsed =
        entryMode === "manual"
          ? (() => {
              const amount = Number(currentManualAmount);
              if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error("Enter a valid amount greater than zero.");
              }

              const category = currentManualCategory.trim() || getDefaultCategory(fallbackType);
              const note = currentManualNote.trim() || null;

              return {
                amount,
                type: fallbackType,
                category,
                note,
              };
            })()
          : parseQuickTransaction(currentInput, fallbackType);

      optimisticTransaction = {
        id: `temp-${Date.now()}`,
        userId: "local",
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        note: parsed.note,
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
      };

      const payload: TransactionPayload =
        entryMode === "manual"
          ? {
              amount: parsed.amount,
              category: parsed.category,
              note: parsed.note,
              type: parsed.type,
              date: date.toISOString(),
            }
          : {
              input: currentInput,
              type: fallbackType,
              date: date.toISOString(),
            };

      addTransaction(optimisticTransaction);
      setQuickInput("");
      setManualAmount("");
      setManualCategory("");
      setManualNote("");

      await putTransaction(optimisticTransaction as unknown as Record<string, unknown>);

      if (isOnline) {
        try {
          const savedTransaction = await mutation.mutateAsync(payload);
          replaceTransaction(optimisticTransaction.id, savedTransaction);
          await putTransaction(savedTransaction as unknown as Record<string, unknown>);
          await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
        } catch {
          await addToSyncQueue({
            action: "create",
            payload,
            createdAt: new Date().toISOString(),
            retries: 0,
            tempId: optimisticTransaction.id,
          });
        }
      } else {
        await addToSyncQueue({
          action: "create",
          payload,
          createdAt: new Date().toISOString(),
          retries: 0,
          tempId: optimisticTransaction.id,
        });
      }
    } catch (submitError) {
      if (optimisticTransaction) {
        removeTransaction(optimisticTransaction.id);
      }

      setQuickInput(currentInput);
      setManualAmount(currentManualAmount);
      setManualCategory(currentManualCategory);
      setManualNote(currentManualNote);
      setError(submitError instanceof Error ? submitError.message : "Could not save transaction.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      id="cashbook-composer"
      className="mx-auto w-full space-y-5 rounded-2xl border border-border/50 bg-background/80 p-4 shadow-sm backdrop-blur-md transition-all focus-within:ring-1 focus-within:ring-primary/20 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">Add Transaction</h2>
          <p className="text-xs text-muted-foreground">
            {entryMode === "manual"
              ? "Fill amount, category, and note separately."
              : "Example: 500 salary, 300 food note..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
            {entryMode === "manual" ? <SlidersHorizontal className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            {entryMode === "manual" ? "Manual" : "Automatic"}
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
              <CloudOff className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["IN", "OUT"] as const).map((type) => {
          const active = fallbackType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setFallbackType(type)}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                active
                  ? type === "IN"
                    ? "border-green-500 bg-green-500/10 text-green-600"
                    : "border-red-500 bg-red-500/10 text-red-600"
                  : "border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              {type === "IN" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              {type}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {entryMode === "manual" ? (
          <>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted transition"
                    aria-label="Choose transaction date"
                  >
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>

              <div className="min-w-0 text-xs text-muted-foreground">
                {isToday(date) ? "Using today" : format(date, "PPP")}
              </div>
            </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              id="transaction-manual-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              required
              className="h-11"
            />
            <Input
              id="transaction-manual-category"
              type="text"
              placeholder={getDefaultCategory(fallbackType)}
              value={manualCategory}
              onChange={(e) => setManualCategory(e.target.value)}
              className="h-11"
            />
            <Input
              id="transaction-manual-note"
              type="text"
              placeholder="Note"
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              className="h-11"
            />
          </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2 focus-within:ring-1 focus-within:ring-primary/20">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted transition"
                    aria-label="Choose transaction date"
                  >
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>

              <div className="h-4 w-px bg-border" />

              <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="transaction-quick-input"
                type="text"
                placeholder={isToday(date) ? "Amount category note..." : `${format(date, "MMM d")} amount category note...`}
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                autoComplete="off"
                required
                className="flex-1 h-11 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <Button
              id="transaction-submit"
              type="submit"
              disabled={mutation.isPending}
              className="h-11 w-full rounded-lg px-5 text-sm font-medium sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {mutation.isPending ? "Saving..." : isOnline ? "Add" : "Save Offline"}
            </Button>
          </div>
        )}

        {entryMode === "manual" && (
          <Button
            id="transaction-submit"
            type="submit"
            disabled={mutation.isPending}
            className="h-11 w-full rounded-lg px-5 text-sm font-medium sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {mutation.isPending ? "Saving..." : isOnline ? "Add" : "Save Offline"}
          </Button>

        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </form>
  );
}
