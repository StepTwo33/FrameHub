"use client";

import { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/header";
import { ModSlotCard } from "@/components/mod-slot";
import { ModPicker } from "@/components/mod-picker";
import { allMods, modsMap } from "@/data/mods";
import {
  reactors, shieldArrays, engines, plating,
  turrets, ordnance,
  railjackBaseStats, isRailjackMod,
  RailjackComponent, RailjackArmament,
} from "@/data/railjack";
import { Mod, EquippedMod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Save, FolderOpen, Trash2, Crosshair, Shield, Zap, Gauge, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSavedBuilds, saveBuild, deleteBuild, generateBuildId, SavedBuild, RailjackBuildData, saveCloudBuild } from "@/lib/build-storage";
import { toast } from "sonner";
import { modSlotCapacityCost } from "@/lib/mod-capacity";

type PlexusTab = "integrated" | "battle" | "tactical";

const INTEGRATED_SLOTS = 9;
const BATTLE_SLOTS = 3;
const TACTICAL_SLOTS = 3;

export default function RailjackBuilderPage() {
  // Component state
  const [selectedReactor, setSelectedReactor] = useState<RailjackComponent | null>(null);
  const [selectedShield, setSelectedShield] = useState<RailjackComponent | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<RailjackComponent | null>(null);
  const [selectedPlating, setSelectedPlating] = useState<RailjackComponent | null>(null);

  // Armament state
  const [selectedTurret, setSelectedTurret] = useState<RailjackArmament | null>(null);
  const [selectedOrdnance, setSelectedOrdnance] = useState<RailjackArmament | null>(null);

  // Plexus mod state
  const [plexusTab, setPlexusTab] = useState<PlexusTab>("integrated");
  const [integratedMods, setIntegratedMods] = useState<EquippedMod[]>([]);
  const [battleMods, setBattleMods] = useState<EquippedMod[]>([]);
  const [tacticalMods, setTacticalMods] = useState<EquippedMod[]>([]);
  const [modPickerOpen, setModPickerOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // Polarities
  const [integratedPolarities, setIntegratedPolarities] = useState<Record<number, string>>({});
  const [battlePolarities, setBattlePolarities] = useState<Record<number, string>>({});
  const [tacticalPolarities, setTacticalPolarities] = useState<Record<number, string>>({});

  // Save state
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("");

  // Component pickers
  const [showComponentPicker, setShowComponentPicker] = useState<string | null>(null);

  useState(() => { setSavedBuilds(getSavedBuilds("railjack")); });

  // Current mods/polarities based on active tab
  const currentMods = plexusTab === "integrated" ? integratedMods : plexusTab === "battle" ? battleMods : tacticalMods;
  const setCurrentMods = plexusTab === "integrated" ? setIntegratedMods : plexusTab === "battle" ? setBattleMods : setTacticalMods;
  const currentPolarities = plexusTab === "integrated" ? integratedPolarities : plexusTab === "battle" ? battlePolarities : tacticalPolarities;
  const setCurrentPolarities = plexusTab === "integrated" ? setIntegratedPolarities : plexusTab === "battle" ? setBattlePolarities : setTacticalPolarities;
  const currentSlotCount = plexusTab === "integrated" ? INTEGRATED_SLOTS : plexusTab === "battle" ? BATTLE_SLOTS : TACTICAL_SLOTS;

  // Railjack mods from the "general" category
  const railjackMods = useMemo(() => {
    return allMods.filter((m) => m.category === "general" && isRailjackMod(m.description));
  }, []);

  // Capacity
  const capacityUsed = useMemo(() => {
    return currentMods.reduce((sum, m) => {
      const mod = modsMap.get(m.modId);
      if (!mod) return sum;
      const baseDrain = mod.drain + m.rank;
      const slotPol = currentPolarities[m.slotIndex];
      return sum + modSlotCapacityCost(baseDrain, slotPol, mod.polarity);
    }, 0);
  }, [currentMods, currentPolarities]);

  const maxCapacity = plexusTab === "integrated" ? 60 : 15;

  // Computed ship stats including Plexus mod bonuses
  const computedStats = useMemo(() => {
    const base = { ...railjackBaseStats };
    if (selectedPlating) {
      base.hull += selectedPlating.stats.hullBonus ?? 0;
      base.armor += selectedPlating.stats.armorBonus ?? 0;
    }
    if (selectedShield) {
      base.shield += selectedShield.stats.shieldCapacity ?? 0;
    }
    if (selectedEngine) {
      base.speed += selectedEngine.stats.speed ?? 0;
      base.boostSpeed += selectedEngine.stats.boostSpeed ?? 0;
    }
    if (selectedReactor) {
      base.fluxCapacity += selectedReactor.stats.fluxCapacity ?? 0;
    }

    // Apply integrated Plexus mod bonuses
    let speedBonus = 0;
    let boostBonus = 0;
    let turretDmgBonus = 0;
    let turretCritBonus = 0;
    let turretCritDmgBonus = 0;
    let ordnanceDmgBonus = 0;
    let artilleryDmgBonus = 0;

    for (const em of integratedMods) {
      const mod = modsMap.get(em.modId);
      if (!mod) continue;
      const rank = Math.min(em.rank, mod.maxRank);
      const mult = rank + 1;
      for (const [stat, val] of Object.entries(mod.stats)) {
        const scaled = (val * mult) / 100;
        switch (stat) {
          case "engineSpeed": speedBonus += scaled; break;
          case "boostSpeed": boostBonus += scaled; break;
          case "turretDamage": turretDmgBonus += scaled; break;
          case "turretCritChance": turretCritBonus += scaled; break;
          case "turretCritDamage": turretCritDmgBonus += scaled; break;
          case "ordnanceDamage": ordnanceDmgBonus += scaled; break;
          case "artilleryDamage": artilleryDmgBonus += scaled; break;
        }
      }
    }

    base.speed = Math.round(base.speed * (1 + speedBonus));
    base.boostSpeed = Math.round(base.boostSpeed * (1 + boostBonus));

    return {
      ...base,
      turretDamageBonus: turretDmgBonus,
      turretCritBonus,
      turretCritDmgBonus,
      ordnanceDamageBonus: ordnanceDmgBonus,
      artilleryDamageBonus: artilleryDmgBonus,
    };
  }, [selectedPlating, selectedShield, selectedEngine, selectedReactor, integratedMods]);

  // Save
  const handleSaveBuild = useCallback(async () => {
    const data: RailjackBuildData = {
      reactorId: selectedReactor?.id,
      shieldId: selectedShield?.id,
      engineId: selectedEngine?.id,
      platingId: selectedPlating?.id,
      turretId: selectedTurret?.id,
      ordnanceId: selectedOrdnance?.id,
      integratedMods: integratedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      battleMods: battleMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      tacticalMods: tacticalMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      integratedPolarities,
      battlePolarities,
      tacticalPolarities,
    };
    const build: SavedBuild = {
      id: currentBuildId || generateBuildId(),
      name: buildName || "Railjack Build",
      type: "railjack",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data,
    };
    saveBuild(build);
    setCurrentBuildId(build.id);
    setSavedBuilds(getSavedBuilds("railjack"));

    const cloudResult = await saveCloudBuild(build);
    if (cloudResult) {
      toast.success("Build saved", { description: `${build.name} saved to your account` });
    } else {
      toast.success("Build saved locally", { description: "Log in to sync builds to your account" });
    }
  }, [selectedReactor, selectedShield, selectedEngine, selectedPlating, selectedTurret, selectedOrdnance, integratedMods, battleMods, tacticalMods, integratedPolarities, battlePolarities, tacticalPolarities, buildName, currentBuildId]);

  const handleLoadBuild = useCallback((build: SavedBuild) => {
    const d = build.data as RailjackBuildData;
    const restoreMods = (slots: { modId: string; rank: number; slotIndex: number }[]) =>
      slots.map((m) => { const mod = modsMap.get(m.modId); return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain }; });

    setSelectedReactor(reactors.find((r) => r.id === d.reactorId) ?? null);
    setSelectedShield(shieldArrays.find((s) => s.id === d.shieldId) ?? null);
    setSelectedEngine(engines.find((e) => e.id === d.engineId) ?? null);
    setSelectedPlating(plating.find((p) => p.id === d.platingId) ?? null);
    setSelectedTurret(turrets.find((t) => t.id === d.turretId) ?? null);
    setSelectedOrdnance(ordnance.find((o) => o.id === d.ordnanceId) ?? null);
    setIntegratedMods(restoreMods(d.integratedMods));
    setBattleMods(restoreMods(d.battleMods));
    setTacticalMods(restoreMods(d.tacticalMods));
    setIntegratedPolarities(d.integratedPolarities || {});
    setBattlePolarities(d.battlePolarities || {});
    setTacticalPolarities(d.tacticalPolarities || {});
    setCurrentBuildId(build.id);
    setBuildName(build.name);
    setShowSavedBuilds(false);
    toast.info("Build loaded", { description: build.name });
  }, []);

  const handleDeleteBuild = useCallback((id: string) => {
    deleteBuild(id);
    setSavedBuilds(getSavedBuilds("railjack"));
    if (currentBuildId === id) setCurrentBuildId(null);
    toast.success("Build deleted");
  }, [currentBuildId]);

  /** Picking different parts after a loaded save should not upsert the same cloud row with a stale name. */
  const beginNewRailjackDraft = useCallback(() => {
    setCurrentBuildId(null);
    setBuildName("");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Title bar */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h1 className="text-xl sm:text-3xl font-bold">Railjack Builder</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              placeholder="Build name..."
              className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground w-40"
            />
            <button onClick={handleSaveBuild} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-green-400 hover:border-green-500/50 transition-all" title="Save Build">
              <Save className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Save</span>
            </button>
            <button onClick={() => { setSavedBuilds(getSavedBuilds("railjack")); setShowSavedBuilds(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 transition-all" title="Load Build">
              <FolderOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Load</span>
            </button>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">Configure your Railjack components, armaments, and Plexus mods</p>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Left Column: Ship Components & Stats ── */}
          <div className="space-y-6">
            {/* Ship Stats Overview */}
            <div className="border border-border rounded-xl p-4 bg-card">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground mb-3">RAILJACK STATS</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Hull</span><span className="font-mono">{computedStats.hull}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Armor</span><span className="font-mono">{computedStats.armor}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shield</span><span className="font-mono">{computedStats.shield}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Speed</span><span className="font-mono">{computedStats.speed}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Boost Speed</span><span className="font-mono">{computedStats.boostSpeed}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Flux Capacity</span><span className="font-mono">{computedStats.fluxCapacity}</span></div>
              </div>
              {(computedStats.turretDamageBonus > 0 || computedStats.turretCritBonus > 0 || computedStats.turretCritDmgBonus > 0 || computedStats.ordnanceDamageBonus > 0 || computedStats.artilleryDamageBonus > 0) && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-1.5">PLEXUS BONUSES</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    {computedStats.turretDamageBonus > 0 && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Turret Damage</span><span className="font-mono text-cyan-400">+{(computedStats.turretDamageBonus * 100).toFixed(0)}%</span></div>
                    )}
                    {computedStats.turretCritBonus > 0 && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Turret Crit</span><span className="font-mono text-cyan-400">+{(computedStats.turretCritBonus * 100).toFixed(0)}%</span></div>
                    )}
                    {computedStats.turretCritDmgBonus > 0 && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Turret Crit DMG</span><span className="font-mono text-cyan-400">+{(computedStats.turretCritDmgBonus * 100).toFixed(0)}%</span></div>
                    )}
                    {computedStats.ordnanceDamageBonus > 0 && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Ordnance Damage</span><span className="font-mono text-cyan-400">+{(computedStats.ordnanceDamageBonus * 100).toFixed(0)}%</span></div>
                    )}
                    {computedStats.artilleryDamageBonus > 0 && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Artillery Damage</span><span className="font-mono text-cyan-400">+{(computedStats.artilleryDamageBonus * 100).toFixed(0)}%</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Component Selectors */}
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground mb-3">COMPONENTS</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Reactor */}
                <button
                  onClick={() => setShowComponentPicker(showComponentPicker === "reactor" ? null : "reactor")}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedReactor ? "border-orange-500/50 bg-orange-500/5" : "border-border hover:border-orange-500/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">REACTOR</span>
                  </div>
                  <span className="text-sm font-medium">{selectedReactor?.name ?? "None"}</span>
                  {selectedReactor && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Flux +{selectedReactor.stats.fluxCapacity} • Avionics +{selectedReactor.stats.avionicsCapacity}
                    </div>
                  )}
                </button>

                {/* Shield Array */}
                <button
                  onClick={() => setShowComponentPicker(showComponentPicker === "shield" ? null : "shield")}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedShield ? "border-cyan-500/50 bg-cyan-500/5" : "border-border hover:border-cyan-500/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">SHIELD ARRAY</span>
                  </div>
                  <span className="text-sm font-medium">{selectedShield?.name ?? "None"}</span>
                  {selectedShield && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Cap +{selectedShield.stats.shieldCapacity} • Recharge +{selectedShield.stats.shieldRecharge}/s
                    </div>
                  )}
                </button>

                {/* Engines */}
                <button
                  onClick={() => setShowComponentPicker(showComponentPicker === "engine" ? null : "engine")}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedEngine ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-green-500/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">ENGINES</span>
                  </div>
                  <span className="text-sm font-medium">{selectedEngine?.name ?? "None"}</span>
                  {selectedEngine && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Speed +{selectedEngine.stats.speed} • Boost +{selectedEngine.stats.boostSpeed}
                    </div>
                  )}
                </button>

                {/* Plating */}
                <button
                  onClick={() => setShowComponentPicker(showComponentPicker === "plating" ? null : "plating")}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    selectedPlating ? "border-amber-500/50 bg-amber-500/5" : "border-border hover:border-amber-500/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">PLATING</span>
                  </div>
                  <span className="text-sm font-medium">{selectedPlating?.name ?? "None"}</span>
                  {selectedPlating && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Hull +{selectedPlating.stats.hullBonus} • Armor +{selectedPlating.stats.armorBonus}
                    </div>
                  )}
                </button>
              </div>

              {/* Component picker dropdown */}
              {showComponentPicker && (
                <div className="mt-3 border border-border rounded-xl p-3 bg-card max-h-[250px] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1.5">
                    {(showComponentPicker === "reactor" ? reactors :
                      showComponentPicker === "shield" ? shieldArrays :
                      showComponentPicker === "engine" ? engines : plating
                    ).map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          beginNewRailjackDraft();
                          if (showComponentPicker === "reactor") setSelectedReactor(comp);
                          else if (showComponentPicker === "shield") setSelectedShield(comp);
                          else if (showComponentPicker === "engine") setSelectedEngine(comp);
                          else setSelectedPlating(comp);
                          setShowComponentPicker(null);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-primary/40 transition-all text-left"
                      >
                        <div>
                          <span className="text-sm font-medium">{comp.name}</span>
                          <div className="text-[10px] text-muted-foreground">{comp.description}</div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Armaments */}
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground mb-3">ARMAMENTS</h2>
              <div className="space-y-3">
                {/* Turret */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crosshair className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">TURRETS</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
                    {turrets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { beginNewRailjackDraft(); setSelectedTurret(t); }}
                        className={cn(
                          "p-2 rounded-lg border text-left transition-all text-xs",
                          selectedTurret?.id === t.id
                            ? "border-red-500/50 bg-red-500/10 text-red-400"
                            : "border-border hover:border-red-500/30"
                        )}
                      >
                        <span className="font-medium">{t.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG {t.damage} • CC {(t.critChance * 100).toFixed(0)}% • SC {(t.statusChance * 100).toFixed(0)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ordnance */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crosshair className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">ORDNANCE</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
                    {ordnance.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => { beginNewRailjackDraft(); setSelectedOrdnance(o); }}
                        className={cn(
                          "p-2 rounded-lg border text-left transition-all text-xs",
                          selectedOrdnance?.id === o.id
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                            : "border-border hover:border-purple-500/30"
                        )}
                      >
                        <span className="font-medium">{o.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG {o.damage} • CC {(o.critChance * 100).toFixed(0)}% • FR {o.fireRate}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Plexus Mods ── */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground mb-3">PLEXUS MODS</h2>

              {/* Tab selector */}
              <div className="flex gap-2 mb-4">
                {(["integrated", "battle", "tactical"] as PlexusTab[]).map((tab) => {
                  const count = tab === "integrated" ? integratedMods.length : tab === "battle" ? battleMods.length : tacticalMods.length;
                  const max = tab === "integrated" ? INTEGRATED_SLOTS : tab === "battle" ? BATTLE_SLOTS : TACTICAL_SLOTS;
                  return (
                    <button
                      key={tab}
                      onClick={() => setPlexusTab(tab)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                        plexusTab === tab
                          ? "bg-rose-500/10 border-rose-500/50 text-rose-400"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                      <span className="ml-1.5 text-[10px] opacity-70">{count}/{max}</span>
                    </button>
                  );
                })}
              </div>

              {/* Capacity bar */}
              <div className="flex items-center justify-end gap-2 mb-3">
                <span className={cn(
                  "text-xs font-mono",
                  capacityUsed > maxCapacity ? "text-red-400" : "text-muted-foreground"
                )}>
                  {capacityUsed} / {maxCapacity}
                </span>
              </div>

              {/* Mod slots */}
              <div className={cn(
                "grid gap-2",
                plexusTab === "integrated" ? "grid-cols-3 sm:grid-cols-3" : "grid-cols-3"
              )}>
                {Array.from({ length: currentSlotCount }, (_, i) => {
                  const equipped = currentMods.find((m) => m.slotIndex === i);
                  const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                  return (
                    <ModSlotCard
                      key={`${plexusTab}-${i}`}
                      mod={mod}
                      rank={equipped?.rank ?? 0}
                      slotIndex={i}
                      slotPolarity={currentPolarities[i]}
                      onAdd={() => { setActiveSlotIndex(i); setModPickerOpen(true); }}
                      onRemove={() => setCurrentMods((prev) => prev.filter((m) => m.slotIndex !== i))}
                      onPolarize={(p) => setCurrentPolarities((prev) => {
                        const next = { ...prev };
                        if (p) next[i] = p; else delete next[i];
                        return next;
                      })}
                    />
                  );
                })}
              </div>
            </div>

            {/* Armament Stats */}
            {(selectedTurret || selectedOrdnance) && (
              <div className="border border-border rounded-xl p-4 bg-card">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3">ARMAMENT STATS</h3>
                {selectedTurret && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-red-400 mb-1.5">Turret — {selectedTurret.name}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Damage</span><span className="font-mono">{selectedTurret.damage}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Crit Chance</span><span className="font-mono">{(selectedTurret.critChance * 100).toFixed(1)}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Crit Multi</span><span className="font-mono">{selectedTurret.critMultiplier.toFixed(1)}x</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-mono">{(selectedTurret.statusChance * 100).toFixed(1)}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Fire Rate</span><span className="font-mono">{selectedTurret.fireRate}</span></div>
                    </div>
                  </div>
                )}
                {selectedOrdnance && (
                  <div>
                    <div className="text-xs font-medium text-purple-400 mb-1.5">Ordnance — {selectedOrdnance.name}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Damage</span><span className="font-mono">{selectedOrdnance.damage}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Crit Chance</span><span className="font-mono">{(selectedOrdnance.critChance * 100).toFixed(1)}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Crit Multi</span><span className="font-mono">{selectedOrdnance.critMultiplier.toFixed(1)}x</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-mono">{(selectedOrdnance.statusChance * 100).toFixed(1)}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Fire Rate</span><span className="font-mono">{selectedOrdnance.fireRate}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Plexus Mod Picker */}
      <ModPicker
        open={modPickerOpen}
        onClose={() => setModPickerOpen(false)}
        mods={railjackMods}
        category="_prefiltered"
        equippedModIds={currentMods.map((m) => m.modId)}
        onSelect={(mod, rank) => {
          setCurrentMods((prev) => {
            const filtered = prev.filter((m) => m.slotIndex !== activeSlotIndex);
            return [...filtered, { modId: mod.id, modName: mod.name, rank, slotIndex: activeSlotIndex, polarity: mod.polarity, drain: mod.drain }];
          });
        }}
      />

      {/* Saved Builds Dialog */}
      <Dialog open={showSavedBuilds} onOpenChange={setShowSavedBuilds}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle>Saved Railjack Builds</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {savedBuilds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No saved builds yet.</p>
            ) : (
              <div className="space-y-2">
                {savedBuilds.map((build) => {
                  const d = build.data as RailjackBuildData;
                  const modCount = d.integratedMods.length + d.battleMods.length + d.tacticalMods.length;
                  return (
                    <div key={build.id} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-rose-500/30 transition-all">
                      <button onClick={() => handleLoadBuild(build)} className="flex-1 text-left">
                        <span className="text-sm font-medium">{build.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {modCount} mods • {new Date(build.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                      <button onClick={() => handleDeleteBuild(build.id)} className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
