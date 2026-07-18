/**
 * Override-aware catalog accessors for calculations and lib code.
 * Reads the in-memory override cache (synced from /api/data-overrides on load).
 */
import { allMods } from "@/data/mods";
import { allWeapons, weaponsMap as baseWeaponsMap } from "@/data/weapons";
import { allWarframes } from "@/data/warframes";
import { allCompanions } from "@/data/companions";
import { allArcanes } from "@/data/arcanes";
import { allArchonShards } from "@/data/archon-shards";
import { archwings, necramechs } from "@/data/archwing";
import { customWeapons } from "@/data/custom-items";
import {
  applyModOverrides,
  applyWeaponOverrides,
  applyWarframeOverrides,
  applyCompanionOverrides,
  applyArcaneOverrides,
  applyArchonShardOverrides,
  applyArchwingOverrides,
  applyNecramechOverrides,
  getOverrides,
} from "@/lib/overrides/data-overrides";
import { enrichWeapon } from "@/lib/weapon-enrich";
import type { Mod, Weapon, Warframe, Companion, ArchonShard } from "@/lib/types";
import type { Archwing, Necramech } from "@/data/archwing";

const mergedWeaponsBase: Weapon[] = (() => {
  const ids = new Set(allWeapons.map((w) => w.id));
  const extras = customWeapons.filter((w) => !ids.has(w.id));
  return [...allWeapons, ...extras].map(enrichWeapon);
})();

function toMap<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function getEffectiveWeapons(): Weapon[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "weapon")
    ? applyWeaponOverrides(mergedWeaponsBase, overrides)
    : mergedWeaponsBase;
}

export function getEffectiveWeaponsMap(): Map<string, Weapon> {
  return toMap(getEffectiveWeapons());
}

export function getEffectiveMods(): Mod[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "mod")
    ? applyModOverrides(allMods, overrides)
    : allMods;
}

export function getEffectiveModsMap(): Map<string, Mod> {
  return toMap(getEffectiveMods());
}

export function getEffectiveWarframes(): Warframe[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "warframe")
    ? applyWarframeOverrides(allWarframes, overrides)
    : allWarframes;
}

export function getEffectiveWarframesMap(): Map<string, Warframe> {
  return toMap(getEffectiveWarframes());
}

export function getEffectiveCompanions(): Companion[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "companion")
    ? applyCompanionOverrides(allCompanions, overrides)
    : allCompanions;
}

export function getEffectiveCompanionsMap(): Map<string, Companion> {
  return toMap(getEffectiveCompanions());
}

export function getEffectiveArcanes(): Mod[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "arcane")
    ? applyArcaneOverrides(allArcanes, overrides)
    : allArcanes;
}

export function getEffectiveArchonShards(): ArchonShard[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "archon_shard")
    ? applyArchonShardOverrides(allArchonShards, overrides)
    : allArchonShards;
}

export function getEffectiveArchwings(): Archwing[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "archwing")
    ? applyArchwingOverrides(archwings, overrides)
    : archwings;
}

export function getEffectiveNecramechs(): Necramech[] {
  const overrides = getOverrides();
  return overrides.some((o) => o.targetType === "necramech")
    ? applyNecramechOverrides(necramechs, overrides)
    : necramechs;
}

/** Resolve mod or arcane catalog entry with overrides applied. */
export function resolveEffectiveModOrArcane(id: string): Mod | null {
  return getEffectiveModsMap().get(id) ?? getEffectiveArcanes().find((a) => a.id === id) ?? null;
}

/** @deprecated Prefer getEffectiveWeaponsMap — static map without overrides. */
export { baseWeaponsMap as staticWeaponsMap };
