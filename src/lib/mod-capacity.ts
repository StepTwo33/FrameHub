/**
 * Capacity cost for one mod on a polarized slot (Warframe, weapon, companion, etc.).
 * Universal polarity halves drain for any mod, like a matching polarity.
 */
export function modSlotCapacityCost(
  baseDrain: number,
  slotPolarity: string | undefined | null,
  modPolarity: string,
): number {
  if (!slotPolarity) return baseDrain;
  if (slotPolarity === "universal") return Math.ceil(baseDrain / 2);
  if (modPolarity === slotPolarity) return Math.ceil(baseDrain / 2);
  return Math.ceil(baseDrain * 1.25);
}
