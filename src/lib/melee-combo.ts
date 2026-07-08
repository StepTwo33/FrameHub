import type { CalculatedStats, Mod, ModSlot } from "@/lib/types";
import { avgCritMultiplier } from "@/lib/crit-utils";

/** Wiki: standard tiers every 20 hits; heavy max 12×, BR/WW scaling max 3.75×. */
export const STANDARD_COMBO_STEP = 20;
export const STANDARD_HEAVY_COMBO_MAX = 12;
export const STANDARD_SCALING_COMBO_MAX = 3.75;

/** Dex Nikana: tiers every 11 hits; heavy max 11×. */
export const DEX_NIKANA_COMBO_STEP = 11;
export const DEX_NIKANA_HEAVY_COMBO_MAX = 11;

export interface MeleeComboTierRules {
  step: number;
  heavyMax: number;
  /** Max melee damage multiplier tier (Blood Rush / Weeping Wounds). */
  scalingMax: number;
  /** Venka Prime: 13× heavy / 4× scaling at 240+ hits. */
  venkaHeavy240?: number;
  venkaScaling240?: number;
}

export interface MeleeComboModContext {
  hasBloodRush: boolean;
  bloodRushValue: number;
  hasWeepingWounds: boolean;
  weepingWoundsValue: number;
  gladiatorCount: number;
}

/** Innate starting combo counter from weapon passives (rank-3 / max). */
export const WEAPON_INNATE_INITIAL_COMBO: Record<string, number> = {
  fragor_prime: 30,
  furia_wraith: 20,
  synoid_heliocor: 20,
};

export function getMeleeComboRules(weaponId?: string): MeleeComboTierRules {
  if (weaponId === "dex_nikana") {
    return {
      step: DEX_NIKANA_COMBO_STEP,
      heavyMax: DEX_NIKANA_HEAVY_COMBO_MAX,
      // 10 scaling tiers above 1.0 at 11-hit cadence → 1.25 + 9×0.25
      scalingMax: 1.25 + 9 * 0.25,
    };
  }
  if (weaponId === "venka_prime") {
    return {
      step: STANDARD_COMBO_STEP,
      heavyMax: STANDARD_HEAVY_COMBO_MAX,
      scalingMax: STANDARD_SCALING_COMBO_MAX,
      venkaHeavy240: 13,
      venkaScaling240: 4,
    };
  }
  return {
    step: STANDARD_COMBO_STEP,
    heavyMax: STANDARD_HEAVY_COMBO_MAX,
    scalingMax: STANDARD_SCALING_COMBO_MAX,
  };
}

function tierIndex(comboCount: number, step: number): number {
  if (comboCount < step) return -1;
  return Math.floor((comboCount - step) / step);
}

/** Melee Damage Multiplier column — Blood Rush, Weeping Wounds, Gladiator. */
export function getMeleeScalingMultiplier(comboCount: number, weaponId?: string): number {
  const rules = getMeleeComboRules(weaponId);
  if (rules.venkaScaling240 != null && comboCount >= 240) return rules.venkaScaling240;
  const tier = tierIndex(comboCount, rules.step);
  if (tier < 0) return 1;
  return Math.min(1.25 + tier * 0.25, rules.scalingMax);
}

/** Heavy Attack Multiplier column — heavy slam damage tier. */
export function getHeavyAttackComboMultiplier(comboCount: number, weaponId?: string): number {
  const rules = getMeleeComboRules(weaponId);
  if (rules.venkaHeavy240 != null && comboCount >= 240) return rules.venkaHeavy240;
  const tier = tierIndex(comboCount, rules.step);
  if (tier < 0) return 1;
  return Math.min(2 + tier, rules.heavyMax);
}

/** Corrupt Charge and similar: stat value is max-rank total, scaled by rank. */
export function sumInitialComboFromMods(
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
): number {
  let total = 0;
  for (const modSlot of equippedMods) {
    const mod = allMods.get(modSlot.modId);
    if (!mod?.stats.comboCount) continue;
    const rank = Math.min(Math.max(modSlot.rank ?? 0, 0), mod.maxRank);
    total += (mod.stats.comboCount * (rank + 1)) / (mod.maxRank + 1);
  }
  return Math.round(total);
}

export function getInnateInitialCombo(weaponId?: string): number {
  if (!weaponId) return 0;
  return WEAPON_INNATE_INITIAL_COMBO[weaponId] ?? 0;
}

export function resolveEffectiveComboCount(
  simComboCount: number,
  weaponId: string | undefined,
  equippedMods: ModSlot[],
  allMods: Map<string, Mod>,
  extraCombo = 0,
): number {
  return (
    simComboCount +
    sumInitialComboFromMods(equippedMods, allMods) +
    getInnateInitialCombo(weaponId) +
    extraCombo
  );
}

/** Apply combo tiers, Blood Rush / Weeping / Gladiator, and heavy attack damage. */
export function applyMeleeComboToStats(
  stats: CalculatedStats,
  comboCount: number,
  weaponId: string | undefined,
  ctx: MeleeComboModContext,
): void {
  stats.comboCount = comboCount;
  stats.comboMultiplier = getMeleeScalingMultiplier(comboCount, weaponId);
  stats.heavyAttackComboMultiplier = getHeavyAttackComboMultiplier(comboCount, weaponId);

  const critBase = stats.preComboCriticalChance ?? stats.criticalChance;
  const statusBase = stats.preComboStatusChance ?? stats.statusChance;
  stats.criticalChance = critBase;
  stats.statusChance = statusBase;
  stats.bloodRushStacks = 0;

  let comboScaling = 0;
  if (ctx.hasBloodRush) {
    stats.bloodRushStacks = ctx.bloodRushValue;
    comboScaling += ctx.bloodRushValue * (stats.comboMultiplier - 1);
  }
  if (ctx.gladiatorCount > 0 && stats.comboMultiplier > 1) {
    let gladPerTier = 0.1 * ctx.gladiatorCount;
    if (ctx.gladiatorCount >= 6) gladPerTier += 0.15;
    comboScaling += gladPerTier * (stats.comboMultiplier - 1);
  }
  if (comboScaling > 0) {
    stats.criticalChance *= 1 + comboScaling;
  }

  if (ctx.hasWeepingWounds) {
    stats.weepingWoundsBonus = ctx.weepingWoundsValue;
    stats.statusChance *= 1 + ctx.weepingWoundsValue * (stats.comboMultiplier - 1);
  } else {
    stats.weepingWoundsBonus = 0;
  }

  stats.heavyAttackDamage =
    stats.totalDamage *
    stats.heavyAttackComboMultiplier *
    avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);
}
