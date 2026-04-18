import Link from "next/link";
import { ExpenseList } from "@/components/expense/expense-list";

export const metadata = {
  title: "Expenses – FlowTrack",
  description: "Browse, filter, edit and delete your expenses.",
};

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">Browse and manage all your transactions.</p>
        </div>
        <Link
          href="/add"
          id="expenses-add-btn"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </Link>
      </div>

      <ExpenseList />
    </div>
  );
}
