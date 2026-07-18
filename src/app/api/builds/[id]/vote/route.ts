import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
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

  const userId = session.user.id;

  // Race-safe toggle: deleteMany tells us atomically whether a vote existed,
  // and a concurrent create hitting @@unique([userId, buildId]) (P2002) is
  // treated as "already voted" instead of surfacing a 500.
  const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const deleted = await tx.buildVote.deleteMany({
      where: { userId, buildId: id },
    });

    if (deleted.count > 0) {
      await tx.build.updateMany({
        where: { id, upvoteCount: { gt: 0 } },
        data: { upvoteCount: { decrement: 1 } },
      });
      const current = await tx.build.findUnique({
        where: { id },
        select: { upvoteCount: true },
      });
      return { upvoteCount: current?.upvoteCount ?? 0, voted: false };
    }

    try {
      await tx.buildVote.create({
        data: { userId, buildId: id },
      });
    } catch (error) {
      if ((error as { code?: string })?.code === "P2002") {
        const current = await tx.build.findUnique({
          where: { id },
          select: { upvoteCount: true },
        });
        return { upvoteCount: current?.upvoteCount ?? 0, voted: true };
      }
      throw error;
    }

    const updated = await tx.build.update({
      where: { id },
      data: { upvoteCount: { increment: 1 } },
      select: { upvoteCount: true },
    });
    return { upvoteCount: updated.upvoteCount, voted: true };
  });

  return NextResponse.json(result);
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
