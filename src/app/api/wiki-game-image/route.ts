import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  buildWikiImageCandidates,
  type GameImageCategory,
  WIKI_IMAGE_FALLBACK_URL,
  isWikiGameImageCategory,
} from "@/lib/images";

export const runtime = "nodejs";

async function resolveWikiImageUrl(kind: GameImageCategory, displayName: string): Promise<string> {
  const urls = buildWikiImageCandidates(displayName, kind);
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow", next: { revalidate: 604800 } });
      if (res.ok) return url;
    } catch {
      /* try next candidate */
    }
  }
  return WIKI_IMAGE_FALLBACK_URL;
}

export async function GET(req: NextRequest) {
  const k = req.nextUrl.searchParams.get("k");
  const n = req.nextUrl.searchParams.get("n");
  if (!n || !k || !isWikiGameImageCategory(k)) {
    return NextResponse.redirect(WIKI_IMAGE_FALLBACK_URL, 302);
  }

  const url = await unstable_cache(
    () => resolveWikiImageUrl(k, n),
    ["wiki-game-image", k, n],
    { revalidate: 60 * 60 * 24 * 7 },
  )();

  return NextResponse.redirect(url, 302);
}
