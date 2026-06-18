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
  "Afentis Prime": "Afentis",
  "Athodai Prime": "Athodai",
  "Sarofang Prime": "Sarofang",
};

const WARFRAME_IMAGE_STEM_BY_NAME: Record<string, string> = {
  "Voruna Prime": "Voruna",
  "Styanax Prime": "Styanax",
  "Sirius & Orion": "Sirius",
};

export type GameImageCategory = "weapons" | "warframes" | "mods" | "arcanes" | "companions";

const WIKI_IMAGE_ROOT = "https://wiki.warframe.com/images";

/** Shown when no wiki filename matches (wiki-hosted neutral asset). */
export const WIKI_IMAGE_FALLBACK_URL = `${WIKI_IMAGE_ROOT}/Logo.png`;

/** When not "false", mod/weapon/etc. thumbnails go through /api/wiki-game-image (wiki CDN). */
export const USE_WIKI_GAME_IMAGES = process.env.NEXT_PUBLIC_USE_WIKI_GAME_IMAGES !== "false";

/** Last-resort wiki icons per category (better than Logo.png when item art is not uploaded yet). */
const WIKI_CATEGORY_FALLBACK_FILE: Partial<Record<GameImageCategory, string>> = {
  arcanes: "Arcane.png",
};

/**
 * Related wiki filenames to try when the item has no dedicated icon yet.
 * Keys are display names; values are bare filenames (not full URLs).
 */
const WIKI_RELATED_IMAGE_FILES: Partial<Record<GameImageCategory, Record<string, string[]>>> = {
  weapons: {
    // Orion's scythe — same mesh as Pride, inverted; wiki icon not uploaded yet (U43).
    Wrath: ["Pride.png"],
    "Athodai Prime": ["AthodaiPrime.png"],
    "Afentis Prime": ["AfentisPrime.png"],
  },
  arcanes: {
    "Arcane Sculptor": ["ArcaneSculptor.png"],
    "Primary Compression": ["PrimaryCompression.png"],
    "Secondary Cryogenic": ["SecondaryCryogenic.png"],
    "Melee Assimilation": ["MeleeAssimilation.png"],
  },
};

export function isWikiGameImageCategory(s: string): s is GameImageCategory {
  return s === "weapons" || s === "warframes" || s === "mods" || s === "arcanes" || s === "companions";
}

function wikiPng(filename: string): string {
  return `${WIKI_IMAGE_ROOT}/${filename}`;
}

function compactWikiName(name: string): string {
  return name.replace(/\s+/g, "").replace(/&/g, "And");
}

function resolvedDisplayName(name: string, category: GameImageCategory): string {
  if (category === "weapons") return WEAPON_IMAGE_STEM_BY_NAME[name] ?? name;
  if (category === "warframes") return WARFRAME_IMAGE_STEM_BY_NAME[name] ?? name;
  return name;
}

function pushUnique(urls: string[], ...candidates: string[]): void {
  for (const candidate of candidates) {
    if (!urls.includes(candidate)) urls.push(candidate);
  }
}

/**
 * Candidate wiki.warframe.com image.png URLs (first working wins in /api/wiki-game-image).
 * Tries display-name variants before stem maps, then category-specific patterns and related fallbacks.
 */
export function buildWikiImageCandidates(displayName: string, category: GameImageCategory): string[] {
  const resolved = resolvedDisplayName(displayName, category);
  const displayUnderscored = displayName.replace(/\s+/g, "_");
  const displayCompact = compactWikiName(displayName);
  const underscored = resolved.replace(/\s+/g, "_");
  const compact = resolved.replace(/\s+/g, "");
  const urls: string[] = [];

  // Full display name before stem remaps (Prime thumbs, Update 43 weapons, etc.)
  if (displayName !== resolved) {
    pushUnique(
      urls,
      wikiPng(`${displayUnderscored}.png`),
      wikiPng(`${displayCompact}.png`),
    );
  }

  if (category === "warframes") {
    pushUnique(
      urls,
      wikiPng(`${displayCompact}_Thumb.png`),
      wikiPng(`${compact}_Thumb.png`),
    );
    if (displayName.includes("Prime")) {
      pushUnique(urls, wikiPng(`${displayCompact.replace(/Prime$/i, "")}Prime_Thumb.png`));
    }
  }

  pushUnique(urls, wikiPng(`${underscored}.png`), wikiPng(`${compact}.png`));

  if (category === "mods") {
    pushUnique(urls, wikiPng(`${compact}Mod.png`));
  }

  if (category === "arcanes") {
    if (displayName.startsWith("Arcane ")) {
      pushUnique(urls, wikiPng(`${displayCompact}.png`));
    } else {
      pushUnique(urls, wikiPng(`Arcane${compact}.png`));
    }
    pushUnique(urls, wikiPng(`${compact}Mod.png`));
  }

  const related = WIKI_RELATED_IMAGE_FILES[category]?.[displayName];
  if (related) {
    pushUnique(urls, ...related.map(wikiPng));
  }

  const categoryFallback = WIKI_CATEGORY_FALLBACK_FILE[category];
  if (categoryFallback) {
    pushUnique(urls, wikiPng(categoryFallback));
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
