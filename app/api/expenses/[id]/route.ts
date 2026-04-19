import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const { amount, category, note, date } = body;

    // Verify ownership
    const existing = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category !== undefined && { category }),
        ...(note !== undefined && { note }),
        ...(date !== undefined && { date: new Date(date) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[expenses PATCH]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const existing = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
