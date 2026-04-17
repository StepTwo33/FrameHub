// Image path utilities for item thumbnails.
//
// Default: icons are resolved via /api/wiki-game-image → wiki.warframe.com/images (no huge /public tree).
// Disable with NEXT_PUBLIC_USE_WIKI_GAME_IMAGES=false to use /public/images/{category}/ only.
//
// When using local files, names map to Name_With_Underscores.png (spaces → "_"), with optional stem maps below.

/** In-app display name → PNG stem when it differs from the default `name` → underscores rule */
const WEAPON_IMAGE_STEM_BY_NAME: Record<string, string> = {
  "Coda Bubonico": "Bubonico",
  "Kuva Ghoulsaw": "Ghoulsaw",
  "Tenet Quanta": "Quanta",
  "Perigale Prime": "Perigale",
  "Sarofang Prime": "Sarofang",
};

const WARFRAME_IMAGE_STEM_BY_NAME: Record<string, string> = {
  "Voruna Prime": "Voruna",
};

export type GameImageCategory = "weapons" | "warframes" | "mods" | "arcanes" | "companions";

const WIKI_IMAGE_ROOT = "https://wiki.warframe.com/images";

/** Shown when no wiki filename matches (wiki-hosted neutral asset). */
export const WIKI_IMAGE_FALLBACK_URL = `${WIKI_IMAGE_ROOT}/Logo.png`;

/** When not "false", mod/weapon/etc. thumbnails go through /api/wiki-game-image (wiki CDN). */
export const USE_WIKI_GAME_IMAGES = process.env.NEXT_PUBLIC_USE_WIKI_GAME_IMAGES !== "false";

export function isWikiGameImageCategory(s: string): s is GameImageCategory {
  return s === "weapons" || s === "warframes" || s === "mods" || s === "arcanes" || s === "companions";
}

function resolvedDisplayName(name: string, category: GameImageCategory): string {
  if (category === "weapons") return WEAPON_IMAGE_STEM_BY_NAME[name] ?? name;
  if (category === "warframes") return WARFRAME_IMAGE_STEM_BY_NAME[name] ?? name;
  return name;
}

/**
 * Candidate wiki.warframe.com image URLs (first working wins in /api/wiki-game-image).
 * Order: underscores (e.g. Speed_Holster), compact (e.g. ExcaliburPrime), then NameMod.png for mods only.
 */
export function buildWikiImageCandidates(displayName: string, category: GameImageCategory): string[] {
  const resolved = resolvedDisplayName(displayName, category);
  const underscored = resolved.replace(/\s+/g, "_");
  const compact = resolved.replace(/\s+/g, "");
  const urls = [`${WIKI_IMAGE_ROOT}/${underscored}.png`, `${WIKI_IMAGE_ROOT}/${compact}.png`];
  if (category === "mods") {
    urls.push(`${WIKI_IMAGE_ROOT}/${compact}Mod.png`);
  }
  return urls;
}

function pngStemForCategory(name: string, category: GameImageCategory): string {
  return resolvedDisplayName(name, category).replace(/ /g, "_");
}

export function getImagePath(name: string, category: GameImageCategory): string {
  const filename = pngStemForCategory(name, category) + ".png";
  return `/images/${category}/${filename}`;
}

function wikiProxyUrl(category: GameImageCategory, displayName: string): string {
  return `/api/wiki-game-image?k=${category}&n=${encodeURIComponent(displayName)}`;
}

export function getWeaponImage(name: string): string {
  return USE_WIKI_GAME_IMAGES ? wikiProxyUrl("weapons", name) : getImagePath(name, "weapons");
}

export function getWarframeImage(name: string): string {
  return USE_WIKI_GAME_IMAGES ? wikiProxyUrl("warframes", name) : getImagePath(name, "warframes");
}

export function getModImage(name: string): string {
  return USE_WIKI_GAME_IMAGES ? wikiProxyUrl("mods", name) : getImagePath(name, "mods");
}

export function getArcaneImage(name: string): string {
  return USE_WIKI_GAME_IMAGES ? wikiProxyUrl("arcanes", name) : getImagePath(name, "arcanes");
}

export function getCompanionImage(name: string): string {
  return USE_WIKI_GAME_IMAGES ? wikiProxyUrl("companions", name) : getImagePath(name, "companions");
}
