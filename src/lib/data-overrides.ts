import { Weapon, Mod, Companion, Warframe, ArchonShard } from "@/lib/types";
import { Archwing, Necramech } from "@/data/archwing";
import { deepMergeOverrideFields } from "@/lib/override-merge";

export const OVERRIDE_CATEGORIES = [
  "weapon", "mod", "warframe", "companion", "arcane", "arcane_effect", "archon_shard", "archwing", "necramech",
] as const;
export type OverrideCategory = (typeof OVERRIDE_CATEGORIES)[number];

export interface DataOverride {
  id: string;
  targetType: OverrideCategory;
  targetId: string;
  action: "modify" | "add" | "remove";
  fields: Record<string, unknown>;
  note: string;
  timestamp: number;
}

const STORAGE_KEY = "framehub_data_overrides";

export function getOverrides(): DataOverride[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOverride(override: DataOverride): void {
  const overrides = getOverrides();
  const idx = overrides.findIndex((o) => o.id === override.id);
  if (idx >= 0) {
    overrides[idx] = override;
  } else {
    overrides.push(override);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.warn("Failed to save data overrides to localStorage", err);
  }
}

export function deleteOverride(id: string): void {
  const overrides = getOverrides().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function generateOverrideId(): string {
  return `ovr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function exportOverrides(): string {
  return JSON.stringify(getOverrides(), null, 2);
}

export function importOverrides(json: string): number {
  try {
    const incoming: DataOverride[] = JSON.parse(json);
    if (!Array.isArray(incoming)) return 0;
    const existing = getOverrides();
    const existingIds = new Set(existing.map((o) => o.id));
    const newOvr = incoming.filter((o) => o.id && !existingIds.has(o.id));
    const merged = [...existing, ...newOvr];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return newOvr.length;
  } catch {
    return 0;
  }
}

export function getOverrideForTarget(
  targetType: OverrideCategory,
  targetId: string,
): DataOverride | undefined {
  return getOverrides().find((o) => o.targetType === targetType && o.targetId === targetId);
}

function applyModify<T extends object>(item: T, fields: Record<string, unknown>): T {
  return deepMergeOverrideFields(item, fields);
}

function applyOverridesToList<T extends { id: string }>(
  items: T[],
  overrides: DataOverride[],
): T[] {
  if (overrides.length === 0) return items;

  let result = [...items];

  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((item) => item.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((item) => item.id === ovr.targetId);
      if (idx >= 0) {
        result[idx] = applyModify(result[idx], ovr.fields);
      }
    } else if (ovr.action === "add") {
      if (!result.find((item) => item.id === ovr.targetId)) {
        result.push({ id: ovr.targetId, ...ovr.fields } as T);
      }
    }
  }

  return result;
}

// Apply overrides to a weapon array
export function applyWeaponOverrides(weapons: Weapon[]): Weapon[] {
  return applyOverridesToList(weapons, getOverrides().filter((o) => o.targetType === "weapon"));
}

// Apply overrides to a mod array
export function applyModOverrides(mods: Mod[]): Mod[] {
  return applyOverridesToList(mods, getOverrides().filter((o) => o.targetType === "mod"));
}

// Apply overrides to a companion array
export function applyCompanionOverrides(companions: Companion[]): Companion[] {
  return applyOverridesToList(companions, getOverrides().filter((o) => o.targetType === "companion"));
}

// Apply overrides to a warframe array
export function applyWarframeOverrides(warframes: Warframe[]): Warframe[] {
  return applyOverridesToList(warframes, getOverrides().filter((o) => o.targetType === "warframe"));
}

// Apply overrides to an arcane array (uses Mod type)
export function applyArcaneOverrides(arcanes: Mod[]): Mod[] {
  return applyOverridesToList(arcanes, getOverrides().filter((o) => o.targetType === "arcane"));
}

// Apply overrides to archon shards
export function applyArchonShardOverrides(shards: ArchonShard[]): ArchonShard[] {
  return applyOverridesToList(shards, getOverrides().filter((o) => o.targetType === "archon_shard"));
}

// Apply overrides to archwings
export function applyArchwingOverrides(archwings: Archwing[]): Archwing[] {
  return applyOverridesToList(archwings, getOverrides().filter((o) => o.targetType === "archwing"));
}

// Apply overrides to necramechs
export function applyNecramechOverrides(mechs: Necramech[]): Necramech[] {
  return applyOverridesToList(mechs, getOverrides().filter((o) => o.targetType === "necramech"));
}

