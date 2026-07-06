/** Weapons that accept Canticle (Exilus) and Invocation mods. */
export const TOME_WEAPON_IDS = new Set([
  "grimoire",
  "noctua", // Dante's exalted tome
]);

export function isTomeWeapon(weaponId: string | undefined): boolean {
  return !!weaponId && TOME_WEAPON_IDS.has(weaponId);
}
