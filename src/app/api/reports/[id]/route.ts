import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

// PATCH /api/reports/[id] — admin/mod only: update status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const updates: Record<string, unknown> = {};

  const VALID_STATUSES = ["open", "resolved", "wontfix"];
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    updates.status = body.status;
  }

  try {
    const report = await prisma.report.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}

// DELETE /api/reports/[id] — admin/mod only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}
