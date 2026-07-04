/** Arcane Persistence damage/s cap by rank (wiki: ranks 0–5). */
export const PERSISTENCE_DAMAGE_CAP_BY_RANK = [750, 700, 650, 600, 550, 500] as const;

export function getPersistenceDamageCap(rank: number, maxRank = 5): number {
  const r = Math.min(Math.max(rank, 0), maxRank);
  return PERSISTENCE_DAMAGE_CAP_BY_RANK[r] ?? PERSISTENCE_DAMAGE_CAP_BY_RANK[PERSISTENCE_DAMAGE_CAP_BY_RANK.length - 1];
}

export interface ArcaneEffectScaleOpts {
  /** When true, value is the same at every arcane rank (e.g. proc chance, duration). */
  constantAtAllRanks?: boolean;
}

/** Scale arcane stat values linearly from rank 0 → max rank unless constantAtAllRanks. */
export function scaleArcaneEffectValue(
  maxValue: number,
  rank: number,
  maxRank: number,
  opts?: ArcaneEffectScaleOpts,
): number {
  if (opts?.constantAtAllRanks) return maxValue;
  if (maxRank <= 0) return maxValue;
  return maxValue * ((rank + 1) / (maxRank + 1));
}
