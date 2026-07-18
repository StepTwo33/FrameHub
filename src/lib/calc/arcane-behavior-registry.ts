import type { VerifiedArcaneBehavior, VerifiedArcaneEffectLine, ItemApplyTarget } from "@/lib/codex/item-behavior-types";
import { VERIFIED_ARCANE_BEHAVIORS } from "@/data/arcane-behaviors";

export function getVerifiedArcaneBehavior(arcaneId: string): VerifiedArcaneBehavior | undefined {
  return VERIFIED_ARCANE_BEHAVIORS[arcaneId];
}

export function getVerifiedArcaneEffectLine(
  arcaneId: string,
  statKey: string,
): VerifiedArcaneEffectLine | undefined {
  return getVerifiedArcaneBehavior(arcaneId)?.effects.find((e) => e.statKey === statKey);
}

/** Whether this arcane effect line may modify weapon/warframe build totals (per-arcane verified rule). */
export function shouldApplyArcaneLineToBuild(
  arcaneId: string,
  statKey: string,
  buildTarget: "weapon" | "warframe",
): boolean {
  const line = getVerifiedArcaneEffectLine(arcaneId, statKey);
  if (!line) return false;
  if (line.mode === "custom") return false;
  if (line.target === "pending" || line.target === "arcane_panel" || line.target === "mod_panel") {
    return false;
  }
  if (buildTarget === "weapon") return line.target === "weapon_dps";
  return line.target === "warframe_totals";
}

export function arcaneHasVerifiedBehavior(arcaneId: string): boolean {
  return arcaneId in VERIFIED_ARCANE_BEHAVIORS;
}

export function getArcaneEffectVerificationTarget(arcaneId: string, statKey: string): ItemApplyTarget {
  return getVerifiedArcaneEffectLine(arcaneId, statKey)?.target ?? "pending";
}

export function listArcaneIdsPendingVerification(): string[] {
  return Object.values(VERIFIED_ARCANE_BEHAVIORS)
    .filter((b) => b.effects.some((e) => e.target === "pending"))
    .map((b) => b.arcaneId);
}
