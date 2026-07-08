import { Loadout, ModularBuildData, ModSlot } from "./types";
import { inferModularLoadoutSlot } from "./modular-resolve";
import type { SavedBuild } from "./build-storage";

const STORAGE_KEY = "overframe_loadouts";

/** Slot payloads only — name/description/isPublic live on SavedBuild when cloud-synced. */
export type LoadoutBuildData = Omit<
  Loadout,
  "id" | "name" | "description" | "isPublic" | "cloudId" | "createdAt" | "updatedAt"
>;

export function loadoutToBuildData(loadout: Loadout): LoadoutBuildData {
  const {
    id: _id,
    name: _name,
    description: _description,
    isPublic: _isPublic,
    cloudId: _cloudId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...data
  } = loadout;
  return data;
}

export function loadoutFromSavedBuild(build: SavedBuild): Loadout {
  return {
    id: build.id,
    cloudId: build.id,
    name: build.name,
    description: build.description,
    isPublic: build.isPublic,
    createdAt: build.createdAt,
    updatedAt: build.updatedAt,
    ...(build.data as LoadoutBuildData),
  };
}

export function mergeCloudLoadout(local: Loadout, cloud: SavedBuild): Loadout {
  return {
    ...loadoutFromSavedBuild(cloud),
    id: local.id,
    cloudId: cloud.id,
  };
}

function normalizeLoadout(raw: Loadout): Loadout {
  const m = raw.modularBuild as Record<string, unknown> | undefined;
  if (!m) return raw;
  const modularType = (m.modularType ?? m.type) as string | undefined;
  if (!modularType || !m.parts) return raw;
  const partial: ModularBuildData = {
    modularType,
    parts: m.parts as Record<string, string>,
    mods: (m.mods as ModSlot[]) || [],
    hasOrokinCatalyst: Boolean(m.hasOrokinCatalyst),
    isMR30: m.isMR30 as boolean | undefined,
    slotPolarities: m.slotPolarities as Record<number, string> | undefined,
    arcaneIds: m.arcaneIds as (string | null)[] | undefined,
    customName: (m.customName ?? m.name) as string | undefined,
  };
  const slot =
    (m.slot as "primary" | "secondary" | "melee" | undefined) ?? inferModularLoadoutSlot(partial);
  const cleaned: ModularBuildData & { slot: "primary" | "secondary" | "melee" } = {
    ...partial,
    slot: slot as "primary" | "secondary" | "melee",
  };
  return { ...raw, modularBuild: cleaned };
}

export function getLoadouts(): Loadout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Loadout[];
    return parsed.map(normalizeLoadout);
  } catch {
    return [];
  }
}

export function saveLoadout(loadout: Loadout): void {
  const loadouts = getLoadouts();
  const index = loadouts.findIndex((l) => l.id === loadout.id);
  if (index >= 0) {
    loadouts[index] = { ...loadout, updatedAt: Date.now() };
  } else {
    loadouts.push({ ...loadout, createdAt: Date.now(), updatedAt: Date.now() });
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
  } catch (err) {
    console.warn("Failed to save loadouts to localStorage", err);
  }
}

export function deleteLoadout(id: string): void {
  const loadouts = getLoadouts().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
