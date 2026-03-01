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

// GET /api/builds/[id] (Public)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const build = await prisma.build.findUnique({
    where: { id },
    include: {
      user: {
        select: { username: true, name: true, image: true }
      }
    }
  });

  if (!build) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!build.isPublic) {
    // If it's not public, we need to check if the requester is the owner
    const session = await getSession();
    if (session?.user?.id !== build.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json({
    id: build.id,
    name: build.name,
    description: build.description,
    isPublic: build.isPublic,
    type: build.type,
    data: JSON.parse(build.data),
    createdAt: build.createdAt.getTime(),
    updatedAt: build.updatedAt.getTime(),
    author: {
      username: build.user.username || build.user.name || "Anonymous",
      image: build.user.image,
    }
  });
}
