import type { Mod } from "@/lib/types";

/** Warframe ability augments whose primary effect targets a companion. */
export const COMPANION_AFFECTING_WARFRAME_AUGMENT_IDS = new Set([
  "augment_khora_venari_bodyguard",
  "prismatic_companion",
  "repair_dispensary",
]);

/** All companions have ten mod slots (in-game: two rows of five). */
export const COMPANION_MOD_SLOT_COUNT = 10;

/** At most four penjaga precepts may be equipped at once (any slots). */
export const COMPANION_MAX_PRECEPTS = 4;

/** @deprecated Use COMPANION_MAX_PRECEPTS — not a fixed slot range. */
export const COMPANION_PRECEPT_SLOT_COUNT = COMPANION_MAX_PRECEPTS;

export function isCompanionPrecept(
  mod: Pick<Mod, "category" | "polarity">,
): boolean {
  return mod.category === "companion" && mod.polarity === "penjaga";
}

export function isCompanionAffectingWarframeAugment(
  mod: Pick<Mod, "id" | "category">,
): boolean {
  return mod.category === "augment" && COMPANION_AFFECTING_WARFRAME_AUGMENT_IDS.has(mod.id);
}

/** Companion precepts + warframe augments that modify companion behavior (codex). */
export function isCompanionAugment(
  mod: Pick<Mod, "id" | "category" | "polarity">,
): boolean {
  return isCompanionPrecept(mod) || isCompanionAffectingWarframeAugment(mod);
}
