import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeParseBuildJson } from "@/lib/build-types";

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

  const parsed = safeParseBuildJson(build.data);
  if (parsed === null) {
    return NextResponse.json({ error: "Invalid build data" }, { status: 500 });
  }

  return NextResponse.json({
    id: build.id,
    name: build.name,
    description: build.description,
    isPublic: build.isPublic,
    type: build.type,
    itemId: build.itemId,
    upvoteCount: build.upvoteCount,
    data: parsed,
    createdAt: build.createdAt.getTime(),
    updatedAt: build.updatedAt.getTime(),
    author: {
      username: build.user.username || build.user.name || "Anonymous",
      profileSlug: build.user.username,
      image: build.user.image,
    }
  });
}
