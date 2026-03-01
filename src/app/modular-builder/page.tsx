"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { ModSlotCard } from "@/components/mod-slot";
import { WeaponStatsPanel } from "@/components/stats-panel";
import { ModPicker } from "@/components/mod-picker";
import { allMods, modsMap } from "@/data/mods";
import { calculateWeaponBuild } from "@/lib/calculator";
import { Weapon, Mod, EquippedMod } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Zap, Star, Wrench, ChevronRight, Save, FolderOpen, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSavedBuilds, saveBuild, deleteBuild, generateBuildId, SavedBuild, ModularBuildData, saveCloudBuild } from "@/lib/build-storage";
import { toast } from "sonner";
import {
  kitgunChambers, kitgunGrips, kitgunLoaders, buildKitgun,
  zawStrikes, zawGrips, zawLinks, buildZaw,
  ampPrisms, ampScaffolds, ampBraces,
  KitgunGrip, KitgunLoader, ZawGrip, ZawLink, AmpScaffold, AmpBrace,
} from "@/data/modular-weapons";
import { cn } from "@/lib/utils";

type ModularType = "kitgun" | "zaw" | "amp";

const typeLabels: Record<ModularType, string> = {
  kitgun: "Kitgun",
  zaw: "Zaw",
  amp: "Amp",
};

function StatDelta({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const color = value > 0 ? "text-green-400" : value < 0 ? "text-red-400" : "text-muted-foreground";
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={color}>{value > 0 ? "+" : ""}{value}{suffix}</span>
    </div>
  );
}

export default function ModularBuilderPage() {
  const [modularType, setModularType] = useState<ModularType>("kitgun");

  // Kitgun state
  const [kitgunChamber, setKitgunChamber] = useState<Weapon | null>(null);
  const [kitgunGrip, setKitgunGrip] = useState<KitgunGrip | null>(null);
  const [kitgunLoader, setKitgunLoader] = useState<KitgunLoader | null>(null);

  // Zaw state
  const [zawStrike, setZawStrike] = useState<Weapon | null>(null);
  const [zawGripSel, setZawGripSel] = useState<ZawGrip | null>(null);
  const [zawLinkSel, setZawLinkSel] = useState<ZawLink | null>(null);

  // Amp state
  const [ampPrism, setAmpPrism] = useState<Weapon | null>(null);
  const [ampScaffold, setAmpScaffold] = useState<AmpScaffold | null>(null);
  const [ampBrace, setAmpBrace] = useState<AmpBrace | null>(null);

  // Mod state
  const [equippedMods, setEquippedMods] = useState<EquippedMod[]>([]);
  const [modPickerOpen, setModPickerOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [hasOrokinCatalyst, setHasOrokinCatalyst] = useState(false);
  const [isMR30, setIsMR30] = useState(false);

  // Build the assembled weapon
  const assembledWeapon = useMemo<Weapon | null>(() => {
    if (modularType === "kitgun" && kitgunChamber && kitgunGrip && kitgunLoader) {
      return buildKitgun(kitgunChamber, kitgunGrip, kitgunLoader);
    }
    if (modularType === "zaw" && zawStrike && zawGripSel && zawLinkSel) {
      return buildZaw(zawStrike, zawGripSel, zawLinkSel);
    }
    if (modularType === "amp" && ampPrism) {
      return { ...ampPrism, name: `${ampPrism.name}${ampScaffold ? ` / ${ampScaffold.name}` : ""}${ampBrace ? ` / ${ampBrace.name}` : ""}` };
    }
    return null;
  }, [modularType, kitgunChamber, kitgunGrip, kitgunLoader, zawStrike, zawGripSel, zawLinkSel, ampPrism, ampScaffold, ampBrace]);

  const calculatedStats = useMemo(() => {
    if (!assembledWeapon) return null;
    return calculateWeaponBuild(assembledWeapon, equippedMods, modsMap);
  }, [assembledWeapon, equippedMods]);

  const modCategory = useMemo(() => {
    if (!assembledWeapon) return "primary";
    if (assembledWeapon.category === "melee") return "melee";
    if (assembledWeapon.category === "secondary") return "secondary";
    return "primary";
  }, [assembledWeapon]);

  const [slotPolarities, setSlotPolarities] = useState<Record<number, string>>({});
  const capacity = (hasOrokinCatalyst ? 60 : 30) + (isMR30 ? 10 : 0);
  const capacityUsed = useMemo(() => {
    return equippedMods.reduce((sum, m) => {
      const mod = modsMap.get(m.modId);
      if (!mod) return sum;
      const baseDrain = mod.drain + m.rank;
      const slotPol = slotPolarities[m.slotIndex];
      if (slotPol && slotPol !== "universal" && mod.polarity === slotPol) return sum + Math.ceil(baseDrain / 2);
      if (slotPol && slotPol !== "universal" && mod.polarity !== slotPol) return sum + Math.ceil(baseDrain * 1.25);
      return sum + baseDrain;
    }, 0);
  }, [equippedMods, slotPolarities]);

  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("");

  useState(() => { setSavedBuilds(getSavedBuilds("modular")); });

  const handleSaveBuild = async () => {
    const parts: Record<string, string> = {};
    if (modularType === "kitgun") {
      if (kitgunChamber) parts.chamber = kitgunChamber.id;
      if (kitgunGrip) parts.grip = kitgunGrip.id;
      if (kitgunLoader) parts.loader = kitgunLoader.id;
    } else if (modularType === "zaw") {
      if (zawStrike) parts.strike = zawStrike.id;
      if (zawGripSel) parts.grip = zawGripSel.id;
      if (zawLinkSel) parts.link = zawLinkSel.id;
    } else {
      if (ampPrism) parts.prism = ampPrism.id;
      if (ampScaffold) parts.scaffold = ampScaffold.id;
      if (ampBrace) parts.brace = ampBrace.id;
    }
    const data: ModularBuildData = {
      modularType,
      parts,
      mods: equippedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      hasOrokinCatalyst,
      isMR30,
      slotPolarities,
    };
    const build: SavedBuild = {
      id: currentBuildId || generateBuildId(),
      name: buildName || `${modularType} Build`,
      type: "modular",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data,
    };
    saveBuild(build);
    setCurrentBuildId(build.id);
    setSavedBuilds(getSavedBuilds("modular"));

    const cloudResult = await saveCloudBuild(build);
    if (cloudResult) {
      toast.success("Build saved", { description: `${build.name} saved to your account` });
    } else {
      toast.success("Build saved locally", { description: "Log in to sync builds to your account" });
    }
  };

  const handleLoadBuild = (build: SavedBuild) => {
    const d = build.data as ModularBuildData;
    setModularType(d.modularType as ModularType);
    if (d.modularType === "kitgun") {
      setKitgunChamber(kitgunChambers.find((c) => c.id === d.parts.chamber) ?? null);
      setKitgunGrip(kitgunGrips.find((g) => g.id === d.parts.grip) ?? null);
      setKitgunLoader(kitgunLoaders.find((l) => l.id === d.parts.loader) ?? null);
    } else if (d.modularType === "zaw") {
      setZawStrike(zawStrikes.find((s) => s.id === d.parts.strike) ?? null);
      setZawGripSel(zawGrips.find((g) => g.id === d.parts.grip) ?? null);
      setZawLinkSel(zawLinks.find((l) => l.id === d.parts.link) ?? null);
    } else {
      setAmpPrism(ampPrisms.find((p) => p.id === d.parts.prism) ?? null);
      setAmpScaffold(ampScaffolds.find((s) => s.id === d.parts.scaffold) ?? null);
      setAmpBrace(ampBraces.find((b) => b.id === d.parts.brace) ?? null);
    }
    setEquippedMods(d.mods.map((m) => {
      const mod = modsMap.get(m.modId);
      return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain };
    }));
    setHasOrokinCatalyst(d.hasOrokinCatalyst);
    setIsMR30(d.isMR30);
    setSlotPolarities(d.slotPolarities || {});
    setCurrentBuildId(build.id);
    setBuildName(build.name);
    setShowSavedBuilds(false);
    toast.info("Build loaded", { description: build.name });
  };

  const handleDeleteBuild = (id: string) => {
    deleteBuild(id);
    setSavedBuilds(getSavedBuilds("modular"));
    if (currentBuildId === id) setCurrentBuildId(null);
    toast.success("Build deleted");
  };

  const resetMods = () => { setEquippedMods([]); setHasOrokinCatalyst(false); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h1 className="text-xl sm:text-3xl font-bold">Modular Builder</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleSaveBuild} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-green-400 hover:border-green-500/50 transition-all" title="Save Build">
              <Save className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Save</span>
            </button>
            <button onClick={() => { setSavedBuilds(getSavedBuilds("modular")); setShowSavedBuilds(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 transition-all" title="Load Build">
              <FolderOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Load</span>
            </button>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">Build custom Kitguns, Zaws, and Amps from parts</p>

        {/* Type selector */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(typeLabels) as ModularType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setModularType(t);
                resetMods();
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                modularType === t
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Wrench className="h-3.5 w-3.5 inline mr-1.5" />
              {typeLabels[t]}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Part selection + Mod slots */}
          <div className="space-y-6">
            {/* KITGUN PARTS */}
            {modularType === "kitgun" && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">KITGUN PARTS</h2>

                {/* Chamber */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Chamber (Base weapon)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {kitgunChambers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setKitgunChamber(c); resetMods(); }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          kitgunChamber?.id === c.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{c.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG {c.damage} • {c.triggerType}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grip */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Grip (Affects damage, fire rate, type)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {kitgunGrips.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => { setKitgunGrip(g); resetMods(); }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          kitgunGrip?.id === g.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{g.name}</span>
                        <span className={cn("ml-1.5 text-[10px]", g.type === "primary" ? "text-blue-400" : g.type === "secondary" ? "text-green-400" : "text-amber-400")}>
                          {g.type}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG ×{g.damageMultiplier} • FR ×{g.fireRateMultiplier}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loader */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Loader (Affects crit, status, magazine)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {kitgunLoaders.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => { setKitgunLoader(l); resetMods(); }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          kitgunLoader?.id === l.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{l.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          CC {l.criticalChanceBonus > 0 ? "+" : ""}{(l.criticalChanceBonus * 100).toFixed(0)}% •
                          SC {l.statusChanceBonus > 0 ? "+" : ""}{(l.statusChanceBonus * 100).toFixed(0)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ZAW PARTS */}
            {modularType === "zaw" && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">ZAW PARTS</h2>

                {/* Strike */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Strike (Blade type)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {zawStrikes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setZawStrike(s); resetMods(); }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          zawStrike?.id === s.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{s.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG {s.damage} • CC {(s.criticalChance * 100).toFixed(0)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grip */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Grip (1H or 2H, affects damage & speed)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {zawGrips.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => { setZawGripSel(g); resetMods(); }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          zawGripSel?.id === g.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{g.name}</span>
                        <span className={cn("ml-1.5 text-[10px]", g.type === "1h" ? "text-green-400" : "text-amber-400")}>{g.type}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG ×{g.damageMultiplier} • SPD ×{g.speedMultiplier}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Link (Crit/Status balance)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {zawLinks.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => { setZawLinkSel(l); resetMods(); }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          zawLinkSel?.id === l.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium text-xs">{l.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          CC {l.critBonus > 0 ? "+" : ""}{(l.critBonus * 100).toFixed(0)}% •
                          SC {l.statusBonus > 0 ? "+" : ""}{(l.statusBonus * 100).toFixed(0)}% •
                          DMG {l.damageBonus > 0 ? "+" : ""}{(l.damageBonus * 100).toFixed(0)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AMP PARTS */}
            {modularType === "amp" && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">AMP PARTS</h2>

                {/* Prism */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Prism (Primary fire)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ampPrisms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setAmpPrism(p); resetMods(); }}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          ampPrism?.id === p.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{p.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG {p.damage} • {p.triggerType} • CC {(p.criticalChance * 100).toFixed(0)}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scaffold */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Scaffold (Alt fire)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ampScaffolds.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setAmpScaffold(s)}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          ampScaffold?.id === s.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{s.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          DMG {s.damage} • {s.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brace */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Brace (Energy pool)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ampBraces.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setAmpBrace(b)}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all text-sm",
                          ampBrace?.id === b.id
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                            : "border-border hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        )}
                      >
                        <span className="font-medium">{b.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {b.maxEnergyBonus > 0 && `+${b.maxEnergyBonus} Energy `}
                          {b.rechargeRateBonus > 0 && `+${(b.rechargeRateBonus * 100).toFixed(0)}% Recharge `}
                          {b.rechargeDelayReduction > 0 && `-${(b.rechargeDelayReduction * 100).toFixed(0)}% Delay `}
                          {b.maxEnergyBonus === 0 && b.rechargeRateBonus === 0 && b.rechargeDelayReduction <= 0 && "Balanced"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Assembled weapon + Mod slots */}
            {assembledWeapon && (
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wrench className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-lg font-bold">{assembledWeapon.name}</h2>
                  <span className="text-sm text-muted-foreground capitalize">{assembledWeapon.category}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => setIsMR30(!isMR30)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all",
                        isMR30
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Star className="h-3.5 w-3.5" />
                      MR 30+
                    </button>
                    <button
                      onClick={() => setHasOrokinCatalyst(!hasOrokinCatalyst)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all",
                        hasOrokinCatalyst
                          ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Catalyst
                    </button>
                  </div>
                </div>

                {assembledWeapon.modSlots > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold tracking-wider text-muted-foreground">MOD CONFIGURATION</h3>
                      <span className={cn(
                        "text-xs font-mono",
                        capacityUsed > capacity ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {capacityUsed} / {capacity}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Array.from({ length: assembledWeapon.modSlots }, (_, i) => {
                        const equipped = equippedMods.find((m) => m.slotIndex === i);
                        const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                        return (
                          <ModSlotCard
                            key={i}
                            mod={mod}
                            rank={equipped?.rank ?? 0}
                            slotIndex={i}
                            slotPolarity={slotPolarities[i]}
                            onAdd={() => { setActiveSlotIndex(i); setModPickerOpen(true); }}
                            onRemove={() => setEquippedMods((prev) => prev.filter((m) => m.slotIndex !== i))}
                            onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[i] = p; else delete next[i]; return next; })}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Stats panel */}
          <div>
            <div className="border border-border rounded-xl p-6 bg-card sticky top-6">
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground mb-4">
                {assembledWeapon ? "WEAPON STATS" : "SELECT ALL PARTS"}
              </h3>
              {assembledWeapon && calculatedStats ? (
                <WeaponStatsPanel stats={calculatedStats} />
              ) : (
                <div className="space-y-2 text-sm text-muted-foreground">
                  {modularType === "kitgun" && (
                    <>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", kitgunChamber ? "text-green-400" : "")} />
                        <span className={kitgunChamber ? "text-foreground" : ""}>
                          {kitgunChamber ? kitgunChamber.name : "Select Chamber"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", kitgunGrip ? "text-green-400" : "")} />
                        <span className={kitgunGrip ? "text-foreground" : ""}>
                          {kitgunGrip ? kitgunGrip.name : "Select Grip"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", kitgunLoader ? "text-green-400" : "")} />
                        <span className={kitgunLoader ? "text-foreground" : ""}>
                          {kitgunLoader ? kitgunLoader.name : "Select Loader"}
                        </span>
                      </div>
                    </>
                  )}
                  {modularType === "zaw" && (
                    <>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", zawStrike ? "text-green-400" : "")} />
                        <span className={zawStrike ? "text-foreground" : ""}>
                          {zawStrike ? zawStrike.name : "Select Strike"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", zawGripSel ? "text-green-400" : "")} />
                        <span className={zawGripSel ? "text-foreground" : ""}>
                          {zawGripSel ? zawGripSel.name : "Select Grip"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", zawLinkSel ? "text-green-400" : "")} />
                        <span className={zawLinkSel ? "text-foreground" : ""}>
                          {zawLinkSel ? zawLinkSel.name : "Select Link"}
                        </span>
                      </div>
                    </>
                  )}
                  {modularType === "amp" && (
                    <>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", ampPrism ? "text-green-400" : "")} />
                        <span className={ampPrism ? "text-foreground" : ""}>
                          {ampPrism ? ampPrism.name : "Select Prism"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", ampScaffold ? "text-green-400" : "")} />
                        <span className={ampScaffold ? "text-foreground" : ""}>
                          {ampScaffold ? ampScaffold.name : "Select Scaffold"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn("h-3.5 w-3.5", ampBrace ? "text-green-400" : "")} />
                        <span className={ampBrace ? "text-foreground" : ""}>
                          {ampBrace ? ampBrace.name : "Select Brace"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Amp scaffold stats */}
              {modularType === "amp" && ampScaffold && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">ALT FIRE ({ampScaffold.name})</h4>
                  <div className="space-y-0.5">
                    <StatDelta label="Damage" value={ampScaffold.damage} />
                    <StatDelta label="Fire Rate" value={ampScaffold.fireRate} suffix="/s" />
                    <StatDelta label="Crit Chance" value={+(ampScaffold.criticalChance * 100).toFixed(0)} suffix="%" />
                    <StatDelta label="Crit Multi" value={ampScaffold.criticalMultiplier} suffix="x" />
                    <StatDelta label="Status" value={+(ampScaffold.statusChance * 100).toFixed(0)} suffix="%" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mod Picker */}
      {assembledWeapon && (
        <ModPicker
          open={modPickerOpen}
          onClose={() => setModPickerOpen(false)}
          mods={allMods}
          category={modCategory}
          equippedModIds={equippedMods.map((m) => m.modId)}
          onSelect={(mod, rank) => {
            setEquippedMods((prev) => {
              const filtered = prev.filter((m) => m.slotIndex !== activeSlotIndex);
              return [...filtered, { modId: mod.id, modName: mod.name, rank, slotIndex: activeSlotIndex, polarity: mod.polarity, drain: mod.drain }];
            });
          }}
        />
      )}

      {/* Saved Builds Dialog */}
      <Dialog open={showSavedBuilds} onOpenChange={setShowSavedBuilds}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle>Saved Modular Builds</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {savedBuilds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No saved builds yet.</p>
            ) : (
              <div className="space-y-2">
                {savedBuilds.map((build) => {
                  const d = build.data as ModularBuildData;
                  return (
                    <div key={build.id} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-cyan-500/30 transition-all">
                      <button onClick={() => handleLoadBuild(build)} className="flex-1 text-left">
                        <span className="text-sm font-medium">{build.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {d.modularType} • {d.mods.length} mods • {new Date(build.updatedAt).toLocaleDateString()}
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
