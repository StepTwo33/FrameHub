"use client";

import { useState, useEffect, useCallback } from "react";
import { allWeapons } from "@/data/weapons";
import { customWeapons } from "@/data/custom-items";
import { allMods, modsMap as baseModsMap } from "@/data/mods";
import { allCompanions } from "@/data/companions";
import { allWarframes } from "@/data/warframes";
import { allArcanes } from "@/data/arcanes";
import { allArchonShards } from "@/data/archon-shards";
import { archwings, necramechs } from "@/data/archwing";
import { ARCANE_EFFECTS, ArcaneEffectDef } from "@/data/arcane-effects";
import { Weapon, Mod, Companion, ArchonShard, Warframe } from "@/lib/types";
import { Archwing, Necramech } from "@/data/archwing";
import {
  applyWeaponOverrides,
  applyModOverrides,
  applyCompanionOverrides,
  applyArcaneOverrides,
  applyArchonShardOverrides,
  applyWarframeOverrides,
  applyArchwingOverrides,
  applyNecramechOverrides,
  getOverrides,
} from "@/lib/data-overrides";
import { applyArcaneEffectOverrides } from "@/lib/arcane-effect-overrides";
import { enrichWeapon } from "@/lib/weapon-enrich";

function useOverrideRefresh(reload: () => void) {
  useEffect(() => {
    window.addEventListener("framehub-data-overrides-updated", reload);
    return () => window.removeEventListener("framehub-data-overrides-updated", reload);
  }, [reload]);
}

const mergedWeapons: Weapon[] = (() => {
  const ids = new Set(allWeapons.map((w) => w.id));
  const extras = customWeapons.filter((w) => !ids.has(w.id));
  return [...allWeapons, ...extras].map(enrichWeapon);
})();

export function useWeapons(): Weapon[] {
  const [weapons, setWeapons] = useState<Weapon[]>(mergedWeapons);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    setWeapons(overrides.some((o) => o.targetType === "weapon") ? applyWeaponOverrides(mergedWeapons, overrides) : mergedWeapons);
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return weapons;
}

export function getEffectiveWeapons(): Weapon[] {
  const overrides = getOverrides();
  if (overrides.some((o) => o.targetType === "weapon")) {
    return applyWeaponOverrides(mergedWeapons, overrides);
  }
  return mergedWeapons;
}

export function useMods(): { mods: Mod[]; modsMap: Map<string, Mod> } {
  const [mods, setMods] = useState<Mod[]>(allMods);
  const [map, setMap] = useState<Map<string, Mod>>(baseModsMap);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    if (overrides.some((o) => o.targetType === "mod")) {
      const patched = applyModOverrides(allMods, overrides);
      setMods(patched);
      setMap(new Map(patched.map((m) => [m.id, m])));
    } else {
      setMods(allMods);
      setMap(baseModsMap);
    }
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return { mods, modsMap: map };
}

export function useCompanions(): Companion[] {
  const [companions, setCompanions] = useState<Companion[]>(allCompanions);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    setCompanions(
      overrides.some((o) => o.targetType === "companion")
        ? applyCompanionOverrides(allCompanions, overrides)
        : allCompanions,
    );
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return companions;
}

export function useArcanes(): Mod[] {
  const [arcanes, setArcanes] = useState<Mod[]>(allArcanes);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    setArcanes(
      overrides.some((o) => o.targetType === "arcane")
        ? applyArcaneOverrides(allArcanes, overrides)
        : allArcanes,
    );
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return arcanes;
}

export function useArchonShards(): ArchonShard[] {
  const [shards, setShards] = useState<ArchonShard[]>(allArchonShards);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    setShards(
      overrides.some((o) => o.targetType === "archon_shard")
        ? applyArchonShardOverrides(allArchonShards, overrides)
        : allArchonShards,
    );
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return shards;
}

export function useArcaneEffects(): Record<string, ArcaneEffectDef> {
  const [effects, setEffects] = useState<Record<string, ArcaneEffectDef>>(() =>
    applyArcaneEffectOverrides(),
  );
  const reload = useCallback(() => {
    setEffects(applyArcaneEffectOverrides());
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return effects;
}

export function useWarframes(): Warframe[] {
  const [warframes, setWarframes] = useState<Warframe[]>(allWarframes);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    setWarframes(
      overrides.some((o) => o.targetType === "warframe")
        ? applyWarframeOverrides(allWarframes, overrides)
        : allWarframes,
    );
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return warframes;
}

export function useArchwings(): Archwing[] {
  const [items, setItems] = useState<Archwing[]>(archwings);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    setItems(
      overrides.some((o) => o.targetType === "archwing")
        ? applyArchwingOverrides(archwings, overrides)
        : archwings,
    );
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return items;
}

export function useNecramechs(): Necramech[] {
  const [items, setItems] = useState<Necramech[]>(necramechs);
  const reload = useCallback(() => {
    const overrides = getOverrides();
    setItems(
      overrides.some((o) => o.targetType === "necramech")
        ? applyNecramechOverrides(necramechs, overrides)
        : necramechs,
    );
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return items;
}
