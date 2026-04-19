import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/session";
import { parseQuickTransaction, type TransactionType } from "@/lib/transactions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where: {
    userId: string;
    type?: TransactionType;
  } = { userId: session.id };

  if (type === "IN" || type === "OUT") {
    where.type = type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const date = body.date ? new Date(body.date) : new Date();

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const parsed =
      typeof body.input === "string" && body.input.trim()
        ? parseQuickTransaction(body.input, body.type === "IN" ? "IN" : "OUT")
        : {
            amount: Number(body.amount),
            type: body.type === "IN" ? "IN" : "OUT",
            category:
              typeof body.category === "string" && body.category.trim()
                ? body.category.trim()
                : body.type === "IN"
                  ? "Income"
                  : "Expense",
            note: typeof body.note === "string" && body.note.trim() ? body.note.trim() : null,
          };

    if (!Number.isFinite(parsed.amount) || parsed.amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.id,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        note: parsed.note,
        date,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("[transactions POST]", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
