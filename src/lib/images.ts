// Image path utilities for item thumbnails.
//
// Weapons, warframes, and companions load from /public/images (static, instant).
// Mods and arcanes use /api/wiki-game-image → wiki.warframe.com when USE_WIKI_GAME_IMAGES is enabled.
// Set NEXT_PUBLIC_USE_WIKI_GAME_IMAGES=false to use /public/images/{category}/ for everything.
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
  "Ax-52": "Ax-52",
  "Efv-5 Jupiter": "Efv-5_Jupiter",
  "Efv-8 Mars": "Efv-8_Mars",
};

const WARFRAME_IMAGE_STEM_BY_NAME: Record<string, string> = {
  "Voruna Prime": "Voruna",
  "Styanax Prime": "Styanax",
  "Sirius & Orion": "Sirius_Orion",
};

export type GameImageCategory = "weapons" | "warframes" | "mods" | "arcanes" | "companions";

const WIKI_IMAGE_ROOT = "https://wiki.warframe.com/images";

/** Shown when no wiki filename matches (wiki-hosted neutral asset). */
export const WIKI_IMAGE_FALLBACK_URL = `${WIKI_IMAGE_ROOT}/Logo.png`;

/** When not "false", mod/weapon/etc. thumbnails go through /api/wiki-game-image (wiki CDN). */
export const USE_WIKI_GAME_IMAGES = process.env.NEXT_PUBLIC_USE_WIKI_GAME_IMAGES !== "false";

/** Shared icon for companion beast claw weapons. */
export const BEAST_CLAW_IMAGE_PATH = "/images/weapons/Beast_Claws.png";

/** Explicit local PNG overrides (always preferred over wiki). */
const LOCAL_IMAGE_OVERRIDES: Partial<Record<GameImageCategory, Record<string, string>>> = {
  warframes: {
    "Sirius & Orion": "/images/warframes/Sirius_Orion.png",
  },
  weapons: {
    Wrath: "/images/weapons/Wrath.png",
    Pride: "/images/weapons/Pride.png",
    Enkaus: "/images/weapons/Enkaus.png",
  },
};

/**
 * Exact wiki.warframe.com filenames to try before generic underscore/compact candidates.
 * Prevents wrong matches (e.g. Boar.png before Boar_Prime.png, Machete_Wraith render vs icon).
 */
const WIKI_PREFERRED_IMAGE_FILES: Partial<Record<GameImageCategory, Record<string, string[]>>> = {
  weapons: {
    "Ax-52": ["AX-52.png"],
    "Boar Prime": ["Boar_Prime.png", "BoarPrime.png"],
    "Mk1-Braton": ["MK1-Braton.png"],
    "Mk1-Paris": ["MK1-Paris.png"],
    "Mk1-Strun": ["MK1-Strun.png"],
    "Mk1-Furis": ["MK1-Furis.png"],
    "Mk1-Kunai": ["MK1-Kunai.png"],
    "Mk1-Bo": ["MK1-Bo.png"],
    "Mk1-Furax": ["MK1-Furax.png"],
    "Efv-5 Jupiter": ["EFV-5Jupiter.png"],
    "Efv-8 Mars": ["EFV-8Mars.png"],
    "Machete Wraith": ["MacheteWraith.png", "Machete_Wraith.png"],
    "Dex Furis": ["Dex_Furis.png", "DexFuris.png"],
    "Dual Ether": ["DualEther.png", "Dual_Ether.png"],
    "Strun Wraith": ["Strun_Wraith.png", "StrunWraith.png"],
    "Snipetron Vandal": ["Snipetron_Vandal.png", "SnipetronVandal.png"],
    "Rubico Prime": ["Rubico_Prime.png", "RubicoPrime.png"],
    "Pangolin Prime": ["Pangolin_Prime.png", "PangolinPrime.png"],
    "Sancti Tigris": ["Sancti_Tigris.png", "SanctiTigris.png"],
    "Dark Split-Sword": ["Dark_Split-Sword.png", "DarkSplitSword.png"],
    "Exalted Blade": ["Exalted_Blade.png", "ExaltedBlade.png"],
  },
};

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
    "Athodai Prime": ["AthodaiPrime.png"],
    "Afentis Prime": ["AfentisPrime.png"],
    "Desert Wind Prime": ["DesertWind.png"],
    "Exalted Blade (Umbra)": ["ExaltedBladeR.png"],
    "Exalted Blade (Prime)": ["ExaltedBladeR.png"],
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
  return name.replace(/\s+/g, "").replace(/&/g, "And").replace(/-/g, "");
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
 * Preferred filenames first, then display-name variants, stem maps, and related fallbacks.
 */
export function buildWikiImageCandidates(displayName: string, category: GameImageCategory): string[] {
  const resolved = resolvedDisplayName(displayName, category);
  const displayUnderscored = displayName.replace(/\s+/g, "_");
  const displayCompact = compactWikiName(displayName);
  const underscored = resolved.replace(/\s+/g, "_");
  const compact = resolved.replace(/\s+/g, "");
  const urls: string[] = [];

  const preferred = WIKI_PREFERRED_IMAGE_FILES[category]?.[displayName];
  if (preferred) {
    pushUnique(urls, ...preferred.map(wikiPng));
  }

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

export function pngStemForCategory(name: string, category: GameImageCategory): string {
  return resolvedDisplayName(name, category).replace(/ /g, "_");
}

export function getImagePath(name: string, category: GameImageCategory): string {
  const filename = pngStemForCategory(name, category) + ".png";
  return `/images/${category}/${filename}`;
}

export function getLocalImageOverride(category: GameImageCategory, name: string): string | undefined {
  return LOCAL_IMAGE_OVERRIDES[category]?.[name];
}

export interface WeaponImageOptions {
  category?: string;
}

function wikiProxyUrl(category: GameImageCategory, displayName: string, weaponCategory?: string): string {
  const params = new URLSearchParams({ k: category, n: displayName });
  if (weaponCategory) params.set("c", weaponCategory);
  return `/api/wiki-game-image?${params.toString()}`;
}

function resolveDirectGameImage(category: GameImageCategory, name: string, weaponCategory?: string): string {
  if (weaponCategory === "beast_claw") return BEAST_CLAW_IMAGE_PATH;
  const override = getLocalImageOverride(category, name);
  if (override) return override;
  return getImagePath(name, category);
}

export function getWeaponImage(name: string, options?: WeaponImageOptions): string {
  return resolveDirectGameImage("weapons", name, options?.category);
}

export function getWarframeImage(name: string): string {
  return resolveDirectGameImage("warframes", name);
}

export function getModImage(name: string): string {
  if (!USE_WIKI_GAME_IMAGES) return getImagePath(name, "mods");
  return wikiProxyUrl("mods", name);
}

export function getArcaneImage(name: string): string {
  if (!USE_WIKI_GAME_IMAGES) return getImagePath(name, "arcanes");
  return wikiProxyUrl("arcanes", name);
}

export function getCompanionImage(name: string): string {
  if (!USE_WIKI_GAME_IMAGES) return getImagePath(name, "companions");
  return resolveDirectGameImage("companions", name);
}
