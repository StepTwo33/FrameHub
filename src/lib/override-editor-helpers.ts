/**
 * Catalog lookup + scalar form helpers for the Data Fixes OverrideEditor shell.
 */

import {
  ARCANE_EFFECT_FIELD_KEYS,
  TEXTAREA_FIELDS,
  getSelectOptions,
} from "@/lib/override-schemas";
import {
  OverrideCategory,
  getOverrides,
  getOverrideForTarget,
  applyModOverrides,
  applyArcaneOverrides,
  applyWeaponOverrides,
  applyWarframeOverrides,
  applyCompanionOverrides,
  applyArchonShardOverrides,
  applyArchwingOverrides,
  applyNecramechOverrides,
} from "@/lib/data-overrides";
import { applyArcaneEffectOverrides } from "@/lib/arcane-effect-overrides";
import { getEffectiveWeapons } from "@/lib/effective-data";
import { enrichWeapon } from "@/lib/weapon-enrich";
import { allWeapons } from "@/data/weapons";
import { allMods } from "@/data/mods";
import { allWarframes } from "@/data/warframes";
import { allCompanions } from "@/data/companions";
import { allArcanes } from "@/data/arcanes";
import { allArchonShards } from "@/data/archon-shards";
import { ARCANE_EFFECTS } from "@/data/arcane-effects";
import { archwings, necramechs } from "@/data/archwing";

export function getAllItems(
  category: OverrideCategory,
): { id: string; name: string; hidden?: boolean }[] {
  let base: { id: string; name: string }[];
  switch (category) {
    case "weapon":
      base = allWeapons.map((w) => ({ id: w.id, name: w.name }));
      break;
    case "mod":
      base = allMods.map((m) => ({ id: m.id, name: m.name }));
      break;
    case "warframe":
      base = allWarframes.map((w) => ({ id: w.id, name: w.name }));
      break;
    case "companion":
      base = allCompanions.map((c) => ({ id: c.id, name: c.name }));
      break;
    case "arcane":
      base = allArcanes.map((a) => ({ id: a.id, name: a.name }));
      break;
    case "arcane_effect":
      base = Object.entries(ARCANE_EFFECTS).map(([id, def]) => ({ id, name: def.name }));
      break;
    case "archon_shard":
      base = allArchonShards.map((s) => ({ id: s.id, name: s.name }));
      break;
    case "archwing":
      base = archwings.map((a) => ({ id: a.id, name: a.name }));
      break;
    case "necramech":
      base = necramechs.map((n) => ({ id: n.id, name: n.name }));
      break;
    default:
      base = [];
  }
  const baseIds = new Set(base.map((i) => i.id));
  const hidden = getOverrides()
    .filter((o) => o.targetType === category && o.action === "remove" && !baseIds.has(o.targetId))
    .map((o) => ({ id: o.targetId, name: `${o.targetId} (hidden)`, hidden: true }));
  return [...base, ...hidden];
}

export function getItemData(
  category: OverrideCategory,
  id: string,
): Record<string, unknown> | null {
  switch (category) {
    case "weapon": {
      const base =
        applyWeaponOverrides(allWeapons).find((w) => w.id === id)
        ?? getEffectiveWeapons().find((w) => w.id === id);
      const weapon = base ? enrichWeapon(base) : null;
      return weapon ? (weapon as unknown as Record<string, unknown>) : null;
    }
    case "mod": {
      const mod = applyModOverrides(allMods).find((m) => m.id === id);
      return mod ? (mod as unknown as Record<string, unknown>) : null;
    }
    case "warframe": {
      const wf = applyWarframeOverrides(allWarframes).find((w) => w.id === id);
      return wf ? (wf as unknown as Record<string, unknown>) : null;
    }
    case "companion": {
      const c = applyCompanionOverrides(allCompanions).find((x) => x.id === id);
      return c ? (c as unknown as Record<string, unknown>) : null;
    }
    case "arcane": {
      const arcane = applyArcaneOverrides(allArcanes).find((a) => a.id === id);
      if (!arcane) return null;
      const effectDef = applyArcaneEffectOverrides()[id];
      return {
        ...(arcane as unknown as Record<string, unknown>),
        trigger: effectDef?.trigger ?? "passive",
        stackCap: effectDef?.stackCap,
        effects: effectDef?.effects ?? [],
      };
    }
    case "arcane_effect": {
      const def = applyArcaneEffectOverrides()[id];
      return def ? (def as unknown as Record<string, unknown>) : null;
    }
    case "archon_shard": {
      const shard = applyArchonShardOverrides(allArchonShards).find((s) => s.id === id);
      return shard ? (shard as unknown as Record<string, unknown>) : null;
    }
    case "archwing": {
      const aw = applyArchwingOverrides(archwings).find((a) => a.id === id);
      return aw ? (aw as unknown as Record<string, unknown>) : null;
    }
    case "necramech": {
      const nm = applyNecramechOverrides(necramechs).find((n) => n.id === id);
      return nm ? (nm as unknown as Record<string, unknown>) : null;
    }
    default:
      return null;
  }
}

export function getArcaneEffectDef(id: string) {
  return applyArcaneEffectOverrides()[id];
}

export function findExistingOverrideId(
  targetType: OverrideCategory,
  targetId: string,
): string | undefined {
  return getOverrideForTarget(targetType, targetId)?.id;
}

export function splitArcaneSaveFields(
  fields: Record<string, unknown>,
): { catalog: Record<string, unknown>; effectDef: Record<string, unknown> } {
  const catalog: Record<string, unknown> = {};
  const effectDef: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (ARCANE_EFFECT_FIELD_KEYS.has(key)) effectDef[key] = value;
    else catalog[key] = value;
  }
  if (catalog.maxRank !== undefined) {
    effectDef.maxRank = catalog.maxRank;
  }
  return { catalog, effectDef };
}

export function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return a === b;
  return String(a ?? "") === String(b ?? "");
}

export function getOriginalAtPath(
  itemData: Record<string, unknown> | null | undefined,
  path: string,
): unknown {
  if (!itemData) return undefined;
  let original: unknown = itemData;
  for (const part of path.split(".")) {
    original = (original as Record<string, unknown> | null)?.[part];
  }
  return original;
}

export function inferInputType(
  key: string,
  value: unknown,
  category: OverrideCategory,
): "number" | "boolean" | "text" | "textarea" | "select" {
  if (getSelectOptions(key, category)) return "select";
  if (TEXTAREA_FIELDS.has(key)) return "textarea";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "text";
}

export function parseScalarValue(raw: string, original: unknown): unknown {
  if (raw === "") return undefined;
  if (typeof original === "number" || /^-?\d+(\.\d+)?$/.test(raw.trim())) {
    const num = Number(raw);
    if (!Number.isNaN(num)) return num;
  }
  if (typeof original === "boolean" || raw === "true" || raw === "false") {
    return raw === "true";
  }
  return raw;
}
