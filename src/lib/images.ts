// Image path utilities for item thumbnails
// Files live under /public/images/{category}/ as Name_With_Underscores.png (spaces → "_").
//
// When the display name does not match the shipped PNG (variants, Primes sharing base art, etc.),
// map the in-app name → filename stem (no extension). Keys must match `weapon.name` / `warframe.name`
// from data exactly.
//
// Placeholder PNGs (replace with real wiki-style art when available): `warframes/Follie.png`,
// `weapons/Enkaus.png` — 1×1 transparent files so paths resolve without 404s.

/** In-app display name → PNG stem when it differs from the default `name` → underscores rule */
const WEAPON_IMAGE_STEM_BY_NAME: Record<string, string> = {
  // Coda line reuses base weapon portrait in /public (no separate Coda_* file for Bubonico)
  "Coda Bubonico": "Bubonico",
  "Kuva Ghoulsaw": "Ghoulsaw",
  "Tenet Quanta": "Quanta",
  "Perigale Prime": "Perigale",
  "Sarofang Prime": "Sarofang",
};

const WARFRAME_IMAGE_STEM_BY_NAME: Record<string, string> = {
  // Only Voruna.png is present; use it until Voruna_Prime.png is added
  "Voruna Prime": "Voruna",
};

type ImageCategory = "weapons" | "warframes" | "mods" | "arcanes" | "companions";

function pngStemForCategory(name: string, category: ImageCategory): string {
  const map: Record<string, string> =
    category === "weapons"
      ? WEAPON_IMAGE_STEM_BY_NAME
      : category === "warframes"
        ? WARFRAME_IMAGE_STEM_BY_NAME
        : {};
  const resolved = map[name] ?? name;
  return resolved.replace(/ /g, "_");
}

export function getImagePath(name: string, category: ImageCategory): string {
  const filename = pngStemForCategory(name, category) + ".png";
  return `/images/${category}/${filename}`;
}

export function getWeaponImage(name: string): string {
  return getImagePath(name, "weapons");
}

export function getWarframeImage(name: string): string {
  return getImagePath(name, "warframes");
}

export function getModImage(name: string): string {
  return getImagePath(name, "mods");
}

export function getArcaneImage(name: string): string {
  return getImagePath(name, "arcanes");
}

export function getCompanionImage(name: string): string {
  return getImagePath(name, "companions");
}
