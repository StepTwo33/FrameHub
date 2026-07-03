import { WEAPON_PASSIVES } from "@/data/weapon-passives";
import { WEAPON_RADIAL_ATTACKS } from "@/data/weapon-radial-attacks";
import type { Weapon } from "@/lib/types";

/** Attach wiki passives and radial attack profiles when missing on the weapon record. */
export function enrichWeapon(w: Weapon): Weapon {
  const passive = w.passive ?? WEAPON_PASSIVES[w.id];
  const radialAttacks = w.radialAttacks ?? WEAPON_RADIAL_ATTACKS[w.id];
  if (!passive && !radialAttacks) return w;
  return {
    ...w,
    ...(passive ? { passive } : {}),
    ...(radialAttacks ? { radialAttacks } : {}),
  };
}
