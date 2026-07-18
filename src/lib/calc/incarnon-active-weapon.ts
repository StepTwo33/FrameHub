/**
 * Resolve whether Incarnon Form is active and build the weapon used for calc.
 * Form stats replace base attack when tier-1 "Incarnon Form" evolution is selected.
 */

import type { IncarnonForm, IncarnonWeaponData } from "@/data/incarnon";
import type { Weapon } from "@/lib/types";

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

/**
 * Overlay Incarnon Form attack stats onto the arsenal weapon.
 * Clears IPS/elements then applies form damage (typed element when provided).
 * Strips base radials (e.g. Torid Poison Cloud) — form has its own attack profile.
 */
export function applyIncarnonFormToWeapon(base: Weapon, form: IncarnonForm): Weapon {
  const next: Weapon = {
    ...base,
    damage: form.damage,
    impact: 0,
    puncture: 0,
    slash: 0,
    fireRate: form.fireRate,
    criticalChance: form.criticalChance,
    criticalMultiplier: form.criticalMultiplier,
    statusChance: form.statusChance,
    triggerType: form.triggerType,
    magazine: form.magazine ?? base.magazine,
    reloadTime: form.reloadTime ?? base.reloadTime,
    // Form is a distinct attack — do not keep grenade/cloud radials from base.
    radialAttacks: [],
  };

  for (const k of ELEM_KEYS) {
    delete (next as unknown as Record<string, unknown>)[k];
  }

  const typed =
    form.toxin ??
    form.heat ??
    form.cold ??
    form.electricity ??
    form.radiation ??
    form.viral ??
    form.corrosive ??
    form.blast ??
    form.gas ??
    form.magnetic ??
    form.tau;

  if (typed != null && typed > 0) {
    if (form.toxin != null) next.toxin = form.toxin;
    else if (form.heat != null) next.heat = form.heat;
    else if (form.cold != null) next.cold = form.cold;
    else if (form.electricity != null) next.electricity = form.electricity;
    else if (form.radiation != null) next.radiation = form.radiation;
    else if (form.viral != null) next.viral = form.viral;
    else if (form.corrosive != null) next.corrosive = form.corrosive;
    else if (form.blast != null) next.blast = form.blast;
    else if (form.gas != null) next.gas = form.gas;
    else if (form.magnetic != null) next.magnetic = form.magnetic;
    else if (form.tau != null) next.tau = form.tau;
  } else if (form.damageType) {
    const key = form.damageType.toLowerCase();
    (next as unknown as Record<string, unknown>)[key] = form.damage;
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
