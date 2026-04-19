import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
