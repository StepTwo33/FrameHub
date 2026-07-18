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
