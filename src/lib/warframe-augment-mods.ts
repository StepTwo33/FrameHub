import { modsMap } from "@/data/mods";
import { warframesMap } from "@/data/warframes";
import { isArchwingAugment } from "@/lib/archwing-augment-mods";
import { isWeaponExclusiveMod } from "@/lib/weapon-mod-tags";
import type { Mod } from "@/lib/types";

let warframeToAugments: Map<string, string[]> | null = null;

/** Strip variant suffix so loki_prime matches augments tagged for loki. */
export function normalizeWarframeId(warframeId: string): string {
  return warframeId.replace(/_prime$/i, "").replace(/_umbra$/i, "");
}

/** Ability augments for warframes (excludes weapon augments and weapon-exclusive mods). */
export function isWarframeAugment(
  mod: Pick<Mod, "category" | "subCategory" | "warframeId" | "id">,
): boolean {
  if (mod.category !== "augment") return false;
  if (isArchwingAugment(mod)) return false;
  if (mod.subCategory === "weapon") return false;
  if (isWeaponExclusiveMod(mod.id)) return false;
  return Boolean(mod.warframeId);
}

export function isWarframeSpecificAugment(
  mod: Pick<Mod, "category" | "subCategory" | "warframeId" | "id">,
): boolean {
  return isWarframeAugment(mod) && mod.warframeId !== "universal";
}

export function augmentMatchesWarframe(
  mod: Pick<Mod, "warframeId" | "category" | "subCategory" | "id">,
  selectedWarframeId: string,
): boolean {
  if (!isWarframeAugment(mod)) return false;
  const mid = mod.warframeId;
  if (!mid || mid === "universal") return mid === "universal";
  const candidates = new Set([
    selectedWarframeId,
    normalizeWarframeId(selectedWarframeId),
  ]);
  return candidates.has(mid) || candidates.has(normalizeWarframeId(mid));
}

/** Warframe augments only appear in the warframe builder for a matching frame (+ universal). */
export function warframeAugmentEligibleInBuilder(
  mod: Mod,
  builderCategory: string,
  selectedWarframeId?: string,
): boolean {
  if (!isWarframeAugment(mod)) return true;
  if (builderCategory !== "warframe") return false;
  if (mod.warframeId === "universal") return true;
  if (!selectedWarframeId) return false;
  return augmentMatchesWarframe(mod, selectedWarframeId);
}

function buildWarframeToAugmentsIndex(): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const mod of modsMap.values()) {
    if (!isWarframeSpecificAugment(mod)) continue;
    const base = normalizeWarframeId(mod.warframeId!);
    const list = index.get(base) ?? [];
    list.push(mod.id);
    index.set(base, list);
  }
  for (const list of index.values()) {
    list.sort((a, b) => {
      const nameA = modsMap.get(a)?.name ?? a;
      const nameB = modsMap.get(b)?.name ?? b;
      return nameA.localeCompare(nameB);
    });
  }
  return index;
}

function getWarframeToAugmentsIndex(): Map<string, string[]> {
  if (!warframeToAugments) warframeToAugments = buildWarframeToAugmentsIndex();
  return warframeToAugments;
}

/** Ability augments for this warframe (prime/umbra variants included). */
export function getAugmentModIdsForWarframe(warframeId: string): readonly string[] {
  return getWarframeToAugmentsIndex().get(normalizeWarframeId(warframeId)) ?? [];
}

export function getAugmentWarframeEntry(
  mod: Pick<Mod, "category" | "subCategory" | "warframeId" | "id">,
): { id: string; name: string } | null {
  if (!isWarframeSpecificAugment(mod) || !mod.warframeId) return null;
  const wf = warframesMap.get(mod.warframeId);
  return {
    id: mod.warframeId,
    name: wf?.name ?? mod.warframeId.replace(/_/g, " "),
  };
}
