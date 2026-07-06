import type { Mod } from "@/lib/types";

/** Warframe ability augments whose primary effect targets a companion. */
export const COMPANION_AFFECTING_WARFRAME_AUGMENT_IDS = new Set([
  "augment_khora_venari_bodyguard",
  "prismatic_companion",
  "repair_dispensary",
]);

/** In-game companions have four penjaga-polarity precept slots (top row). */
export const COMPANION_PRECEPT_SLOT_COUNT = 4;

export function isCompanionPreceptSlot(slotIndex: number): boolean {
  return slotIndex >= 0 && slotIndex < COMPANION_PRECEPT_SLOT_COUNT;
}

/** Penjaga-polarity companion precepts (companion ability mods). */
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
