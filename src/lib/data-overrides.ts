import { Weapon, Mod, Companion, Warframe, ArchonShard } from "@/lib/types";
import { Archwing, Necramech } from "@/data/archwing";

export const OVERRIDE_CATEGORIES = [
  "weapon", "mod", "warframe", "companion", "arcane", "archon_shard", "archwing", "necramech",
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

// Apply overrides to a weapon array
export function applyWeaponOverrides(weapons: Weapon[]): Weapon[] {
  const overrides = getOverrides().filter((o) => o.targetType === "weapon");
  if (overrides.length === 0) return weapons;

  let result = [...weapons];

  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((w) => w.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((w) => w.id === ovr.targetId);
      if (idx >= 0) {
        result[idx] = { ...result[idx], ...ovr.fields } as Weapon;
      }
    } else if (ovr.action === "add") {
      if (!result.find((w) => w.id === ovr.targetId)) {
        result.push(ovr.fields as unknown as Weapon);
      }
    }
  }

  return result;
}

// Apply overrides to a mod array
export function applyModOverrides(mods: Mod[]): Mod[] {
  const overrides = getOverrides().filter((o) => o.targetType === "mod");
  if (overrides.length === 0) return mods;

  let result = [...mods];

  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((m) => m.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((m) => m.id === ovr.targetId);
      if (idx >= 0) {
        result[idx] = { ...result[idx], ...ovr.fields } as Mod;
      }
    } else if (ovr.action === "add") {
      if (!result.find((m) => m.id === ovr.targetId)) {
        result.push(ovr.fields as unknown as Mod);
      }
    }
  }

  return result;
}

// Apply overrides to a companion array
export function applyCompanionOverrides(companions: Companion[]): Companion[] {
  const overrides = getOverrides().filter((o) => o.targetType === "companion");
  if (overrides.length === 0) return companions;

  let result = [...companions];

  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((c) => c.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((c) => c.id === ovr.targetId);
      if (idx >= 0) {
        result[idx] = { ...result[idx], ...ovr.fields } as Companion;
      }
    } else if (ovr.action === "add") {
      if (!result.find((c) => c.id === ovr.targetId)) {
        result.push(ovr.fields as unknown as Companion);
      }
    }
  }

  return result;
}

// Apply overrides to a warframe array
export function applyWarframeOverrides(warframes: Warframe[]): Warframe[] {
  const overrides = getOverrides().filter((o) => o.targetType === "warframe");
  if (overrides.length === 0) return warframes;
  let result = [...warframes];
  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((w) => w.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((w) => w.id === ovr.targetId);
      if (idx >= 0) result[idx] = { ...result[idx], ...ovr.fields } as Warframe;
    } else if (ovr.action === "add") {
      if (!result.find((w) => w.id === ovr.targetId)) result.push(ovr.fields as unknown as Warframe);
    }
  }
  return result;
}

// Apply overrides to an arcane array (uses Mod type)
export function applyArcaneOverrides(arcanes: Mod[]): Mod[] {
  const overrides = getOverrides().filter((o) => o.targetType === "arcane");
  if (overrides.length === 0) return arcanes;
  let result = [...arcanes];
  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((a) => a.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((a) => a.id === ovr.targetId);
      if (idx >= 0) result[idx] = { ...result[idx], ...ovr.fields } as Mod;
    } else if (ovr.action === "add") {
      if (!result.find((a) => a.id === ovr.targetId)) result.push(ovr.fields as unknown as Mod);
    }
  }
  return result;
}

// Apply overrides to archon shards
export function applyArchonShardOverrides(shards: ArchonShard[]): ArchonShard[] {
  const overrides = getOverrides().filter((o) => o.targetType === "archon_shard");
  if (overrides.length === 0) return shards;
  let result = [...shards];
  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((s) => s.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((s) => s.id === ovr.targetId);
      if (idx >= 0) result[idx] = { ...result[idx], ...ovr.fields } as ArchonShard;
    } else if (ovr.action === "add") {
      if (!result.find((s) => s.id === ovr.targetId)) result.push(ovr.fields as unknown as ArchonShard);
    }
  }
  return result;
}

// Apply overrides to archwings
export function applyArchwingOverrides(archwings: Archwing[]): Archwing[] {
  const overrides = getOverrides().filter((o) => o.targetType === "archwing");
  if (overrides.length === 0) return archwings;
  let result = [...archwings];
  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((a) => a.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((a) => a.id === ovr.targetId);
      if (idx >= 0) result[idx] = { ...result[idx], ...ovr.fields } as Archwing;
    } else if (ovr.action === "add") {
      if (!result.find((a) => a.id === ovr.targetId)) result.push(ovr.fields as unknown as Archwing);
    }
  }
  return result;
}

// Apply overrides to necramechs
export function applyNecramechOverrides(mechs: Necramech[]): Necramech[] {
  const overrides = getOverrides().filter((o) => o.targetType === "necramech");
  if (overrides.length === 0) return mechs;
  let result = [...mechs];
  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      result = result.filter((n) => n.id !== ovr.targetId);
    } else if (ovr.action === "modify") {
      const idx = result.findIndex((n) => n.id === ovr.targetId);
      if (idx >= 0) result[idx] = { ...result[idx], ...ovr.fields } as Necramech;
    } else if (ovr.action === "add") {
      if (!result.find((n) => n.id === ovr.targetId)) result.push(ovr.fields as unknown as Necramech);
    }
  }
  return result;
}

