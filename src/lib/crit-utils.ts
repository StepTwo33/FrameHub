function critTierDamage(tier: number, critMultiplier: number): number {
  return tier * (critMultiplier - 1.0) + 1.0;
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
