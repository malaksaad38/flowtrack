import { ExpenseForm } from "@/components/expense/expense-form";

export const metadata = {
  title: "Add Expense – FlowTrack",
  description: "Quickly log a new expense.",
};

export default function AddPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Expense</h1>
        <p className="text-sm text-muted-foreground">Log a new transaction in seconds.</p>
      </div>

      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <ExpenseForm redirectOnSuccess />
      </div>
    </div>
  );
}
