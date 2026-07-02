import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowedBuildType } from "@/lib/build-types";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 50;

function toPublicSummary(
  build: {
    id: string;
    name: string;
    description: string;
    type: string;
    itemId: string;
    upvoteCount: number;
    createdAt: Date;
    updatedAt: Date;
    user: { username: string | null; name: string | null; image: string | null };
  },
  voted?: boolean
) {
  return {
    id: build.id,
    name: build.name,
    description: build.description,
    type: build.type,
    itemId: build.itemId,
    upvoteCount: build.upvoteCount,
    createdAt: build.createdAt.getTime(),
    updatedAt: build.updatedAt.getTime(),
    author: {
      username: build.user.username || build.user.name || "Anonymous",
      profileSlug: build.user.username,
      image: build.user.image,
    },
    ...(voted !== undefined ? { voted } : {}),
  };
}

// GET /api/builds/public?type=&itemId=&sort=recent|popular&q=&limit=&cursor=
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const type = params.get("type");
  const itemId = params.get("itemId");
  const sort = params.get("sort") === "popular" ? "popular" : "recent";
  const q = params.get("q")?.trim() ?? "";
  const userId = params.get("userId");
  const limit = Math.min(
    Math.max(parseInt(params.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const cursor = params.get("cursor");

  if (type && !isAllowedBuildType(type)) {
    return NextResponse.json({ error: "Invalid build type" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isPublic: true };
  if (type) where.type = type;
  if (itemId) where.itemId = itemId;
  if (userId) where.userId = userId;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? [{ upvoteCount: "desc" as const }, { updatedAt: "desc" as const }]
      : [{ updatedAt: "desc" as const }];

  const builds = await prisma.build.findMany({
    where,
    orderBy,
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      itemId: true,
      upvoteCount: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { username: true, name: true, image: true } },
    },
  });

  const hasMore = builds.length > limit;
  const page = hasMore ? builds.slice(0, limit) : builds;
  const nextCursor = hasMore ? page[page.length - 1]?.id : null;

  const session = await getSession();
  let votedIds = new Set<string>();
  if (session?.user?.id && page.length > 0) {
    const votes = await prisma.buildVote.findMany({
      where: {
        userId: session.user.id,
        buildId: { in: page.map((b) => b.id) },
      },
      select: { buildId: true },
    });
    votedIds = new Set(votes.map((v) => v.buildId));
  }

  return NextResponse.json({
    builds: page.map((b) => toPublicSummary(b, session?.user?.id ? votedIds.has(b.id) : undefined)),
    nextCursor,
  });
}
