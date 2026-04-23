"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { parseQuickTransaction, type Transaction, type TransactionType } from "@/lib/transactions";
import { format, isToday } from "date-fns";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Plus } from "lucide-react";

const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function ExpenseForm() {
  const queryClient = useQueryClient();
  const quickInput = useAppStore((state) => state.quickInput);
  const fallbackType = useAppStore((state) => state.fallbackType);
  const setQuickInput = useAppStore((state) => state.setQuickInput);
  const setFallbackType = useAppStore((state) => state.setFallbackType);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const replaceTransaction = useAppStore((state) => state.replaceTransaction);
  const removeTransaction = useAppStore((state) => state.removeTransaction);
  const [error, setError] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  const mutation = useMutation({
    mutationFn: async (payload: { input: string; type: TransactionType; date: string }) => {
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
    let optimisticTransaction: Transaction | null = null;

    try {
      const parsed = parseQuickTransaction(currentInput, fallbackType);
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

      addTransaction(optimisticTransaction);
      setQuickInput("");

      const savedTransaction = await mutation.mutateAsync({ input: currentInput, type: fallbackType, date: date.toISOString() });
      replaceTransaction(optimisticTransaction.id, savedTransaction);
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    } catch (submitError) {
      if (optimisticTransaction) {
        removeTransaction(optimisticTransaction.id);
      }

      setQuickInput(currentInput);
      setError(submitError instanceof Error ? submitError.message : "Could not save transaction.");
    }
  }

  return (
      <form
          onSubmit={handleSubmit}
          id="cashbook-composer"
          className="w-full  mx-auto space-y-5 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-md p-4 sm:p-6 shadow-sm transition-all focus-within:ring-1 focus-within:ring-primary/20"
      >
          {/* Header */}
          <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight">
                  Add Transaction
              </h2>
              <p className="text-xs text-muted-foreground">
                  Example: 500 salary, 300 food note...
              </p>
          </div>

          {/* Type Toggle */}
          <div className="flex items-center gap-2">
              {(["IN", "OUT"] as const).map((type) => {
                  const active = fallbackType === type;
                  return (
                      <button
                          key={type}
                          type="button"
                          onClick={() => setFallbackType(type)}
                          className={cn(
                              "flex-1 h-10 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2",
                              active
                                  ? type === "IN"
                                      ? "border-green-500 bg-green-500/10 text-green-600"
                                      : "border-red-500 bg-red-500/10 text-red-600"
                                  : "border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                      >
                          {type === "IN" ? (
                              <ArrowDownRight className="h-4 w-4" />
                          ) : (
                              <ArrowUpRight className="h-4 w-4" />
                          )}
                          {type}
                      </button>
                  );
              })}
          </div>

          {/* Input Row */}
          <div className="flex flex-col sm:flex-row gap-2">
              {/* Input Container */}
              <div className="flex flex-1 items-center gap-2 h-11 rounded-lg border border-border bg-background px-2 focus-within:ring-1 focus-within:ring-primary/20">

                  {/* Date */}
                  <Popover>
                      <PopoverTrigger asChild>
                          <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition"
                          >
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          </button>
                      </PopoverTrigger>

                      <PopoverContent
                          align="start"
                          className="w-auto p-0"
                      >
                          <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(d) => d && setDate(d)}
                              initialFocus
                          />
                      </PopoverContent>
                  </Popover>

                  <div className="h-4 w-px bg-border" />

                  {/* Input */}
                  <input
                      id="transaction-quick-input"
                      type="text"
                      placeholder="Amount category note..."
                      value={quickInput}
                      onChange={(e) => setQuickInput(e.target.value)}
                      autoComplete="off"
                      required
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
              </div>

              {/* Submit */}
              <Button
                  id="transaction-submit"
                  type="submit"
                  disabled={mutation.isPending}
                  className="h-11 px-5 rounded-lg text-sm font-medium w-full sm:w-auto"
              >
                  <Plus className="h-4 w-4" />
                  {mutation.isPending ? "Saving..." : "Add"}
              </Button>
          </div>

          {/* Date Info */}
          {date && !isToday(date) && (
              <div className="text-xs text-muted-foreground sm:pl-10">
                  {format(date, "PPP")}
              </div>
          )}

          {/* Error */}
          {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
              </div>
          )}
      </form>  );
}
