import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SiteUpdateSummary } from "@/lib/site-updates";

function toSummary(
  row: {
    id: string;
    title: string;
    body: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: { username: string | null; name: string | null };
  },
): SiteUpdateSummary {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    published: row.published,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    author: {
      username: row.author.username || row.author.name || "Frame Hub",
      profileSlug: row.author.username,
    },
  };
}

// GET /api/site-updates?limit=10 — published posts for home page
export async function GET(req: NextRequest) {
  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10) || 10, 1),
    30,
  );

  try {
    const rows = await prisma.siteUpdate.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        body: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { username: true, name: true } },
      },
    });

    return NextResponse.json({
      updates: rows.map(toSummary),
    });
  } catch {
    // Table may not exist yet before migration — fail soft for home page.
    return NextResponse.json({ updates: [] });
  }
}
