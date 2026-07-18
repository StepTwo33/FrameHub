export function critTierDamage(tier: number, critMultiplier: number): number {
  return tier * (critMultiplier - 1.0) + 1.0;
}

/**
 * Quantize a weapon's base critical damage multiplier (wiki Critical Hit).
 * Applied after base-additive effects (e.g. Critical Parallel), before % crit-damage mods.
 * Quantized Base CM = Round(Base CM × 4095/32) × (32/4095)
 */
export function quantizeBaseCritMultiplier(baseCM: number): number {
  return Math.round(baseCM * (4095 / 32)) * (32 / 4095);
}

export function avgCritMultiplier(critChance: number, critMultiplier: number): number {
  if (critChance <= 0) return 1.0;
  if (critChance <= 1.0) {
    return 1.0 + critChance * (critMultiplier - 1.0);
  }
  const tier = Math.floor(critChance);
  const remainder = critChance - tier;
  const currentTierDmg = critTierDamage(tier, critMultiplier);
  const nextTierDmg = critTierDamage(tier + 1, critMultiplier);
  return (1.0 - remainder) * currentTierDmg + remainder * nextTierDmg;
}

/** Crit tiers to show in HIT DAMAGE UI (1 = yellow …). */
export function critTiersToShow(critChance: number): number[] {
  const tiers = [1];
  if (critChance <= 0) return tiers;
  const maxTier = Math.max(1, Math.floor(critChance) + 1);
  for (let t = 2; t <= maxTier; t++) {
    if (critChance >= t - 1) tiers.push(t);
  }
  return tiers;
}

export function critTierLabel(tier: number): string {
  if (tier === 1) return "Yellow crit";
  if (tier === 2) return "Orange crit";
  if (tier === 3) return "Red crit";
  return `Tier ${tier} crit`;
}

export function critTierColorClass(tier: number): string {
  if (tier === 1) return "text-yellow-400";
  if (tier === 2) return "text-orange-400";
  if (tier === 3) return "text-red-400";
  return "text-fuchsia-400";
}

/** In-game client damage uses signed 32-bit; values above this can wrap to large negatives. */
export const WF_DAMAGE_INT_MAX = 2147483647;

export function exceedsWarframeInt32(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value) > WF_DAMAGE_INT_MAX;
}
