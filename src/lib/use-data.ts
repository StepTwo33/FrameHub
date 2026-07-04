"use client";

import { useState, useEffect } from "react";
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

// Merge base weapons + custom-items.ts (wiki-verified additions)
const mergedWeapons: Weapon[] = (() => {
  const ids = new Set(allWeapons.map((w) => w.id));
  const extras = customWeapons.filter((w) => !ids.has(w.id));
  return [...allWeapons, ...extras].map(enrichWeapon);
})();

export function useWeapons(): Weapon[] {
  const [weapons, setWeapons] = useState<Weapon[]>(mergedWeapons);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "weapon")) {
        setWeapons(applyWeaponOverrides(mergedWeapons));
      }
    });
  }, []);
  return weapons;
}

export function useMods(): { mods: Mod[]; modsMap: Map<string, Mod> } {
  const [mods, setMods] = useState<Mod[]>(allMods);
  const [map, setMap] = useState<Map<string, Mod>>(baseModsMap);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "mod")) {
        const patched = applyModOverrides(allMods);
        setMods(patched);
        setMap(new Map(patched.map((m) => [m.id, m])));
      }
    });
  }, []);
  return { mods, modsMap: map };
}

export function useCompanions(): Companion[] {
  const [companions, setCompanions] = useState<Companion[]>(allCompanions);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "companion")) {
        setCompanions(applyCompanionOverrides(allCompanions));
      }
    });
  }, []);
  return companions;
}

export function useArcanes(): Mod[] {
  const [arcanes, setArcanes] = useState<Mod[]>(allArcanes);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "arcane")) {
        setArcanes(applyArcaneOverrides(allArcanes));
      }
    });
  }, []);
  return arcanes;
}

export function useArchonShards(): ArchonShard[] {
  const [shards, setShards] = useState<ArchonShard[]>(allArchonShards);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "archon_shard")) {
        setShards(applyArchonShardOverrides(allArchonShards));
      }
    });
  }, []);
  return shards;
}

export function useArcaneEffects(): Record<string, ArcaneEffectDef> {
  const [effects, setEffects] = useState<Record<string, ArcaneEffectDef>>(ARCANE_EFFECTS);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "arcane_effect")) {
        setEffects(applyArcaneEffectOverrides());
      }
    });
  }, []);
  return effects;
}

export function useWarframes(): Warframe[] {
  const [warframes, setWarframes] = useState<Warframe[]>(allWarframes);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "warframe")) {
        setWarframes(applyWarframeOverrides(allWarframes));
      }
    });
  }, []);
  return warframes;
}

export function useArchwings(): Archwing[] {
  const [items, setItems] = useState<Archwing[]>(archwings);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "archwing")) {
        setItems(applyArchwingOverrides(archwings));
      }
    });
  }, []);
  return items;
}

export function useNecramechs(): Necramech[] {
  const [items, setItems] = useState<Necramech[]>(necramechs);
  useEffect(() => {
    queueMicrotask(() => {
      const overrides = getOverrides();
      if (overrides.some((o) => o.targetType === "necramech")) {
        setItems(applyNecramechOverrides(necramechs));
      }
    });
  }, []);
  return items;
}
