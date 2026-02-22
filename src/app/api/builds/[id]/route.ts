import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/builds/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const build = await prisma.build.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!build) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.build.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
