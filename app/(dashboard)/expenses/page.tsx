import Link from "next/link";
import { List, Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { CashbookWorkspace } from "@/components/expense/cashbook-workspace";
import type { Transaction } from "@/lib/transactions";

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

  const transactions = (await prisma.transaction
    .findMany({
      where: { userId: session.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    })
    .catch(() => [])
  ).map(
    (transaction): Transaction => ({
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex sm:items-center items-start gap-2  justify-between flex-col sm:flex-row">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <List className="h-6 w-6 text-primary" />
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">Filter every IN and OUT entry in one feed.</p>
        </div>
        <Link
          href="/add"
          id="expenses-add-btn"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Quick add
        </Link>
      </div>

      <CashbookWorkspace initialTransactions={transactions} mode="list" />
    </div>
  );
}
