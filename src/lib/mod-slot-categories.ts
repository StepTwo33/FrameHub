import { Mod } from "@/lib/types";

/** In-game special mod slot types (mutually exclusive). */
export type ModSlotCategory = "exilus" | "tome" | "historic";

/** Tektolyst Artifact / Antique mods (Operator ultimate weapon mods). */
export function isHistoricMod(mod: Pick<Mod, "id" | "category">): boolean {
  return mod.category === "tektolyst";
}

/** Tome weapon mods — Canticles and Invocations (separate from Exilus in the codex). */
export const TOME_MOD_IDS = new Set([
  "fass_canticle",
  "jahu_canticle",
  "khra_canticle",
  "lohk_canticle",
  "netra_invocation",
  "ris_invocation",
  "vome_invocation",
  "xata_invocation",
  "ruinous_extension",
]);

export function isTomeMod(mod: Pick<Mod, "id">): boolean {
  return TOME_MOD_IDS.has(mod.id);
}

/** Canticles only — eligible for the weapon Exilus slot on Tomes. */
export const TOME_CANTICLE_MOD_IDS = new Set([
  "fass_canticle",
  "jahu_canticle",
  "khra_canticle",
  "lohk_canticle",
  "ruinous_extension",
]);

/** Warframe Exilus slot mods (utility / drift / mobility). */
export const WARFRAME_EXILUS_MOD_IDS = new Set([
  "rush_r3",
  "maglev",
  "master_thief",
  "intruder",
  "enemy_sense_r3",
  "vigilante_pursuit",
  "animal_instinct",
  "aura_cunning_drift",
  "endurance_drift",
  "power_drift",
  "speed_drift",
  "coaction_drift",
  "lightning_dash",
  "firewalker",
  "ice_spring",
  "toxic_flight",
  "battering_maneuver",
  "handspring_r10",
  "sure_footed_r5",
  "aviator",
  "agility_drift",
  "mobilize_r3",
  "patagium",
  "proton_pulse",
  "streamlined_form",
  "preparation_r10",
  "heavy_impact",
  "shock_absorbers",
  "warm_coat",
]);

/** Secondary weapon Exilus slot (utility; excludes Tome mods). */
export const SECONDARY_WEAPON_EXILUS_MOD_IDS = new Set([
  "trick_mag_r3",
  "pistol_ammo_mutation",
  "primed_pistol_ammo_mutation",
  "vigilante_supplies",
  "air_recon",
  "hawk_eye",
  "spry_sights",
  "strafing_slide",
  "steady_hands",
  "primed_steady_hands",
  "targeting_subsystem",
  "suppress_r3",
  "reflex_draw",
  "eject_magazine",
  "lethal_momentum",
  "energizing_shot",
]);

/** Melee weapon Exilus slot (utility / block / glaive / Tennokai). */
export const MELEE_WEAPON_EXILUS_MOD_IDS = new Set([
  "dispatch_overdrive",
  "electromagnetic_shielding",
  "focused_defense",
  "guardian_derision",
  "whirlwind",
  "focus_energy_r3",
  "power_throw",
  "quick_return",
  "rebound",
  "volatile_quick_return",
  "volatile_rebound",
  "parry_r3",
  "conditions_perfection",
  "disciplines_merit",
  "dreamers_wrath",
  "masters_edge",
  "mentors_legacy",
  "opportunitys_reach",
]);

export function isWarframeExilusMod(mod: Pick<Mod, "id" | "category" | "polarity">): boolean {
  if (WARFRAME_EXILUS_MOD_IDS.has(mod.id)) return true;
  return mod.category === "augment" && mod.polarity === "exilus";
}

export function isSecondaryWeaponExilusMod(mod: Pick<Mod, "id">): boolean {
  return SECONDARY_WEAPON_EXILUS_MOD_IDS.has(mod.id);
}

export function isMeleeWeaponExilusMod(mod: Pick<Mod, "id">): boolean {
  return MELEE_WEAPON_EXILUS_MOD_IDS.has(mod.id);
}

/** Any Exilus-eligible mod (warframe or weapon), excluding Tome and Historic. */
export function isExilusMod(mod: Mod): boolean {
  if (isHistoricMod(mod) || isTomeMod(mod)) return false;
  return (
    isWarframeExilusMod(mod) ||
    isSecondaryWeaponExilusMod(mod) ||
    isMeleeWeaponExilusMod(mod)
  );
}

/**
 * Returns the single special-slot category for a mod, or null if it uses a regular slot.
 * Historic, Tome, and Exilus are mutually exclusive.
 */
export function getModSlotCategory(mod: Mod): ModSlotCategory | null {
  if (isHistoricMod(mod)) return "historic";
  if (isTomeMod(mod)) return "tome";
  if (isExilusMod(mod)) return "exilus";
  return null;
}

export function modSlotCategoryLabel(category: ModSlotCategory): string {
  switch (category) {
    case "exilus":
      return "Exilus";
    case "tome":
      return "Tome";
    case "historic":
      return "Historic";
  }
}
