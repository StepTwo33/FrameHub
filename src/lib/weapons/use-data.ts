"use client";

import { useState, useEffect, useCallback } from "react";
import { ARCANE_EFFECTS, ArcaneEffectDef } from "@/data/arcane-effects";
import { Mod, ArchonShard } from "@/lib/types";
import { applyArcaneEffectOverrides } from "@/lib/overrides/arcane-effect-overrides";
import {
  getEffectiveWeapons,
  getEffectiveMods,
  getEffectiveModsMap,
  getEffectiveCompanions,
  getEffectiveArcanes,
  getEffectiveArchonShards,
  getEffectiveWarframes,
  getEffectiveArchwings,
  getEffectiveNecramechs,
} from "@/lib/weapons/effective-data";

export {
  getEffectiveWeapons,
  getEffectiveWeaponsMap,
  getEffectiveMods,
  getEffectiveModsMap,
  getEffectiveWarframes,
  getEffectiveWarframesMap,
  getEffectiveCompanions,
  getEffectiveCompanionsMap,
  getEffectiveArcanes,
  resolveEffectiveModOrArcane,
} from "@/lib/weapons/effective-data";

function useOverrideRefresh(reload: () => void) {
  useEffect(() => {
    window.addEventListener("framehub-data-overrides-updated", reload);
    return () => window.removeEventListener("framehub-data-overrides-updated", reload);
  }, [reload]);
}

export function useWeapons() {
  const [weapons, setWeapons] = useState(getEffectiveWeapons);
  const reload = useCallback(() => setWeapons(getEffectiveWeapons()), []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return weapons;
}

export function useMods(): { mods: Mod[]; modsMap: Map<string, Mod> } {
  const [mods, setMods] = useState(getEffectiveMods);
  const [map, setMap] = useState(getEffectiveModsMap);
  const reload = useCallback(() => {
    setMods(getEffectiveMods());
    setMap(getEffectiveModsMap());
  }, []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return { mods, modsMap: map };
}

export function useCompanions() {
  const [companions, setCompanions] = useState(getEffectiveCompanions);
  const reload = useCallback(() => setCompanions(getEffectiveCompanions()), []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return companions;
}

export function useArcanes(): Mod[] {
  const [arcanes, setArcanes] = useState(getEffectiveArcanes);
  const reload = useCallback(() => setArcanes(getEffectiveArcanes()), []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return arcanes;
}

export function useArchonShards(): ArchonShard[] {
  const [shards, setShards] = useState(getEffectiveArchonShards);
  const reload = useCallback(() => setShards(getEffectiveArchonShards()), []);
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

export function useWarframes() {
  const [warframes, setWarframes] = useState(getEffectiveWarframes);
  const reload = useCallback(() => setWarframes(getEffectiveWarframes()), []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return warframes;
}

export function useArchwings() {
  const [items, setItems] = useState(getEffectiveArchwings);
  const reload = useCallback(() => setItems(getEffectiveArchwings()), []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return items;
}

export function useNecramechs() {
  const [items, setItems] = useState(getEffectiveNecramechs);
  const reload = useCallback(() => setItems(getEffectiveNecramechs()), []);
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);
  useOverrideRefresh(reload);
  return items;
}
