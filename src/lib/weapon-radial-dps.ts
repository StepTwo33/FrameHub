import type { CalculatedStats, Weapon, WeaponRadialAttack } from "@/lib/types";
import { avgCritMultiplier } from "@/lib/crit-utils";
import { getWeaponRadialAttacks } from "@/lib/weapon-radial-utils";

export interface ScaledRadialAttack extends WeaponRadialAttack {
  /** Average damage after linear radius falloff (center = full, edge = 1 − falloffReduction). */
  avgDamage: number;
  /** Estimated burst DPS when the radial procs at the inferred rate; 0 for manual slams. */
  burstDps: number;
}

/** Linear falloff average: center full damage, edge reduced by falloffReduction. */
export function avgRadialDamage(attack: WeaponRadialAttack): number {
  const falloff = attack.falloffReduction ?? 0;
  return attack.totalDamage * (1 - falloff * 0.5);
}

function isManualSlam(name: string): boolean {
  return /\bslam attack\b|\bheavy slam\b|\bground slam\b/i.test(name);
}

function isAltFireOrDelayed(attack: WeaponRadialAttack): boolean {
  if ((attack.explosionDelay ?? 0) > 0) return true;
  return /alt[- ]?fire|charged|semi-auto mode|incarnon form|poison quill|semi-auto mode/i.test(attack.name);
}

function shotsPerSecond(stats: Pick<CalculatedStats, "fireRate" | "effectiveFireRate">): number {
  if (stats.effectiveFireRate != null && stats.effectiveFireRate > 0) {
    return stats.effectiveFireRate;
  }
  return Math.max(0, stats.fireRate);
}

/** Infer how often this radial fires alongside the primary attack pattern. */
export function radialAttacksPerSecond(
  attack: WeaponRadialAttack,
  stats: Pick<CalculatedStats, "fireRate" | "effectiveFireRate" | "multishot">,
  isMelee: boolean,
): number {
  if (isManualSlam(attack.name)) return 0;
  const efr = shotsPerSecond(stats);
  if (isAltFireOrDelayed(attack)) return efr;
  if (isMelee) return 0;
  // Innate per-projectile / per-pellet explosions scale with multishot.
  return efr * stats.multishot;
}

export function computeRadialBurstDps(
  attack: WeaponRadialAttack,
  stats: Pick<
    CalculatedStats,
    "criticalChance" | "criticalMultiplier" | "fireRate" | "effectiveFireRate" | "multishot"
  >,
  isMelee: boolean,
): number {
  const rate = radialAttacksPerSecond(attack, stats, isMelee);
  if (rate <= 0) return 0;
  const avgCrit = avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);
  return avgRadialDamage(attack) * rate * avgCrit;
}

export function scaleRadialAttacksWithDps(
  baseWeapon: Weapon,
  stats: CalculatedStats,
): { attacks: ScaledRadialAttack[]; radialBurstDps: number; radialSustainedDps: number } {
  const attacks = getWeaponRadialAttacks(baseWeapon);
  if (!attacks.length || !baseWeapon.damage) {
    return { attacks: [], radialBurstDps: 0, radialSustainedDps: 0 };
  }

  const isMelee =
    baseWeapon.category === "melee" || baseWeapon.triggerType === "Melee";
  const mult = stats.totalDamage / baseWeapon.damage;
  const avgCrit = avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);

  let radialBurstDps = 0;
  const scaled: ScaledRadialAttack[] = attacks.map((attack) => {
    const totalDamage = attack.totalDamage * mult;
    const scaledAttack: WeaponRadialAttack = {
      name: attack.name,
      radius: attack.radius,
      totalDamage,
    };
    if (attack.falloffReduction != null) {
      scaledAttack.falloffReduction = attack.falloffReduction;
    }
    if (attack.explosionDelay != null) {
      scaledAttack.explosionDelay = attack.explosionDelay;
    }
    for (const key of [
      "impact", "puncture", "slash", "heat", "cold", "toxin", "electricity",
      "radiation", "viral", "corrosive", "blast", "gas", "magnetic",
    ] as const) {
      const val = attack[key];
      if (val != null && val > 0) scaledAttack[key] = val * mult;
    }

    const avgDamage = avgRadialDamage(scaledAttack);
    const rate = radialAttacksPerSecond(scaledAttack, stats, isMelee);
    const burstDps = rate > 0 ? avgDamage * rate * avgCrit : 0;
    radialBurstDps += burstDps;

    return { ...scaledAttack, avgDamage, burstDps };
  });

  let radialSustainedDps = radialBurstDps;
  const efr = shotsPerSecond(stats);
  if (!isMelee && stats.magazine > 0 && efr > 0) {
    const magTime = stats.magazine / efr;
    const cycleTime = magTime + stats.reloadTime;
    if (cycleTime > 0) {
      radialSustainedDps = radialBurstDps * (magTime / cycleTime);
    }
  }

  return { attacks: scaled, radialBurstDps, radialSustainedDps };
}
