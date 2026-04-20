import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { CashbookWorkspace } from "@/components/expense/cashbook-workspace";

export const metadata = {
  title: "Transactions - FlowTrack",
  description: "Browse and filter your cashbook history.",
};

export default async function ExpensesPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Session expired. <Link href="/login" className="text-primary underline">Log in again</Link>
        </p>
      </div>
    );
  }

  let transactions;
  try {
    transactions = await prisma.transaction.findMany({
      where: { userId: session.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    transactions = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:items-center items-start gap-2  justify-between flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Filter every IN and OUT entry in one feed.</p>
        </div>
        <Link
          href="/add"
          id="expenses-add-btn"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Quick add
        </Link>
      </div>

      <CashbookWorkspace initialTransactions={transactions} mode="list" />
    </div>
  );
}
