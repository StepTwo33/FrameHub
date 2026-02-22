"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { WeaponStatsPanel } from "@/components/stats-panel";
import { useWeapons } from "@/lib/use-data";
import { allMods, modsMap } from "@/data/mods";
import { calculateWeaponBuild, calculateWarframeBuild } from "@/lib/calculator";
import { Weapon, Mod, CalculatedStats, EquippedMod, Loadout, ModSlot, WarframeCalculatedStats } from "@/lib/types";
import { ModSlotCard } from "@/components/mod-slot";
import { ModPicker } from "@/components/mod-picker";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, ArrowLeftRight, ChevronDown, ChevronRight, X,
  Shield, Swords, Crosshair, Dog, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getWeaponImage, getWarframeImage, getCompanionImage } from "@/lib/images";
import { warframesMap } from "@/data/warframes";
import { weaponsMap } from "@/data/weapons";
import { companionsMap } from "@/data/companions";
import { getLoadouts } from "@/lib/loadouts";

/* ─── Shared helpers ─── */

function getModCategory(weaponCategory: string): string {
  if (["rifle", "shotgun", "bow", "primary", "launcher"].includes(weaponCategory)) return "primary";
  if (["pistol", "secondary", "dual_pistols"].includes(weaponCategory)) return "secondary";
  if (weaponCategory === "melee") return "melee";
  return "primary";
}

function fmtNum(n: number, decimals = 0): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(decimals);
}

function CompareRow({ label, a, b, higher = "green", format }: {
  label: string;
  a: number | null;
  b: number | null;
  higher?: "green" | "red";
  format?: (v: number) => string;
}) {
  const fmtFn = format || ((v: number) => fmtNum(v));
  const diff = (a ?? 0) - (b ?? 0);
  const aWins = higher === "green" ? diff > 0.01 : diff < -0.01;
  const bWins = higher === "green" ? diff < -0.01 : diff > 0.01;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 py-0.5 items-center">
      <span className={cn(
        "text-xs font-mono text-right",
        a === null ? "text-muted-foreground/30" : aWins ? "text-green-400 font-bold" : bWins ? "text-red-400" : ""
      )}>
        {a !== null ? fmtFn(a) : "–"}
      </span>
      <span className="text-[10px] text-muted-foreground text-center w-16 sm:w-28 truncate">{label}</span>
      <span className={cn(
        "text-xs font-mono",
        b === null ? "text-muted-foreground/30" : bWins ? "text-green-400 font-bold" : aWins ? "text-red-400" : ""
      )}>
        {b !== null ? fmtFn(b) : "–"}
      </span>
    </div>
  );
}

/* ─── Tab type ─── */

type CompareTab = "build" | "loadout";

/* ─── Build vs Build tab ─── */

interface BuildSlot {
  weapon: Weapon | null;
  mods: EquippedMod[];
  stats: CalculatedStats | null;
}

function BuildCompareTab() {
  const allWeapons = useWeapons();
  const [builds, setBuilds] = useState<[BuildSlot, BuildSlot]>([
    { weapon: null, mods: [], stats: null },
    { weapon: null, mods: [], stats: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [activeModSlot, setActiveModSlot] = useState(0);
  const [modPickerOpen, setModPickerOpen] = useState(false);
  const [weaponPickerOpen, setWeaponPickerOpen] = useState<0 | 1 | null>(null);
  const [weaponSearch, setWeaponSearch] = useState("");

  const filteredWeapons = useMemo(() => {
    const hiddenCategories = ["amp_prism", "zaw_strike", "kitgun_chamber"];
    let weapons = allWeapons.filter((w) => !hiddenCategories.includes(w.category));
    if (weaponSearch.trim()) {
      const q = weaponSearch.toLowerCase();
      weapons = weapons.filter((w) => w.name.toLowerCase().includes(q));
    }
    return weapons.sort((a, b) => a.name.localeCompare(b.name));
  }, [weaponSearch, allWeapons]);

  const recalcStats = (weapon: Weapon | null, mods: EquippedMod[]): CalculatedStats | null => {
    if (!weapon) return null;
    const modSlots = mods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex }));
    return calculateWeaponBuild(weapon, modSlots, modsMap);
  };

  const selectWeapon = (side: 0 | 1, weapon: Weapon) => {
    setBuilds((prev) => {
      const next = [...prev] as [BuildSlot, BuildSlot];
      next[side] = { weapon, mods: [], stats: recalcStats(weapon, []) };
      return next;
    });
    setWeaponPickerOpen(null);
    setWeaponSearch("");
  };

  const addMod = (mod: Mod, rank: number) => {
    setBuilds((prev) => {
      const next = [...prev] as [BuildSlot, BuildSlot];
      const slot = next[activeSlot];
      const filtered = slot.mods.filter((m) => m.slotIndex !== activeModSlot);
      const newMods = [...filtered, {
        modId: mod.id, modName: mod.name, rank, slotIndex: activeModSlot,
        polarity: mod.polarity, drain: mod.drain,
      }];
      next[activeSlot] = { ...slot, mods: newMods, stats: recalcStats(slot.weapon, newMods) };
      return next;
    });
  };

  const removeMod = (side: 0 | 1, slotIndex: number) => {
    setBuilds((prev) => {
      const next = [...prev] as [BuildSlot, BuildSlot];
      const slot = next[side];
      const newMods = slot.mods.filter((m) => m.slotIndex !== slotIndex);
      next[side] = { ...slot, mods: newMods, stats: recalcStats(slot.weapon, newMods) };
      return next;
    });
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {([0, 1] as const).map((side) => {
          const build = builds[side];
          return (
            <div key={side} className="space-y-4">
              {/* Weapon Selector */}
              {weaponPickerOpen === side ? (
                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search weapons..."
                      value={weaponSearch}
                      onChange={(e) => setWeaponSearch(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <button onClick={() => setWeaponPickerOpen(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-0.5">
                      {filteredWeapons.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => selectWeapon(side, w)}
                          className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <img src={getWeaponImage(w.name)} alt="" className="w-6 h-6 rounded object-contain bg-muted/20 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <span className="font-medium">{w.name}</span>
                          <span className="text-muted-foreground ml-auto text-[10px]">{w.category}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <button
                  onClick={() => setWeaponPickerOpen(side)}
                  className={cn(
                    "w-full text-left border rounded-xl p-4 transition-all",
                    build.weapon
                      ? "border-border bg-card hover:border-primary/50"
                      : "border-dashed border-border/50 hover:border-primary/50 bg-card/50"
                  )}
                >
                  {build.weapon ? (
                    <div className="flex items-center gap-3">
                      <img src={getWeaponImage(build.weapon.name)} alt="" className="w-10 h-10 rounded object-contain bg-muted/20 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div>
                        <div className="text-lg font-bold">{build.weapon.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{build.weapon.category} • {build.weapon.triggerType}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <ChevronDown className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">Select Build {side + 1}</span>
                    </div>
                  )}
                </button>
              )}

              {/* Mod Slots */}
              {build.weapon && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {Array.from({ length: build.weapon.modSlots }, (_, i) => {
                    const equipped = build.mods.find((m) => m.slotIndex === i);
                    const mod = equipped ? modsMap.get(equipped.modId) : null;
                    return (
                      <ModSlotCard
                        key={i}
                        slotIndex={i}
                        mod={mod ?? null}
                        rank={equipped?.rank ?? 0}
                        onAdd={() => { setActiveSlot(side); setActiveModSlot(i); setModPickerOpen(true); }}
                        onRemove={() => removeMod(side, i)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Stats */}
              <WeaponStatsPanel
                stats={build.stats}
                isMelee={build.weapon?.category === "melee" || build.weapon?.triggerType === "Melee"}
              />
            </div>
          );
        })}
      </div>

      {/* Side-by-side comparison table */}
      {builds[0].stats && builds[1].stats && (
        <div className="mt-8 border border-border rounded-xl p-4 sm:p-6 bg-card">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-4">COMPARISON</h2>
          <div className="space-y-1">
            <CompareRow label="Total Damage" a={builds[0].stats.totalDamage} b={builds[1].stats.totalDamage} format={(v) => v.toFixed(1)} />
            <CompareRow label="Critical Chance" a={builds[0].stats.criticalChance * 100} b={builds[1].stats.criticalChance * 100} format={(v) => `${v.toFixed(1)}%`} />
            <CompareRow label="Critical Multiplier" a={builds[0].stats.criticalMultiplier} b={builds[1].stats.criticalMultiplier} format={(v) => `${v.toFixed(1)}x`} />
            <CompareRow label="Status Chance" a={builds[0].stats.statusChance * 100} b={builds[1].stats.statusChance * 100} format={(v) => `${v.toFixed(1)}%`} />
            <CompareRow label="Fire Rate" a={builds[0].stats.fireRate} b={builds[1].stats.fireRate} format={(v) => v.toFixed(2)} />
            <CompareRow label="Multishot" a={builds[0].stats.multishot} b={builds[1].stats.multishot} format={(v) => v.toFixed(2)} />
            <CompareRow label="Burst DPS" a={builds[0].stats.burstDps} b={builds[1].stats.burstDps} />
            <CompareRow label="Sustained DPS" a={builds[0].stats.sustainedDps} b={builds[1].stats.sustainedDps} />
          </div>
        </div>
      )}

      <ModPicker
        open={modPickerOpen}
        onClose={() => setModPickerOpen(false)}
        mods={allMods}
        category={builds[activeSlot].weapon ? getModCategory(builds[activeSlot].weapon!.category) : "primary"}
        equippedModIds={builds[activeSlot].mods.map((m) => m.modId)}
        onSelect={addMod}
      />
    </>
  );
}

/* ─── Loadout vs Loadout tab ─── */

type SlotType = "warframe" | "primary" | "secondary" | "melee" | "companion";

const SLOT_META: Record<SlotType, { label: string; icon: React.ReactNode; color: string }> = {
  warframe:  { label: "Warframe",  icon: <Shield className="h-4 w-4" />,    color: "text-purple-400" },
  primary:   { label: "Primary",   icon: <Crosshair className="h-4 w-4" />, color: "text-blue-400" },
  secondary: { label: "Secondary", icon: <Crosshair className="h-4 w-4" />, color: "text-cyan-400" },
  melee:     { label: "Melee",     icon: <Swords className="h-4 w-4" />,    color: "text-orange-400" },
  companion: { label: "Companion", icon: <Dog className="h-4 w-4" />,       color: "text-green-400" },
};

interface LoadoutStats {
  warframe: { name: string; stats: WarframeCalculatedStats } | null;
  primary: { name: string; stats: CalculatedStats } | null;
  secondary: { name: string; stats: CalculatedStats } | null;
  melee: { name: string; stats: CalculatedStats } | null;
  companion: { name: string; hp: number; shield: number; armor: number } | null;
}

function calcLoadoutStats(loadout: Loadout): LoadoutStats {
  const result: LoadoutStats = { warframe: null, primary: null, secondary: null, melee: null, companion: null };

  if (loadout.warframeBuild) {
    const wf = warframesMap.get(loadout.warframeBuild.warframeId);
    if (wf) {
      const stats = calculateWarframeBuild(wf, loadout.warframeBuild.mods || [], modsMap);
      result.warframe = { name: wf.name, stats };
    }
  }

  const calcWeapon = (build: { weaponId: string; mods: ModSlot[] } | undefined) => {
    if (!build) return null;
    const w = weaponsMap.get(build.weaponId);
    if (!w) return null;
    const stats = calculateWeaponBuild(w, build.mods || [], modsMap);
    return { name: w.name, stats };
  };

  result.primary = calcWeapon(loadout.primaryBuild);
  result.secondary = calcWeapon(loadout.secondaryBuild);
  result.melee = calcWeapon(loadout.meleeBuild);

  if (loadout.companionBuild) {
    const c = companionsMap.get(loadout.companionBuild.companionId);
    if (c) result.companion = { name: c.name, hp: c.health, shield: c.shield, armor: c.armor };
  }

  return result;
}

function SlotSection({ slot, a, b }: {
  slot: SlotType;
  a: LoadoutStats;
  b: LoadoutStats;
}) {
  const [open, setOpen] = useState(true);
  const meta = SLOT_META[slot];

  if (slot === "warframe") {
    const wA = a.warframe;
    const wB = b.warframe;
    if (!wA && !wB) return null;
    return (
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className={meta.color}>{meta.icon}</span>
          {meta.label}
        </button>
        {open && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2 items-center">
              <div className="flex items-center gap-2 justify-end">
                {wA && <img src={getWarframeImage(wA.name)} alt="" className="w-8 h-8 rounded object-contain bg-muted/30 hidden sm:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <span className="text-xs font-medium">{wA?.name || "–"}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                {wB && <img src={getWarframeImage(wB.name)} alt="" className="w-8 h-8 rounded object-contain bg-muted/30 hidden sm:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <span className="text-xs font-medium">{wB?.name || "–"}</span>
              </div>
            </div>
            <CompareRow label="Health" a={wA?.stats.totalHealth ?? null} b={wB?.stats.totalHealth ?? null} />
            <CompareRow label="Shield" a={wA?.stats.totalShield ?? null} b={wB?.stats.totalShield ?? null} />
            <CompareRow label="Armor" a={wA?.stats.totalArmor ?? null} b={wB?.stats.totalArmor ?? null} />
            <CompareRow label="Energy" a={wA?.stats.totalEnergy ?? null} b={wB?.stats.totalEnergy ?? null} />
            <CompareRow label="Sprint" a={wA?.stats.totalSprint ?? null} b={wB?.stats.totalSprint ?? null} format={(v) => v.toFixed(2)} />
            <CompareRow label="EHP" a={wA?.stats.effectiveHealth ?? null} b={wB?.stats.effectiveHealth ?? null} />
            <CompareRow label="DR %" a={wA?.stats.damageReduction ?? null} b={wB?.stats.damageReduction ?? null} format={(v) => `${v.toFixed(1)}%`} />
            <CompareRow label="Strength" a={wA ? wA.stats.abilityStrength * 100 : null} b={wB ? wB.stats.abilityStrength * 100 : null} format={(v) => `${v.toFixed(0)}%`} />
            <CompareRow label="Duration" a={wA ? wA.stats.abilityDuration * 100 : null} b={wB ? wB.stats.abilityDuration * 100 : null} format={(v) => `${v.toFixed(0)}%`} />
            <CompareRow label="Efficiency" a={wA ? wA.stats.abilityEfficiency * 100 : null} b={wB ? wB.stats.abilityEfficiency * 100 : null} format={(v) => `${v.toFixed(0)}%`} />
            <CompareRow label="Range" a={wA ? wA.stats.abilityRange * 100 : null} b={wB ? wB.stats.abilityRange * 100 : null} format={(v) => `${v.toFixed(0)}%`} />
          </div>
        )}
      </div>
    );
  }

  if (slot === "companion") {
    const cA = a.companion;
    const cB = b.companion;
    if (!cA && !cB) return null;
    return (
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className={meta.color}>{meta.icon}</span>
          {meta.label}
        </button>
        {open && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2 items-center">
              <div className="flex items-center gap-2 justify-end">
                {cA && <img src={getCompanionImage(cA.name)} alt="" className="w-8 h-8 rounded object-contain bg-muted/30 hidden sm:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <span className="text-xs font-medium">{cA?.name || "–"}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                {cB && <img src={getCompanionImage(cB.name)} alt="" className="w-8 h-8 rounded object-contain bg-muted/30 hidden sm:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <span className="text-xs font-medium">{cB?.name || "–"}</span>
              </div>
            </div>
            <CompareRow label="Health" a={cA?.hp ?? null} b={cB?.hp ?? null} />
            <CompareRow label="Shield" a={cA?.shield ?? null} b={cB?.shield ?? null} />
            <CompareRow label="Armor" a={cA?.armor ?? null} b={cB?.armor ?? null} />
          </div>
        )}
      </div>
    );
  }

  // Weapon slots
  const wA = a[slot];
  const wB = b[slot];
  if (!wA && !wB) return null;
  const sA = wA?.stats ?? null;
  const sB = wB?.stats ?? null;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <span className={meta.color}>{meta.icon}</span>
        {meta.label}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2 items-center">
            <div className="flex items-center gap-2 justify-end">
              {wA && <img src={getWeaponImage(wA.name)} alt="" className="w-8 h-8 rounded object-contain bg-muted/30 hidden sm:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <span className="text-xs font-medium">{wA?.name || "–"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">vs</span>
            <div className="flex items-center gap-2">
              {wB && <img src={getWeaponImage(wB.name)} alt="" className="w-8 h-8 rounded object-contain bg-muted/30 hidden sm:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <span className="text-xs font-medium">{wB?.name || "–"}</span>
            </div>
          </div>
          <CompareRow label="Total Damage" a={sA?.totalDamage ?? null} b={sB?.totalDamage ?? null} format={(v) => v.toFixed(1)} />
          <CompareRow label="Crit Chance" a={sA ? sA.criticalChance * 100 : null} b={sB ? sB.criticalChance * 100 : null} format={(v) => `${v.toFixed(1)}%`} />
          <CompareRow label="Crit Multi" a={sA?.criticalMultiplier ?? null} b={sB?.criticalMultiplier ?? null} format={(v) => `${v.toFixed(1)}x`} />
          <CompareRow label="Status Chance" a={sA ? sA.statusChance * 100 : null} b={sB ? sB.statusChance * 100 : null} format={(v) => `${v.toFixed(1)}%`} />
          <CompareRow label="Fire Rate" a={sA?.fireRate ?? null} b={sB?.fireRate ?? null} format={(v) => v.toFixed(2)} />
          <CompareRow label="Multishot" a={sA?.multishot ?? null} b={sB?.multishot ?? null} format={(v) => v.toFixed(2)} />
          <CompareRow label="Magazine" a={sA?.magazine ?? null} b={sB?.magazine ?? null} format={(v) => v.toFixed(0)} />
          <CompareRow label="Reload" a={sA?.reloadTime ?? null} b={sB?.reloadTime ?? null} format={(v) => `${v.toFixed(2)}s`} higher="red" />
          <div className="border-t border-border/50 my-1" />
          <CompareRow label="Burst DPS" a={sA?.burstDps ?? null} b={sB?.burstDps ?? null} />
          <CompareRow label="Sustained DPS" a={sA?.sustainedDps ?? null} b={sB?.sustainedDps ?? null} />
        </div>
      )}
    </div>
  );
}

function LoadoutCompareTab() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [selA, setSelA] = useState<string | null>(null);
  const [selB, setSelB] = useState<string | null>(null);

  useEffect(() => {
    setLoadouts(getLoadouts());
  }, []);

  const loadoutA = useMemo(() => loadouts.find((l) => l.id === selA) ?? null, [loadouts, selA]);
  const loadoutB = useMemo(() => loadouts.find((l) => l.id === selB) ?? null, [loadouts, selB]);

  const statsA = useMemo(() => loadoutA ? calcLoadoutStats(loadoutA) : null, [loadoutA]);
  const statsB = useMemo(() => loadoutB ? calcLoadoutStats(loadoutB) : null, [loadoutB]);

  const aggregate = useMemo(() => {
    if (!statsA || !statsB) return null;
    const totalDpsA = (statsA.primary?.stats.sustainedDps ?? 0) + (statsA.secondary?.stats.sustainedDps ?? 0) + (statsA.melee?.stats.sustainedDps ?? 0);
    const totalDpsB = (statsB.primary?.stats.sustainedDps ?? 0) + (statsB.secondary?.stats.sustainedDps ?? 0) + (statsB.melee?.stats.sustainedDps ?? 0);
    const ehpA = statsA.warframe?.stats.effectiveHealth ?? 0;
    const ehpB = statsB.warframe?.stats.effectiveHealth ?? 0;
    return { totalDpsA, totalDpsB, ehpA, ehpB };
  }, [statsA, statsB]);

  if (loadouts.length < 2) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground mb-2">You need at least 2 saved loadouts to compare.</p>
        <a href="/loadouts" className="text-sm text-primary hover:underline">Go to Loadouts →</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Loadout Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start mb-6">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">LOADOUT A</label>
          <select
            value={selA ?? ""}
            onChange={(e) => setSelA(e.target.value || null)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select loadout...</option>
            {loadouts.map((l) => (
              <option key={l.id} value={l.id} disabled={l.id === selB}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="pt-5 hidden sm:block">
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">LOADOUT B</label>
          <select
            value={selB ?? ""}
            onChange={(e) => setSelB(e.target.value || null)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select loadout...</option>
            {loadouts.map((l) => (
              <option key={l.id} value={l.id} disabled={l.id === selA}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Summary */}
      {aggregate && (
        <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 mb-6">
          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-primary" /> AGGREGATE
          </h2>
          <CompareRow label="Total Sustained DPS" a={aggregate.totalDpsA} b={aggregate.totalDpsB} />
          <CompareRow label="Warframe EHP" a={aggregate.ehpA} b={aggregate.ehpB} />
        </div>
      )}

      {/* Per-Slot Comparisons */}
      {statsA && statsB && (
        <div className="space-y-4">
          {(["warframe", "primary", "secondary", "melee", "companion"] as SlotType[]).map((slot) => (
            <SlotSection key={slot} slot={slot} a={statsA} b={statsB} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─── */

export default function ComparePage() {
  const [tab, setTab] = useState<CompareTab>("build");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeftRight className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-2xl font-bold">Compare</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("build")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
              tab === "build"
                ? "bg-primary/10 border-primary/50 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Swords className="h-3.5 w-3.5 inline mr-1.5" />
            Build vs Build
          </button>
          <button
            onClick={() => setTab("loadout")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
              tab === "loadout"
                ? "bg-primary/10 border-primary/50 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield className="h-3.5 w-3.5 inline mr-1.5" />
            Loadout vs Loadout
          </button>
        </div>

        {tab === "build" ? <BuildCompareTab /> : <LoadoutCompareTab />}
      </main>
    </div>
  );
}
