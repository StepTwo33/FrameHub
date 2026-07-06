import { NextRequest, NextResponse } from "next/server";
import { fetchPublishedSiteUpdate } from "@/lib/site-updates-server";

// GET /api/site-updates/[id] — single published post
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const update = await fetchPublishedSiteUpdate(id);
  if (!update) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ update });
}
