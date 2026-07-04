import { ARCANE_EFFECTS, ArcaneTrigger } from "@/data/arcane-effects";
import { applyCustomArcaneToWarframe, applyCustomArcaneToWeapon } from "@/lib/arcane-handlers";
import { Mod, CalculatedStats, WarframeCalculatedStats } from "@/lib/types";

export type ArcaneSlotCategory =
  | "warframe"
  | "primary"
  | "secondary"
  | "melee"
  | "kitgun"
  | "amp"
  | "zaw"
  | "tektolyst"
  | "other";

export interface ArcaneCoverageInfo {
  hasEffectDef: boolean;
  effectCount: number;
  trigger?: ArcaneTrigger;
  stackCap?: number | null;
  hasLegacyStats: boolean;
  legacyStatCount: number;
  customHandler: "weapon" | "warframe" | null;
  issues: string[];
}

const SLOT_LABELS: Record<ArcaneSlotCategory, string> = {
  warframe: "Warframe",
  primary: "Primary",
  secondary: "Secondary",
  melee: "Melee",
  kitgun: "Kitgun",
  amp: "Amp",
  zaw: "Zaw / Exodia",
  tektolyst: "Tektolyst",
  other: "Other",
};

export function getArcaneSlotCategory(arcane: Mod): ArcaneSlotCategory {
  const sub = arcane.subCategory;
  if (sub === "warframe" || (!sub && arcane.category === "arcane")) return "warframe";
  if (sub === "primary" || sub === "bow" || sub === "shotgun") return "primary";
  if (sub === "secondary") return "secondary";
  if (sub === "melee") return "melee";
  if (sub === "kitgun" || sub === "residual") return "kitgun";
  if (sub === "amp") return "amp";
  if (sub === "zaw") return "zaw";
  if (sub === "tektolyst") return "tektolyst";
  return "other";
}

export function getArcaneSlotLabel(arcane: Mod): string {
  return SLOT_LABELS[getArcaneSlotCategory(arcane)];
}

export function getArcaneWikiUrl(name: string): string {
  return `https://wiki.warframe.com/w/${encodeURIComponent(name.replace(/ /g, "_"))}`;
}

function detectCustomHandler(arcaneId: string): "weapon" | "warframe" | null {
  const def = ARCANE_EFFECTS[arcaneId];
  if (!def) return null;

  const ctx = { def, arcaneId, rank: def.maxRank, stacks: 1 };
  const weaponStats = { arcaneBonuses: {} } as CalculatedStats;
  if (applyCustomArcaneToWeapon(weaponStats, ctx)) return "weapon";

  const warframeStats = { arcaneBonuses: {} } as WarframeCalculatedStats;
  if (applyCustomArcaneToWarframe(warframeStats, ctx)) return "warframe";

  return null;
}

export function getArcaneCoverageInfo(arcane: Mod): ArcaneCoverageInfo {
  const def = ARCANE_EFFECTS[arcane.id];
  const legacyStatCount = Object.keys(arcane.stats).length;
  const issues: string[] = [];

  if (!def) {
    issues.push("Missing effect definition");
  } else {
    if (def.effects.length === 0) issues.push("Empty effects array");
    if (def.effects.length > 0 && def.effects.every((e) => e.stat === "utilityEffect")) {
      issues.push("utilityEffect placeholder only");
    }
    if (def.maxRank !== arcane.maxRank) {
      issues.push(`maxRank mismatch (effects ${def.maxRank} vs mod ${arcane.maxRank})`);
    }
  }

  if (legacyStatCount > 0 && def && def.effects.length > 0) {
    for (const [key, val] of Object.entries(arcane.stats)) {
      const line = def.effects.find((e) => e.stat === key);
      if (line && Math.abs(line.maxValue - val * (arcane.maxRank + 1)) > 0.05) {
        issues.push(`Legacy stat "${key}" differs from effect def`);
        break;
      }
    }
  }

  if (legacyStatCount === 0 && (!def || def.effects.length === 0)) {
    issues.push("No structured effect data");
  }

  return {
    hasEffectDef: !!def,
    effectCount: def?.effects.length ?? 0,
    trigger: def?.trigger,
    stackCap: def?.stackCap,
    hasLegacyStats: legacyStatCount > 0,
    legacyStatCount,
    customHandler: detectCustomHandler(arcane.id),
    issues,
  };
}

export const ARCANE_SLOT_FILTERS: { id: ArcaneSlotCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "warframe", label: "Warframe" },
  { id: "primary", label: "Primary" },
  { id: "secondary", label: "Secondary" },
  { id: "melee", label: "Melee" },
  { id: "kitgun", label: "Kitgun" },
  { id: "amp", label: "Amp" },
  { id: "zaw", label: "Zaw / Exodia" },
  { id: "tektolyst", label: "Tektolyst" },
];

export const ARCANE_TRIGGER_FILTERS: { id: ArcaneTrigger | "all"; label: string }[] = [
  { id: "all", label: "All triggers" },
  { id: "passive", label: "Passive" },
  { id: "stacks", label: "Stacks" },
  { id: "onKill", label: "On kill" },
  { id: "onHeadshot", label: "On headshot" },
  { id: "onDamaged", label: "When damaged" },
  { id: "onReload", label: "On reload" },
  { id: "onAbilityCast", label: "On ability cast" },
  { id: "onMeleeKill", label: "On melee kill" },
  { id: "onFinisher", label: "On finisher" },
  { id: "onStatus", label: "On status" },
  { id: "onPickup", label: "On pickup" },
  { id: "onVoidSling", label: "On Void Sling" },
  { id: "onMovement", label: "On movement" },
  { id: "onHit", label: "On hit" },
  { id: "onFreeze", label: "On freeze" },
  { id: "conditional", label: "Conditional" },
];
