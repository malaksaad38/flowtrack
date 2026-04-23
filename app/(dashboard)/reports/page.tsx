import Link from "next/link";
import { PieChart } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/db/prisma";
import type { Transaction } from "@/lib/transactions";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata = {
  title: "Reports - FlowTrack",
  description: "View reports and analytics for your cash flow.",
};

export default async function ReportsPage() {
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
            <PieChart className="h-6 w-6 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize your income, expenses, and category breakdown.
          </p>
        </div>
      </div>

      <ReportsView initialTransactions={transactions} />
    </div>
  );
}
