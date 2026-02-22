// Image path utilities for item thumbnails
// Images are stored in /public/images/{category}/ with Name_With_Spaces.png naming

type ImageCategory = "weapons" | "warframes" | "mods" | "arcanes" | "companions";

export function getImagePath(name: string, category: ImageCategory): string {
  const filename = name.replace(/ /g, "_") + ".png";
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
