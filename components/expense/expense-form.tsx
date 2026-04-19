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
      className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5"
      id="cashbook-composer"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold">Quick add</p>
        <p className="text-sm text-muted-foreground">
          Try `500 in salary`, `300 out food`, `1000 received`, or `200 spent`.
        </p>
      </div>

      <div className="flex gap-2">
        {(["IN", "OUT"] as const).map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            onClick={() => setFallbackType(type)}
            className={cn(
              "h-10 flex-1 rounded-full hover:bg-transparent hover:text-foreground",
              fallbackType === type &&
                (type === "IN"
                  ? "border-primary hover:bg-primary/10 bg-primary/10 text-primary"
                  : "border-destructive hover:bg-destructive/10 bg-destructive/10 text-destructive")
            )}
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2 relative w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                className={cn(
                  "h-11 w-11 shrink-0 rounded-2xl p-0 flex items-center justify-center",
                  !date && "text-muted-foreground"
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Input
            id="transaction-quick-input"
            type="text"
            placeholder="Enter amount and note"
            value={quickInput}
            onChange={(event) => setQuickInput(event.target.value)}
            autoComplete="off"
            required
            className="flex-1 h-11 rounded-2xl min-w-0"
          />
        </div>
        <Button
          id="transaction-submit"
          type="submit"
          disabled={mutation.isPending}
          className="h-11 rounded-2xl px-6 w-full sm:w-auto"
        >
          {mutation.isPending ? "Saving..." : "Add"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </form>
  );
}
