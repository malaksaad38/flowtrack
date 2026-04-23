"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";
import { type Transaction, type TransactionType } from "@/lib/transactions";
import { updateTransaction as updateInIDB, addToSyncQueue } from "@/lib/indexeddb";
import { useNetworkStatus } from "@/lib/use-network-status";
import { useAppStore } from "@/store/app-store";

interface EditExpenseDialogProps {
  expense: Transaction;
  children: React.ReactNode;
}

export function EditExpenseDialog({ expense, children }: EditExpenseDialogProps) {
  const queryClient = useQueryClient();
  const isOnline = useNetworkStatus();
  const setTransactions = useAppStore((state) => state.setTransactions);
  const transactions = useAppStore((state) => state.transactions);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [note, setNote] = useState(expense.note || "");
  const [type, setType] = useState<TransactionType>(expense.type);
  const [date, setDate] = useState<Date>(new Date(expense.date));
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload: Partial<Transaction>) => {
      const response = await fetch(`/api/transactions/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Could not update transaction.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setOpen(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update transaction.");
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    const updatePayload = {
      amount: parsedAmount,
      category: category.trim(),
      note: note.trim() || null,
      type,
      date: date.toISOString(),
    };

    // Always update in local state immediately
    const updatedTransactions = transactions.map((t) =>
      t.id === expense.id ? { ...t, ...updatePayload } : t
    );
    setTransactions(updatedTransactions);

    // Always update IndexedDB
    await updateInIDB(expense.id, updatePayload);

    if (isOnline && !expense.id.startsWith("temp-")) {
      // Online: send to server
      try {
        mutation.mutate(updatePayload);
      } catch {
        // Queue for sync on failure
        await addToSyncQueue({
          action: "update",
          payload: { id: expense.id, ...updatePayload },
          createdAt: new Date().toISOString(),
          retries: 0,
        });
        setOpen(false);
      }
    } else if (!expense.id.startsWith("temp-")) {
      // Offline: queue for later
      await addToSyncQueue({
        action: "update",
        payload: { id: expense.id, ...updatePayload },
        createdAt: new Date().toISOString(),
        retries: 0,
      });
      setOpen(false);
    } else {
      // Temp ID — just update locally, sync will handle it
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex gap-2 mb-4">
            {(["IN", "OUT"] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant="outline"
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 font-semibold",
                  type === t &&
                    (t === "IN"
                      ? "border-green-500 text-green-500 bg-green-400/30 hover:bg-green-400/30"
                      : "border-red-500 text-red-500 bg-red-400/30 hover:bg-red-400/30")
                )}
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
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
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isOnline ? "Save Changes" : "Save Offline"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
