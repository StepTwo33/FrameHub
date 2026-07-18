import type { Mod, EquippedMod } from "@/lib/types";
import { modCapacityAtRank, modSlotCapacityCost } from "@/lib/mod-capacity";

/** Sum of capacity cost for equipped mods given slot polarities. */
export function computeUsedCapacity(
  equippedMods: Pick<EquippedMod, "modId" | "rank" | "slotIndex">[],
  modsMap: Map<string, Pick<Mod, "drain" | "polarity">>,
  slotPolarities: Record<number, string | undefined>,
): number {
  return equippedMods.reduce((sum, m) => {
    const mod = modsMap.get(m.modId);
    if (!mod) return sum;
    const baseDrain = modCapacityAtRank(mod.drain, m.rank);
    return sum + modSlotCapacityCost(baseDrain, slotPolarities[m.slotIndex], mod.polarity);
  }, 0);
}
