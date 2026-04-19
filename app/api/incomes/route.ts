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

  const where: Record<string, unknown> = { userId: session.id };

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    where.date = { gte: start, lt: end };
  }

  const incomes = await prisma.income.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(incomes);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { amount, note, date } = await request.json();

    if (!amount || !date) {
      return NextResponse.json({ error: "amount and date are required." }, { status: 400 });
    }

    const income = await prisma.income.create({
      data: {
        userId: session.id,
        amount: parseFloat(amount),
        note: note ?? null,
        date: new Date(date),
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error("[incomes POST]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
