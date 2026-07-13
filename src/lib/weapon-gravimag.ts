import type { Weapon } from "@/lib/types";

/**
 * Archguns have two stat profiles: Archwing (space) and Gravimag-deployed
 * (atmosphere). Base weapon data stores the Archwing values; entries with
 * `atmosphereStats` support toggling to the atmospheric profile.
 */
export function weaponHasGravimagMode(weapon: Weapon | null | undefined): boolean {
  return !!weapon && weapon.category === "archgun" && weapon.atmosphereStats != null;
}

/** Merge Gravimag (Atmosphere) overrides into an archgun's base (Archwing) stats. */
export function applyGravimagMode(weapon: Weapon): Weapon {
  const atmos = weapon.atmosphereStats;
  if (!atmos) return weapon;
  const { radialAttacks, ...statOverrides } = atmos;
  const merged: Weapon = { ...weapon, ...statOverrides };
  if (radialAttacks) merged.radialAttacks = radialAttacks;
  return merged;
}
