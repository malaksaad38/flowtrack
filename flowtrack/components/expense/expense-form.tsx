"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Expense } from "@/lib/expense-types";

interface ExpenseFormProps {
  /** Pass an existing expense to enter edit mode */
  expense?: Expense;
  /** Called after a successful save (for use in sheets) */
  onSuccess?: () => void;
  /** Whether to redirect to /expenses after saving (add page) */
  redirectOnSuccess?: boolean;
}

function toDateInput(iso: string) {
  return iso.split("T")[0];
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function ExpenseForm({ expense, onSuccess, redirectOnSuccess }: ExpenseFormProps) {
  const router = useRouter();
  const isEdit = Boolean(expense);

  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState(expense?.category ?? "Food");
  const [note, setNote] = useState(expense?.note ?? "");
  const [date, setDate] = useState(expense ? toDateInput(expense.date) : todayISO());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/expenses/${expense!.id}` : "/api/expenses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), category, note: note || null, date }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (onSuccess) {
        onSuccess();
      }

      if (redirectOnSuccess) {
        router.push("/expenses");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id={isEdit ? "edit-expense-form" : "add-expense-form"}>
      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="expense-amount">Amount (PKR)</Label>
        <Input
          id="expense-amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="expense-category">Category</Label>
        <Select
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="expense-date">Date</Label>
        <Input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="expense-note">Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="expense-note"
          type="text"
          placeholder="e.g. Lunch at cafe"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button id="expense-submit" type="submit" className="w-full" disabled={loading}>
        {loading ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add expense")}
      </Button>
    </form>
  );
}
