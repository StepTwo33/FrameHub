/**
 * Per-mod verified behaviors — category: evolution (3 mods).
 * Generated: python scripts/generate_mod_behavior_batch.py evolution
 * Each mod has its own entry; edit lines after individual wiki review.
 */
import type { VerifiedModBehavior, VerifiedItemStatLine } from "@/lib/item-behavior-types";

function line(statKey: string, target: VerifiedItemStatLine['target'], mode: VerifiedItemStatLine['mode'], source: string): VerifiedItemStatLine {
  return { statKey, target, mode, source };
}

function mod(modId: string, stats: VerifiedItemStatLine[], descriptionOnly?: string): VerifiedModBehavior {
  return descriptionOnly ? { modId, stats, descriptionOnly } : { modId, stats };
}

export const MOD_BEHAVIORS_EVOLUTION: Record<string, VerifiedModBehavior> = {
  evolution_incarnon_melee: mod("evolution_incarnon_melee", [
    line("evolutionBonus", "mod_panel", "multiplicative_percent", "Incarnon Melee Evolution: evolutionBonus \u2014 Incarnon weapon evolution bonuses"),
  ]),
  evolution_incarnon_pistol: mod("evolution_incarnon_pistol", [
    line("evolutionBonus", "mod_panel", "multiplicative_percent", "Incarnon Pistol Evolution: evolutionBonus \u2014 Incarnon weapon evolution bonuses"),
  ]),
  evolution_incarnon_rifle: mod("evolution_incarnon_rifle", [
    line("evolutionBonus", "mod_panel", "multiplicative_percent", "Incarnon Rifle Evolution: evolutionBonus \u2014 Incarnon weapon evolution bonuses"),
  ]),
};
