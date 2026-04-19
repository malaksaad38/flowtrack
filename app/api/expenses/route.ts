import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { userId: session.id };

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    where.date = { gte: start, lt: end };
  }

  if (category && category !== "all") {
    where.category = category;
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { amount, category, note, date } = await request.json();

    if (!amount || !category || !date) {
      return NextResponse.json({ error: "amount, category, and date are required." }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        userId: session.id,
        amount: parseFloat(amount),
        category,
        note: note ?? null,
        date: new Date(date),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("[expenses POST]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
