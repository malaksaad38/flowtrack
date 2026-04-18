import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { getCategoryVariant } from "@/lib/expense-types";

export const metadata = {
  title: "Dashboard – FlowTrack",
  description: "Your monthly expense overview.",
};

async function getDashboardData(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const expenses = await prisma.expense.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
        orderBy: { date: "desc" },
    });

    type Expense = (typeof expenses)[number];

    const total = expenses.reduce((s: number, e: Expense) => s + e.amount, 0);
    const largest = expenses.length ? Math.max(...expenses.map((e: Expense) => e.amount)) : 0;
    const count = expenses.length;

    const categoryMap: Record<string, number> = {};
    for (const e of expenses) {
        categoryMap[e.category] = (categoryMap[e.category] ?? 0) + e.amount;
    }
    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyMap: Record<number, number> = {};
    for (const e of expenses) {
        const day = new Date(e.date).getDate();
        dailyMap[day] = (dailyMap[day] ?? 0) + e.amount;
    }
    const barData = Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        value: dailyMap[i + 1] ?? 0,
    }));

    const donutData = Object.entries(categoryMap).map(([label, value]) => ({ label, value }));
    const recent = expenses.slice(0, 5);

    return { total, largest, count, topCategory, barData, donutData, recent };
}
function fmt(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ft_token")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Session expired. <Link href="/login" className="text-primary underline">Log in again</Link></p>
      </div>
    );
  }

  let data;
  try {
    data = await getDashboardData(session.id);
  } catch {
    // DB not connected — show empty state with demo UI
    data = {
      total: 0, largest: 0, count: 0, topCategory: "—",
      barData: [], donutData: [], recent: [],
    };
  }

  const { total, largest, count, topCategory, barData, donutData, recent } = data;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-PK", { month: "long", year: "numeric" });

  const kpis = [
    {
      id: "kpi-total",
      label: "Total Spent",
      value: fmt(total),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: "kpi-largest",
      label: "Largest Expense",
      value: fmt(largest),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      id: "kpi-count",
      label: "Transactions",
      value: String(count),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: "kpi-category",
      label: "Top Category",
      value: topCategory,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{monthLabel} overview</p>
        </div>
        <Link
          href="/add"
          id="dashboard-add-btn"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Expense
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} id={kpi.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {kpi.label}
                </CardTitle>
                <div className="text-muted-foreground">{kpi.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold truncate">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={barData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={donutData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
          <Link href="/expenses" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm text-muted-foreground">No expenses yet this month.</p>
              <Link href="/add" className="text-sm font-medium text-primary hover:underline">
                Add your first one →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-6 py-3">
                  <Badge variant={getCategoryVariant(e.category)} className="flex-shrink-0 text-xs">
                    {e.category}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {e.note || "No note"}
                  </span>
                  <span className="flex-shrink-0 text-sm font-semibold">{fmt(e.amount)}</span>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">{fmtDate(e.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
