import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, type PrismaTransactionClient } from "@/lib/prisma";

// POST /api/builds/[id]/vote — toggle upvote (auth required, public builds only)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const build = await prisma.build.findUnique({
    where: { id },
    select: { id: true, isPublic: true, userId: true, upvoteCount: true },
  });

  if (!build) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!build.isPublic) {
    return NextResponse.json({ error: "Build is not public" }, { status: 403 });
  }

  const existing = await prisma.buildVote.findUnique({
    where: {
      userId_buildId: {
        userId: session.user.id,
        buildId: id,
      },
    },
  });

  if (existing) {
    const updated = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.buildVote.delete({ where: { id: existing.id } });
      return tx.build.update({
        where: { id },
        data: { upvoteCount: { decrement: 1 } },
        select: { upvoteCount: true },
      });
    });
    return NextResponse.json({
      upvoteCount: Math.max(0, updated.upvoteCount),
      voted: false,
    });
  }

  const updated = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    await tx.buildVote.create({
      data: { userId: session.user.id, buildId: id },
    });
    return tx.build.update({
      where: { id },
      data: { upvoteCount: { increment: 1 } },
      select: { upvoteCount: true },
    });
  });

  return NextResponse.json({
    upvoteCount: updated.upvoteCount,
    voted: true,
  });
}

// GET /api/builds/[id]/vote — current user's vote status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const build = await prisma.build.findUnique({
    where: { id },
    select: { upvoteCount: true, isPublic: true },
  });

  if (!build) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getSession();
  let voted = false;
  if (session?.user?.id) {
    const vote = await prisma.buildVote.findUnique({
      where: {
        userId_buildId: {
          userId: session.user.id,
          buildId: id,
        },
      },
    });
    voted = Boolean(vote);
  }

  return NextResponse.json({
    upvoteCount: build.upvoteCount,
    voted,
    canVote: build.isPublic,
  });
}
