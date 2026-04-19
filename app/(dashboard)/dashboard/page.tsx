import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { CashbookWorkspace } from "@/components/expense/cashbook-workspace";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cashbook</h1>
          <p className="text-sm text-muted-foreground">
            One place to track money coming in and going out.
          </p>
        </div>
        <Link href="/expenses" className="text-sm font-medium text-primary hover:underline">
          Full history
        </Link>
      </div>

      <CashbookWorkspace initialTransactions={transactions} />
    </div>
  );
}
