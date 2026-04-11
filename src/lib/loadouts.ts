import { Loadout, ModularBuildData, ModSlot } from "./types";
import { inferModularLoadoutSlot } from "./modular-resolve";

const STORAGE_KEY = "overframe_loadouts";

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
}

export function deleteLoadout(id: string): void {
  const loadouts = getLoadouts().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
