import { Mod } from "@/lib/types";

/** Aura-slot mod IDs (negative drain auras + matching-polarity bonus mods). */
export const AURA_MOD_IDS = new Set([
  "aura_steel_charge",
  "aura_energy_siphon",
  "aura_corrosive_projection",
  "aura_rejuvenation",
  "aura_enemy_radar",
  "aura_physique",
  "aura_rifle_amplification",
  "aura_shotgun_amplification",
  "aura_pistol_amplification",
  "dead_eye",
  "aura_infested_impedance",
  "loot_detector",
  "aura_shield_disruption",
  "aura_speed_holster",
  "aura_sprint_boost",
  "aura_sprint_speed",
  "aura_looters",
  "aura_emp_auras",
  "aura_toxin_resistance",
  "stand_united",
  "growing_power",
  "brief_respite",
  "aerodynamic",
  "power_donation_r5",
  "combat_discipline",
  "shepherd",
]);

export function isAuraMod(mod: Mod): boolean {
  return AURA_MOD_IDS.has(mod.id);
}

/** Capacity cost at a given rank (R0 base drain from data, +1 per rank for normal mods). */
export function modCapacityAtRank(baseDrain: number, rank: number): number {
  if (baseDrain < 0) return baseDrain - rank;
  return baseDrain + rank;
}

/** Max rank capacity cost shown in codex / mod browser. */
export function modMaxCapacity(mod: Pick<Mod, "drain" | "maxRank">): number {
  return modCapacityAtRank(mod.drain, mod.maxRank);
}
