// Image path utilities for item thumbnails.
// All icons load from /public/images/{category}/ — static, instant, no external proxy.

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
  "Sirius & Orion": "Sirius_Orion",
};

export type GameImageCategory = "weapons" | "warframes" | "mods" | "arcanes" | "companions";

/** Shared icon for companion beast claw weapons. */
export const BEAST_CLAW_IMAGE_PATH = "/images/weapons/Beast_Claws.png";

/** Explicit local PNG overrides when the default stem rule does not match the file on disk. */
const LOCAL_IMAGE_OVERRIDES: Partial<Record<GameImageCategory, Record<string, string>>> = {
  warframes: {
    "Sirius & Orion": "/images/warframes/Sirius_Orion.png",
  },
};

function resolvedDisplayName(name: string, category: GameImageCategory): string {
  if (category === "weapons") return WEAPON_IMAGE_STEM_BY_NAME[name] ?? name;
  if (category === "warframes") return WARFRAME_IMAGE_STEM_BY_NAME[name] ?? name;
  return name;
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
  return resolveDirectGameImage("mods", name);
}

export function getArcaneImage(name: string): string {
  return resolveDirectGameImage("arcanes", name);
}

export function getCompanionImage(name: string): string {
  return resolveDirectGameImage("companions", name);
}
