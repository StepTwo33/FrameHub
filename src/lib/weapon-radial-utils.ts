import { WEAPON_RADIAL_ATTACKS } from "@/data/weapon-radial-attacks";
import type { Weapon, WeaponRadialAttack } from "@/lib/types";

export const RADIAL_DAMAGE_KEYS = [
  "impact",
  "puncture",
  "slash",
  "heat",
  "cold",
  "toxin",
  "electricity",
  "radiation",
  "viral",
  "corrosive",
  "blast",
  "gas",
  "magnetic",
] as const;

export type RadialDamageKey = (typeof RADIAL_DAMAGE_KEYS)[number];

export const RADIAL_ELEMENT_OPTIONS: { value: RadialDamageKey | ""; label: string }[] = [
  { value: "", label: "None (use IPS / total only)" },
  { value: "impact", label: "Impact" },
  { value: "puncture", label: "Puncture" },
  { value: "slash", label: "Slash" },
  { value: "heat", label: "Heat" },
  { value: "cold", label: "Cold" },
  { value: "toxin", label: "Toxin" },
  { value: "electricity", label: "Electricity" },
  { value: "radiation", label: "Radiation" },
  { value: "viral", label: "Viral" },
  { value: "corrosive", label: "Corrosive" },
  { value: "blast", label: "Blast" },
  { value: "gas", label: "Gas" },
  { value: "magnetic", label: "Magnetic" },
];

export function getWeaponRadialAttacks(weapon: Weapon): WeaponRadialAttack[] {
  return weapon.radialAttacks ?? WEAPON_RADIAL_ATTACKS[weapon.id] ?? [];
}

export function weaponHasRadialAttacks(weapon: Weapon): boolean {
  return getWeaponRadialAttacks(weapon).length > 0;
}

export function radialAttackDamageTags(attack: WeaponRadialAttack): string[] {
  const tags: string[] = [];
  for (const key of RADIAL_DAMAGE_KEYS) {
    const val = attack[key];
    if (val != null && val > 0) tags.push(`${key} ${Math.round(val)}`);
  }
  return tags;
}

export function findPrimaryElementKey(attack: WeaponRadialAttack): RadialDamageKey | "" {
  for (const key of RADIAL_DAMAGE_KEYS) {
    const val = attack[key];
    if (val != null && val > 0) return key;
  }
  return "";
}
