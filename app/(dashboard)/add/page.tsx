import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { CashbookWorkspace } from "@/components/expense/cashbook-workspace";

export const metadata = {
  title: "Quick Add - FlowTrack",
  description: "Add a cashbook transaction in one line.",
};

export default async function AddPage() {
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quick Add</h1>
        <p className="text-sm text-muted-foreground">Log cash in or cash out with one short line.</p>
      </div>

      <CashbookWorkspace initialTransactions={transactions} mode="add" />
    </div>
  );
}
