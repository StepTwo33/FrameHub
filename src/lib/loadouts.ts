import { Loadout } from "./types";

const STORAGE_KEY = "overframe_loadouts";

export function getLoadouts(): Loadout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Loadout[];
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
}

export function deleteLoadout(id: string): void {
  const loadouts = getLoadouts().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
