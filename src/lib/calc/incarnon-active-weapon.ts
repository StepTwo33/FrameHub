/**
 * Resolve whether Incarnon Form is active and build the weapon used for calc.
 * Form stats replace base attack when tier-1 "Incarnon Form" evolution is selected.
 */

import type { IncarnonForm, IncarnonWeaponData } from "@/data/incarnon";
import { WEAPON_RADIAL_ATTACKS } from "@/data/weapon-radial-attacks";
import type { Weapon, WeaponRadialAttack } from "@/lib/types";

export function isIncarnonFormActive(
  selectedEvolutions: Record<number, number> | undefined,
  incarnonData: IncarnonWeaponData | undefined,
): boolean {
  if (!incarnonData || !selectedEvolutions) return false;
  const slot = selectedEvolutions[1];
  if (slot == null) return false;
  const evo = incarnonData.evolutions.find((e) => e.tier === 1 && e.slot === slot);
  if (!evo) return false;
  return /incarnon\s*form/i.test(evo.name);
}

/** Pick the Incarnon Form entry from forms[] (prefer name match). */
export function getIncarnonFormAttack(data: IncarnonWeaponData): IncarnonForm | undefined {
  return data.forms.find((f) => /incarnon/i.test(f.name)) ?? data.forms[1];
}

const ELEM_KEYS = [
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
  "tau",
] as const;

function formOnlyRadials(weaponId: string): WeaponRadialAttack[] {
  const all = WEAPON_RADIAL_ATTACKS[weaponId] ?? [];
  return all.filter((a) => /incarnon form/i.test(a.name));
}

/**
 * Overlay Incarnon Form attack stats onto the arsenal weapon.
 * Clears IPS/elements then applies form damage (typed element / IPS when provided).
 * Keeps only Incarnon Form radials for this weapon id (drops Poison Cloud etc.).
 * Melee forms are not swapped — Incarnon melee is buff-driven, not a new arsenal attack.
 */
export function applyIncarnonFormToWeapon(base: Weapon, form: IncarnonForm): Weapon {
  if (
    form.triggerType === "Melee" ||
    base.category === "melee" ||
    base.triggerType === "Melee"
  ) {
    return base;
  }

  const formRadials = formOnlyRadials(base.id);

  const next: Weapon = {
    ...base,
    damage: form.damage,
    impact: form.impact ?? 0,
    puncture: form.puncture ?? 0,
    slash: form.slash ?? 0,
    fireRate: form.fireRate,
    criticalChance: form.criticalChance,
    criticalMultiplier: form.criticalMultiplier,
    statusChance: form.statusChance,
    triggerType: form.triggerType,
    magazine: form.magazine ?? base.magazine,
    reloadTime: form.reloadTime ?? base.reloadTime,
    multishot: form.multishot ?? base.multishot,
    radialAttacks: formRadials,
  };

  for (const k of ELEM_KEYS) {
    delete (next as unknown as Record<string, unknown>)[k];
  }

  let appliedElem = false;
  for (const k of ELEM_KEYS) {
    const v = form[k];
    if (v != null && v > 0) {
      (next as unknown as Record<string, number>)[k] = v;
      appliedElem = true;
    }
  }
  if (!appliedElem && form.damageType) {
    const key = form.damageType.toLowerCase();
    (next as unknown as Record<string, unknown>)[key] = form.damage;
  }

  // Variant-aware pure-element forms (e.g. Burston vs Burston Prime Heat):
  // when the form radial is a single matching element, sync direct damage from it.
  if (form.heat != null && formRadials.length === 1) {
    const r = formRadials[0];
    if (r.heat != null && r.heat > 0 && r.totalDamage === r.heat) {
      next.heat = r.heat;
      next.damage = r.heat;
      next.impact = 0;
      next.puncture = 0;
      next.slash = 0;
    }
  }

  // Dual-type forms (e.g. Phenmor Slash + Radiation): damage = sum of parts
  const ips = (next.impact ?? 0) + (next.puncture ?? 0) + (next.slash ?? 0);
  let eleSum = 0;
  for (const k of ELEM_KEYS) {
    eleSum += (next as unknown as Record<string, number | undefined>)[k] ?? 0;
  }
  if (ips + eleSum > 0) {
    next.damage = ips + eleSum;
  }

  return next;
}

/**
 * Weapon instance for calculator: form attack when Incarnon Form evo is selected, else base.
 */
export function resolveIncarnonActiveWeapon(
  base: Weapon,
  incarnonData: IncarnonWeaponData | undefined,
  selectedEvolutions: Record<number, number> | undefined,
): Weapon {
  if (!isIncarnonFormActive(selectedEvolutions, incarnonData)) return base;
  const form = getIncarnonFormAttack(incarnonData!);
  if (!form) return base;
  return applyIncarnonFormToWeapon(base, form);
}
