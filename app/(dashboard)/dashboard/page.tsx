import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { CashbookWorkspace } from "@/components/expense/cashbook-workspace";
import type { Transaction } from "@/lib/transactions";

export const metadata = {
  title: "Cashbook - FlowTrack",
  description: "Simple IN and OUT tracking for daily cash flow.",
};

export default async function DashboardPage() {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Cashbook
          </h1>
          <p className="text-sm text-muted-foreground">
            One place to track money coming in and going out.
          </p>
        </div>
        <Link href="/expenses" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          Full history
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <CashbookWorkspace initialTransactions={transactions} />
    </div>
  );
}
