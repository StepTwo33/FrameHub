"use client";

import { useState, useEffect } from "react";
import { allWeapons } from "@/data/weapons";
import { customWeapons } from "@/data/custom-items";
import { allMods, modsMap as baseModsMap } from "@/data/mods";
import { allCompanions } from "@/data/companions";
import { Weapon, Mod, Companion } from "@/lib/types";
import {
  applyWeaponOverrides,
  applyModOverrides,
  applyCompanionOverrides,
  getOverrides,
} from "@/lib/data-overrides";
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
