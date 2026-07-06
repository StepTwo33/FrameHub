import { NextRequest, NextResponse } from "next/server";
import { fetchPublishedSiteUpdates } from "@/lib/site-updates-server";

// GET /api/site-updates?limit=10 — published posts for home page
export async function GET(req: NextRequest) {
  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10) || 10, 1),
    30,
  );

  const updates = await fetchPublishedSiteUpdates(limit);
  return NextResponse.json({ updates });
}
