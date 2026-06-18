import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  BEAST_CLAW_IMAGE_PATH,
  buildWikiImageCandidates,
  getImagePath,
  getLocalImageOverride,
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

function localPublicPath(webPath: string): string {
  const parts = webPath.replace(/^\//, "").split("/");
  return join(process.cwd(), "public", ...parts);
}

function resolveLocalImage(
  kind: GameImageCategory,
  displayName: string,
  weaponCategory?: string | null,
): string | null {
  if (weaponCategory === "beast_claw") {
    const claws = localPublicPath(BEAST_CLAW_IMAGE_PATH);
    if (existsSync(claws)) return BEAST_CLAW_IMAGE_PATH;
  }

  const override = getLocalImageOverride(kind, displayName);
  if (override) {
    const overridePath = localPublicPath(override);
    if (existsSync(overridePath)) return override;
  }

  const standard = getImagePath(displayName, kind);
  const standardPath = localPublicPath(standard);
  if (existsSync(standardPath)) return standard;

  return null;
}

export async function GET(req: NextRequest) {
  const k = req.nextUrl.searchParams.get("k");
  const n = req.nextUrl.searchParams.get("n");
  const weaponCategory = req.nextUrl.searchParams.get("c");
  if (!n || !k || !isWikiGameImageCategory(k)) {
    return NextResponse.redirect(WIKI_IMAGE_FALLBACK_URL, 302);
  }

  const local = resolveLocalImage(k, n, weaponCategory);
  if (local) {
    return NextResponse.redirect(new URL(local, req.url), 302);
  }

  const url = await unstable_cache(
    () => resolveWikiImageUrl(k, n),
    ["wiki-game-image", k, n],
    { revalidate: 60 * 60 * 24 * 7 },
  )();

  return NextResponse.redirect(url, 302);
}
