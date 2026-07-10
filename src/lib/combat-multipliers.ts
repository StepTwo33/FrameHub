/**
 * Shared combat multipliers: faction (Bane), headshots, stance averages, status damage.
 * Used by weapon DPS and TTK so both stay in sync.
 */

/** Map mod stat keys → normalized faction ids used by ENEMY_TYPES / sim UI. */
export const FACTION_STAT_TO_ID: Record<string, string> = {
  factionGrineer: "grineer",
  factionCorpus: "corpus",
  factionInfested: "infested",
  factionOrokin: "orokin",
  factionCorrupted: "orokin", // Bane of Orokin covers Corrupted
  factionMurmur: "murmur",
  factionSentient: "sentient",
  factionNarmer: "narmer",
};

/** EnemyType.faction string → normalized id. */
export function normalizeFactionName(faction: string | undefined | null): string {
  if (!faction) return "";
  const f = faction.toLowerCase().trim();
  if (f === "corrupted" || f === "orokin") return "orokin";
  if (f === "stalker") return "stalker";
  if (f.includes("murmur") || f.includes("the murmur")) return "murmur";
  if (f.includes("grineer")) return "grineer";
  if (f.includes("corpus")) return "corpus";
  if (f.includes("infest")) return "infested";
  if (f.includes("sentient")) return "sentient";
  if (f.includes("narmer")) return "narmer";
  return f;
}

export function factionBonusFromStats(
  factionBonuses: Record<string, number> | undefined,
  targetFaction: string | undefined | null,
): number {
  if (!factionBonuses || !targetFaction) return 0;
  const id = normalizeFactionName(targetFaction);
  if (!id) return 0;
  // Prefer exact key; also accept raw enemy faction labels
  return factionBonuses[id] ?? factionBonuses[targetFaction] ?? 0;
}

/**
 * Direct hit faction mult: (1 + bane%).
 * DoT ticks get this squared in-game.
 */
export function factionHitMultiplier(factionBonus: number): number {
  return 1 + Math.max(0, factionBonus);
}

export function factionDotMultiplier(factionBonus: number): number {
  const m = factionHitMultiplier(factionBonus);
  return m * m;
}

/**
 * Headshot / weak-point multiplier.
 * Base head multi is typically 2×; weak-point / Acuity bonuses add to that.
 */
export function headshotMultiplier(
  applyHeadshots: boolean | undefined,
  headshotDamageBonus = 0,
  baseHeadMulti = 2,
): number {
  if (!applyHeadshots) return 1;
  return baseHeadMulti * (1 + Math.max(0, headshotDamageBonus));
}

/**
 * Approximate average stance damage multiplier (combo string average, first target).
 * Real stances vary 1.2–2.5×; unknown equipped stances use a conservative mid value.
 */
export const STANCE_AVG_DAMAGE_MULTIPLIER: Record<string, number> = {
  // Heavy blade / popular
  stance_cleaving_whirlwind: 1.85,
  stance_temporal_royale: 2.1,
  stance_rumbling_vault: 1.7,
  // Sword
  stance_iron_phoenix: 1.55,
  stance_crimson_dervish: 1.65,
  stance_vengeful_revenant: 1.75,
  stance_swooping_falcon: 1.6,
  // Nikana
  stance_decisive_judgement: 1.8,
  stance_transcending_recut: 1.7,
  // Dual swords
  stance_crossing_snakes: 1.55,
  stance_swirling_tiger: 1.6,
  stance_carving_mantis: 1.65,
  // Polearm
  stance_shimmering_blight: 1.7,
  stance_bleeding_willow: 1.65,
  stance_twirling_spire: 1.75,
  // Glaive
  stance_gleaming_talent: 1.5,
  stance_aurora_rush: 1.55,
};

export const DEFAULT_STANCE_AVG_MULTIPLIER = 1.55;

export function resolveStanceDamageMultiplier(
  equippedMods: { modId: string }[],
): number {
  for (const slot of equippedMods) {
    if (!slot.modId.startsWith("stance_")) continue;
    return STANCE_AVG_DAMAGE_MULTIPLIER[slot.modId] ?? DEFAULT_STANCE_AVG_MULTIPLIER;
  }
  return 1;
}

/** Combined non-crit, non-MS damage mult for paper DPS. */
export function combatDamageMultiplier(opts: {
  factionBonus?: number;
  applyHeadshots?: boolean;
  headshotDamageBonus?: number;
  stanceMultiplier?: number;
}): number {
  const faction = factionHitMultiplier(opts.factionBonus ?? 0);
  const head = headshotMultiplier(opts.applyHeadshots, opts.headshotDamageBonus ?? 0);
  const stance = opts.stanceMultiplier && opts.stanceMultiplier > 0 ? opts.stanceMultiplier : 1;
  return faction * head * stance;
}
