// Build storage utilities - localStorage fallback + cloud API when logged in
import { ModSlot, EquippedArchonShard, Mod, ModularBuildData } from "./types";
import { modsMap } from "@/data/mods";
import { allArcanes } from "@/data/arcanes";

/** Arcanes are not in mods.ts; resolve from mods map first, then arcane list. */
export function resolveArcaneById(id: string): Mod | null {
  return modsMap.get(id) ?? allArcanes.find((a) => a.id === id) ?? null;
}

/** Restore equipped arcane row from saved `arcaneIds` (cloud / localStorage). */
export function resolveSavedArcaneSlots(arcaneIds: (string | null)[] | undefined, slotCount = 2): (Mod | null)[] {
  const ids = arcaneIds ?? [];
  const out: (Mod | null)[] = [];
  for (let i = 0; i < slotCount; i++) {
    const id = ids[i];
    out.push(id ? resolveArcaneById(id) : null);
  }
  return out;
}

export interface SavedBuild {
  id: string;
  name: string;
  description?: string;
  type: "weapon" | "warframe" | "companion" | "modular" | "archwing" | "railjack";
  createdAt: number;
  updatedAt: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const STORAGE_KEY = "framehub_builds";

// ── localStorage (offline / not logged in) ──────────────────────────

export function getSavedBuilds(type?: string): SavedBuild[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const builds = JSON.parse(raw) as SavedBuild[];
    if (type) return builds.filter((b) => b.type === type);
    return builds;
  } catch {
    return [];
  }
}

export function saveBuild(build: SavedBuild): void {
  const builds = getSavedBuilds();
  const index = builds.findIndex((b) => b.id === build.id);
  if (index >= 0) {
    builds[index] = { ...build, updatedAt: Date.now() };
  } else {
    builds.push({ ...build, createdAt: Date.now(), updatedAt: Date.now() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
}

export function deleteBuild(id: string): void {
  const builds = getSavedBuilds().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
}

export function generateBuildId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ── Cloud API (logged in) ───────────────────────────────────────────

export async function getCloudBuilds(type?: string): Promise<SavedBuild[]> {
  try {
    const url = type ? `/api/builds?type=${type}` : "/api/builds";
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function saveCloudBuild(build: SavedBuild): Promise<SavedBuild | null> {
  try {
    const res = await fetch("/api/builds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(build),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteCloudBuild(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/builds/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

// Weapon build data
export interface WeaponBuildData {
  weaponId: string;
  mods: ModSlot[];
  stanceModId?: string;
  arcaneIds: (string | null)[];
  hasOrokinCatalyst: boolean;
  isMR30: boolean;
  slotPolarities: Record<number, string>;
  /** Kuva/Tenet/Coda progenitor bonus (optional). */
  progenitorElement?: string;
  progenitorBonusPercent?: number;
}

// Warframe build data
export interface WarframeBuildData {
  warframeId: string;
  mods: ModSlot[];
  shards: (EquippedArchonShard | null)[];
  arcaneIds: (string | null)[];
  hasOrokinReactor: boolean;
  isMR30: boolean;
  slotPolarities: Record<number, string>;
  helminthSlot?: number | null;
  helminthAbilityId?: string | null;
  exaltedMods?: ModSlot[];
  exaltedSlotPolarities?: Record<number, string>;
}

// Companion build data
export interface CompanionBuildData {
  companionId: string;
  mods: ModSlot[];
  weaponMods: ModSlot[];
  arcaneIds: (string | null)[];
  hasReactor: boolean;
  isMR30: boolean;
  slotPolarities: Record<number, string>;
}

export type { ModularBuildData };

// Railjack build data
export interface RailjackBuildData {
  reactorId?: string;
  shieldId?: string;
  engineId?: string;
  platingId?: string;
  turretId?: string;
  ordnanceId?: string;
  integratedMods: ModSlot[];
  battleMods: ModSlot[];
  tacticalMods: ModSlot[];
  integratedPolarities: Record<number, string>;
  battlePolarities: Record<number, string>;
  tacticalPolarities: Record<number, string>;
}

// Archwing/Necramech build data
export interface ArchwingBuildData {
  mode: string; // 'archwing' | 'necramech'
  frameId?: string; // archwing or necramech id
  frameMods: ModSlot[];
  weaponId?: string;
  weaponMods: ModSlot[];
  hasReactor: boolean;
  hasCatalyst: boolean;
  isMR30: boolean;
  framePolarities: Record<number, string>;
  weaponPolarities: Record<number, string>;
}
