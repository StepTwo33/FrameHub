"use client";

import { useState, useMemo, useCallback } from "react";
import { PageShell } from "@/components/page-shell";
import {
  ItemPickerScreen,
  ItemPickerFilter,
  ItemPickerRow,
  BuilderItemHeader,
  BuilderActionBar,
  BuilderActionGroup,
} from "@/components/item-picker";
import { ModSlotCard } from "@/components/mod-slot";
import { ModPicker } from "@/components/mod-picker";
import { allMods, modsMap } from "@/data/mods";
import { useCompanions, useWeapons } from "@/lib/use-data";
import { Companion, Mod, Weapon, EquippedMod, CompanionCalculatedStats } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Zap, Dog, Bot, Bug, Swords, Crosshair, Flag, Star, Save, FolderOpen, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSavedBuilds, saveBuild, deleteBuild, generateBuildId, SavedBuild, CompanionBuildData, saveCloudBuild } from "@/lib/build-storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCompanionImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";
import { modSlotCapacityCost } from "@/lib/mod-capacity";

const companionTypeLabels: Record<string, string> = {
  all: "All",
  sentinel: "Sentinels",
  kubrow: "Kubrows",
  kavat: "Kavats",
  moa: "MOAs",
  predasite: "Predasites",
  vulpaphyla: "Vulpaphylas",
  hound: "Hounds",
};

function getCompanionIcon(type: string) {
  switch (type) {
    case "sentinel": return <Bot className="h-4 w-4" />;
    case "kubrow": case "kavat": case "predasite": case "vulpaphyla": return <Dog className="h-4 w-4" />;
    case "hound": return <Bug className="h-4 w-4" />;
    default: return <Bot className="h-4 w-4" />;
  }
}

function getCompanionModSubCategory(companionType: string): string[] {
  switch (companionType) {
    case "sentinel": case "moa": case "hound":
      return ["universal", "robotic"];
    case "kubrow": case "kavat": case "predasite": case "vulpaphyla":
      return ["universal", "beast"];
    default:
      return ["universal"];
  }
}

import { getCompanionWeapons } from "@/lib/companion-weapons";
import { SaveBuildDialog, type SaveBuildDialogValues } from "@/components/save-build-dialog";
import { useCloudBuildFromUrl } from "@/lib/use-cloud-build-from-url";
function calculateWeaponStats(weapon: Weapon, mods: EquippedMod[], rivenStats?: Record<string, number> | null) {
  let dmgMult = 1;
  let critChance = weapon.criticalChance;
  let critMult = weapon.criticalMultiplier;
  let statusChance = weapon.statusChance;
  let fireRate = weapon.fireRate;
  let multishot = weapon.multishot ?? 1;
  let magazineBonus = 0;
  let reloadBonus = 0;
  let damagePerStatusBonus = 0;
  let nonCritDamageBonus = 0;
  let healthPerSlashStack = 0;

  for (const em of mods) {
    const mod = modsMap.get(em.modId);
    if (!mod) continue;
    const rank = Math.min(em.rank, mod.maxRank);
    const mult = rank + 1;
    for (const [stat, val] of Object.entries(mod.stats)) {
      const v = (val * mult) / 100;
      switch (stat) {
        case "damage": dmgMult += v; break;
        case "criticalChance": critChance += weapon.criticalChance * v; break;
        case "criticalMultiplier":
        case "criticalDamage":
          critMult += weapon.criticalMultiplier * v;
          break;
        case "statusChance": statusChance += weapon.statusChance * v; break;
        case "fireRate": case "attackSpeed": fireRate += weapon.fireRate * v; break;
        case "multishot": multishot += v; break;
        case "magazine": case "magazineSize": magazineBonus += v; break;
        case "reload": case "reloadSpeed": reloadBonus += v; break;
        case "damagePerStatus": damagePerStatusBonus += v; break;
        case "nonCritDamage": nonCritDamageBonus += v; break;
        case "healthPerSlashStack": healthPerSlashStack += val * mult; break;
      }
    }
  }

  // Apply riven stats
  if (rivenStats && Object.keys(rivenStats).length > 0) {
    for (const [stat, val] of Object.entries(rivenStats)) {
      switch (stat) {
        case "damage": dmgMult += val; break;
        case "criticalChance": critChance += weapon.criticalChance * val; break;
        case "criticalMultiplier":
        case "criticalDamage":
          critMult += weapon.criticalMultiplier * val;
          break;
        case "statusChance": statusChance += weapon.statusChance * val; break;
        case "fireRate": fireRate += weapon.fireRate * val; break;
        case "multishot": multishot += val; break;
        case "magazine": magazineBonus += val; break;
        case "reloadSpeed": reloadBonus += val; break;
      }
    }
  }

  const totalDmg = weapon.damage * dmgMult;
  const avgHit = totalDmg * multishot;
  const avgCritMult = 1 + critChance * (critMult - 1);
  const dps = avgHit * avgCritMult * fireRate;
  const magazine = Math.round(weapon.magazine * (1 + magazineBonus));
  const reload = Math.max(0.1, weapon.reloadTime * (1 - reloadBonus));

  return {
    totalDamage: totalDmg,
    avgHit,
    critChance: Math.min(critChance, 1),
    critMultiplier: critMult,
    statusChance: Math.min(statusChance, 1),
    fireRate,
    multishot,
    dps,
    magazine,
    reloadTime: reload,
    damagePerStatusBonus,
    nonCritDamageBonus,
    healthPerSlashStack,
  };
}

function calculateCompanionStats(
  companion: Companion,
  equippedMods: EquippedMod[],
): CompanionCalculatedStats {
  const stats: CompanionCalculatedStats = {
    baseHealth: companion.health,
    baseShield: companion.shield,
    baseArmor: companion.armor,
    totalHealth: companion.health,
    totalShield: companion.shield,
    totalArmor: companion.armor,
    healthBonus: 0,
    shieldBonus: 0,
    armorBonus: 0,
    meleeDamageBonus: 0,
    attackSpeedBonus: 0,
    critChanceBonus: 0,
    critDamageBonus: 0,
    effectiveHealth: 0,
    damageReduction: 0,
  };

  for (const em of equippedMods) {
    const mod = modsMap.get(em.modId);
    if (!mod) continue;
    const rank = Math.min(em.rank, mod.maxRank);
    const multiplier = (rank + 1);

    for (const [statName, value] of Object.entries(mod.stats)) {
      const modValue = (value * multiplier) / 100;
      switch (statName) {
        case "health": stats.healthBonus += modValue; break;
        case "shield": stats.shieldBonus += modValue; break;
        case "armor": stats.armorBonus += modValue; break;
        case "meleeDamage": stats.meleeDamageBonus += modValue; break;
        case "attackSpeed": stats.attackSpeedBonus += modValue; break;
        case "critChance": stats.critChanceBonus += modValue; break;
        case "critDamage": stats.critDamageBonus += modValue; break;
      }
    }
  }

  stats.totalHealth = stats.baseHealth * (1 + stats.healthBonus);
  stats.totalShield = stats.baseShield * (1 + stats.shieldBonus);
  stats.totalArmor = stats.baseArmor * (1 + stats.armorBonus);
  const armorDR = stats.totalArmor / (stats.totalArmor + 300);
  stats.damageReduction = armorDR * 100;
  stats.effectiveHealth = (stats.totalHealth / (1 - armorDR)) + stats.totalShield;

  return stats;
}

function StatRow({ label, value, highlighted }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={highlighted ? "text-sm font-bold text-cyan-400" : "text-sm font-mono"}>
        {value}
      </span>
    </div>
  );
}

export default function CompanionBuilderPage() {
  const allCompanions = useCompanions();
  const allWeapons = useWeapons();
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [equippedMods, setEquippedMods] = useState<EquippedMod[]>([]);
  const [modPickerOpen, setModPickerOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [companionSearch, setCompanionSearch] = useState("");
  const [companionType, setCompanionType] = useState("all");
  const [showCompanionList, setShowCompanionList] = useState(true);
  const [hasReactor, setHasReactor] = useState(false);
  const [isMR30, setIsMR30] = useState(false);
  const [slotPolarities, setSlotPolarities] = useState<Record<number, string>>({});
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => getSavedBuilds("companion"));
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildIsPublic, setBuildIsPublic] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  // Weapon state
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [weaponMods, setWeaponMods] = useState<EquippedMod[]>([]);
  const [activeWeaponSlotIndex, setActiveWeaponSlotIndex] = useState(0);
  const [hasCatalyst, setHasCatalyst] = useState(false);
  const [modPickerTarget, setModPickerTarget] = useState<"companion" | "weapon">("companion");
  const [weaponRivenStatsMap, setWeaponRivenStatsMap] = useState<Record<number, Record<string, number>>>();

  const handleSaveBuildConfirm = useCallback(async ({ name, description, isPublic }: SaveBuildDialogValues) => {
    if (!selectedCompanion) return;
    const data: CompanionBuildData = {
      companionId: selectedCompanion.id,
      mods: equippedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      weaponMods: weaponMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      arcaneIds: [],
      hasReactor,
      isMR30,
      slotPolarities,
    };
    const build: SavedBuild = {
      id: currentBuildId || generateBuildId(),
      name,
      description,
      isPublic,
      type: "companion",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data,
    };
    saveBuild(build);
    setCurrentBuildId(build.id);
    setBuildName(name);
    setBuildDescription(description);
    setBuildIsPublic(isPublic);
    setSavedBuilds(getSavedBuilds("companion"));

    const cloudResult = await saveCloudBuild(build);
    if (cloudResult) {
      setCurrentBuildId(cloudResult.id);
      setBuildIsPublic(cloudResult.isPublic ?? isPublic);
      toast.success("Build saved", { description: `${name} saved to your account` });
    } else {
      toast.success("Build saved locally", { description: "Log in to sync builds to your account" });
    }
  }, [selectedCompanion, equippedMods, weaponMods, hasReactor, isMR30, slotPolarities, currentBuildId]);

  const handleLoadBuild = useCallback((build: SavedBuild) => {
    const d = build.data as CompanionBuildData;
    const comp = allCompanions.find((c) => c.id === d.companionId);
    if (!comp) { toast.error("Companion not found"); return; }
    setSelectedCompanion(comp);
    setEquippedMods(d.mods.map((m) => {
      const mod = modsMap.get(m.modId);
      return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain };
    }));
    setWeaponMods((d.weaponMods || []).map((m) => {
      const mod = modsMap.get(m.modId);
      return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain };
    }));
    setHasReactor(d.hasReactor);
    setIsMR30(d.isMR30);
    setSlotPolarities(d.slotPolarities || {});
    setCurrentBuildId(build.id);
    setBuildName(build.name);
    setBuildDescription(build.description || "");
    setBuildIsPublic(build.isPublic ?? false);
    setShowSavedBuilds(false);
    setShowCompanionList(false);
    toast.info("Build loaded", { description: build.name });
  }, [allCompanions]);

  useCloudBuildFromUrl("companion", handleLoadBuild);

  const handleDeleteBuild = useCallback((id: string) => {
    deleteBuild(id);
    setSavedBuilds(getSavedBuilds("companion"));
    if (currentBuildId === id) setCurrentBuildId(null);
    toast.success("Build deleted");
  }, [currentBuildId]);

  const filteredCompanions = useMemo(() => {
    let comps = [...allCompanions];
    if (companionType !== "all") {
      comps = comps.filter((c) => c.type === companionType);
    }
    if (companionSearch.trim()) {
      const q = companionSearch.toLowerCase();
      comps = comps.filter((c) => c.name.toLowerCase().includes(q));
    }
    return comps.sort((a, b) => a.name.localeCompare(b.name));
  }, [allCompanions, companionType, companionSearch]);

  const calculatedStats = useMemo<CompanionCalculatedStats | null>(() => {
    if (!selectedCompanion) return null;
    return calculateCompanionStats(selectedCompanion, equippedMods);
  }, [selectedCompanion, equippedMods]);

  const baseCapacity = (hasReactor ? 60 : 30) + (isMR30 ? 10 : 0);
  const capacityUsed = useMemo(() => {
    return equippedMods.reduce((sum, m) => {
      const mod = modsMap.get(m.modId);
      if (!mod) return sum;
      const baseDrain = mod.drain + m.rank;
      const slotPol = slotPolarities[m.slotIndex];
      return sum + modSlotCapacityCost(baseDrain, slotPol, mod.polarity);
    }, 0);
  }, [equippedMods, slotPolarities]);

  // Filter mods by companion type subcategory
  const companionMods = useMemo(() => {
    if (!selectedCompanion) return allMods.filter((m) => m.category === "companion");
    const subCats = getCompanionModSubCategory(selectedCompanion.type);
    return allMods.filter((m) =>
      m.category === "companion" && (
        !m.subCategory || subCats.includes(m.subCategory)
      )
    );
  }, [selectedCompanion]);

  const availableWeapons = useMemo(() => {
    if (!selectedCompanion) return [];
    return getCompanionWeapons(selectedCompanion, allWeapons);
  }, [selectedCompanion, allWeapons]);

  const weaponStats = useMemo(() => {
    if (!selectedWeapon) return null;
    // Gather riven stats from any weapon slot that has a riven
    let rivenStats: Record<string, number> | null = null;
    if (weaponRivenStatsMap) {
      for (const [slotStr, stats] of Object.entries(weaponRivenStatsMap)) {
        const slotIdx = Number(slotStr);
        const equipped = weaponMods.find((m) => m.slotIndex === slotIdx);
        if (equipped && equipped.modId.startsWith("riven_")) {
          rivenStats = rivenStats || {};
          for (const [k, v] of Object.entries(stats)) rivenStats[k] = (rivenStats[k] ?? 0) + v;
        }
      }
    }
    return calculateWeaponStats(selectedWeapon, weaponMods, rivenStats);
  }, [selectedWeapon, weaponMods, weaponRivenStatsMap]);

  const weaponCapacity = hasCatalyst ? 60 : 30;
  const weaponCapacityUsed = useMemo(() => {
    return weaponMods.reduce((sum, m) => {
      const mod = modsMap.get(m.modId);
      if (!mod) return sum;
      return sum + mod.drain + m.rank;
    }, 0);
  }, [weaponMods]);

  const weaponModPool = useMemo(() => {
    if (!selectedWeapon) return [];
    const cat = selectedWeapon.category;
    if (cat === "sentinel_weapon") {
      // Sentinel weapons use robotic weapon mods only
      return allMods.filter((m) =>
        m.category === "companion_weapon" ||
        (m.category === "companion" && (m.subCategory === "robotic" || m.subCategory === "universal"))
      );
    }
    if (cat === "beast_claw") {
      // Beast claws use companion weapon mods only (Bite, Maul, etc.) — NOT regular melee mods like Blood Rush
      return allMods.filter((m) =>
        m.category === "companion_weapon" ||
        (m.category === "companion" && (m.subCategory === "beast" || m.subCategory === "universal"))
      );
    }
    if (cat === "hound_weapon") {
      // Hound weapons use robotic weapon mods
      return allMods.filter((m) =>
        m.category === "companion_weapon" ||
        (m.category === "companion" && (m.subCategory === "robotic" || m.subCategory === "universal"))
      );
    }
    return allMods.filter((m) => m.category === "companion_weapon");
  }, [selectedWeapon]);

  const handleSelectCompanion = useCallback((companion: Companion) => {
    setSelectedCompanion(companion);
    setEquippedMods([]);
    setHasReactor(false);
    setSelectedWeapon(null);
    setWeaponMods([]);
    setHasCatalyst(false);
    setWeaponRivenStatsMap(undefined);
    setSlotPolarities({});
    setCurrentBuildId(null);
    setBuildName(`${companion.name} Build`);
    setBuildDescription("");
    setShowCompanionList(false);
  }, []);

  const handleOpenModPicker = useCallback((slotIndex: number) => {
    setActiveSlotIndex(slotIndex);
    setModPickerTarget("companion");
    setModPickerOpen(true);
  }, []);

  const handleOpenWeaponModPicker = useCallback((slotIndex: number) => {
    setActiveWeaponSlotIndex(slotIndex);
    setModPickerTarget("weapon");
    setModPickerOpen(true);
  }, []);

  const handleSelectMod = useCallback((mod: Mod, rank: number) => {
    if (modPickerTarget === "weapon") {
      setWeaponMods((prev) => {
        const filtered = prev.filter((m) => m.slotIndex !== activeWeaponSlotIndex);
        return [
          ...filtered,
          { modId: mod.id, modName: mod.name, rank, slotIndex: activeWeaponSlotIndex, polarity: mod.polarity, drain: mod.drain },
        ];
      });
    } else {
      setEquippedMods((prev) => {
        const filtered = prev.filter((m) => m.slotIndex !== activeSlotIndex);
        return [
          ...filtered,
          { modId: mod.id, modName: mod.name, rank, slotIndex: activeSlotIndex, polarity: mod.polarity, drain: mod.drain },
        ];
      });
    }
  }, [activeSlotIndex, activeWeaponSlotIndex, modPickerTarget]);

  const handleRemoveMod = useCallback((slotIndex: number) => {
    setEquippedMods((prev) => prev.filter((m) => m.slotIndex !== slotIndex));
  }, []);

  const handleRemoveWeaponMod = useCallback((slotIndex: number) => {
    setWeaponMods((prev) => prev.filter((m) => m.slotIndex !== slotIndex));
    setWeaponRivenStatsMap((prev) => { if (!prev) return prev; const n = { ...prev }; delete n[slotIndex]; return n; });
  }, []);

  const handleSelectWeaponRiven = useCallback((mod: Mod, stats: Record<string, number>) => {
    setWeaponMods((prev) => {
      const filtered = prev.filter((m) => m.slotIndex !== activeWeaponSlotIndex);
      return [
        ...filtered,
        { modId: mod.id, modName: mod.name, rank: 0, slotIndex: activeWeaponSlotIndex, polarity: mod.polarity, drain: mod.drain },
      ];
    });
    setWeaponRivenStatsMap((prev) => ({ ...(prev || {}), [activeWeaponSlotIndex]: stats }));
  }, [activeWeaponSlotIndex]);

  const equippedModIds = modPickerTarget === "weapon"
    ? weaponMods.map((m) => m.modId)
    : equippedMods.map((m) => m.modId);

  return (
    <PageShell>

      <main className="flex-1 container mx-auto px-4 py-6">
        {showCompanionList || !selectedCompanion ? (
          <ItemPickerScreen
            icon={Dog}
            accent="cyan"
            title="Companion Builder"
            description="Choose a sentinel, kubrow, kavat, MOA, or other companion to configure."
            count={filteredCompanions.length}
            search={companionSearch}
            onSearchChange={setCompanionSearch}
            searchPlaceholder="Search companions..."
            filters={Object.entries(companionTypeLabels).map(([key, label]) => (
              <ItemPickerFilter
                key={key}
                active={companionType === key}
                onClick={() => setCompanionType(key)}
              >
                {label}
              </ItemPickerFilter>
            ))}
          >
            {filteredCompanions.map((comp) => (
              <ItemPickerRow
                key={comp.id}
                accent="cyan"
                onClick={() => handleSelectCompanion(comp)}
                image={
                  <GameAssetImage
                    src={getCompanionImage(comp.name)}
                    alt=""
                    width={40}
                    height={40}
                    className="h-9 w-9 object-contain"
                    hideOnError
                  />
                }
                title={
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-cyan-400">{getCompanionIcon(comp.type)}</span>
                    {comp.name}
                  </span>
                }
                badge={<span className="text-xs capitalize text-muted-foreground">{comp.type}</span>}
                meta={
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>HP {comp.health}</span>
                    <span>SH {comp.shield}</span>
                    <span>AR {comp.armor}</span>
                  </div>
                }
              >
                {comp.description && (
                  <p className="mt-1 truncate text-xs text-muted-foreground/70">{comp.description}</p>
                )}
              </ItemPickerRow>
            ))}
          </ItemPickerScreen>
        ) : (
          <div>
            <BuilderItemHeader
              onChange={() => setShowCompanionList(true)}
              image={
                <GameAssetImage
                  src={getCompanionImage(selectedCompanion.name)}
                  alt=""
                  width={40}
                  height={40}
                  className="hidden h-10 w-10 rounded-lg object-contain sm:block"
                  hideOnError
                />
              }
              title={selectedCompanion.name}
              subtitle={selectedCompanion.type}
            >
              <BuilderActionBar>
                <BuilderActionGroup>
                  <button
                    onClick={() => setSaveDialogOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-all font-medium"
                    title="Save Build"
                  >
                    <Save className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Save</span>
                  </button>
                  <button onClick={() => { setSavedBuilds(getSavedBuilds("companion")); setShowSavedBuilds(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-all font-medium" title="Load Build">
                    <FolderOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Load</span>
                  </button>
                </BuilderActionGroup>

                <BuilderActionGroup>
                  <button
                    onClick={() => setIsMR30(!isMR30)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                      isMR30
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Star className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">MR 30+</span>
                  </button>
                  <button
                    onClick={() => setHasReactor(!hasReactor)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                      hasReactor
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reactor</span>
                  </button>
                </BuilderActionGroup>

                <div className="flex-1" />

                <a
                  href={`/report-issue?type=companion&name=${encodeURIComponent(selectedCompanion.name)}&id=${encodeURIComponent(selectedCompanion.id)}`}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-400/70 transition-colors hover:bg-amber-500/5 hover:text-amber-400"
                >
                  <Flag className="h-3 w-3" /> <span className="hidden sm:inline">Report</span>
                </a>
              </BuilderActionBar>
            </BuilderItemHeader>

            <div className="mb-6">
              <textarea
                value={buildDescription}
                onChange={(e) => setBuildDescription(e.target.value)}
                placeholder="Write a description for this build... (e.g. mechanics, synergies, how to play)"
                className="w-full h-24 p-3 bg-card border border-border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/60 shadow-sm"
              />
            </div>

            {selectedCompanion.precept && (
              <div className="mb-4 p-3 border border-cyan-500/20 rounded-lg bg-cyan-500/5">
                <span className="text-[10px] font-semibold text-cyan-400 tracking-wider">PRECEPT</span>
                <p className="text-sm text-muted-foreground mt-1">{selectedCompanion.precept}</p>
              </div>
            )}

            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">
                    MOD CONFIGURATION
                  </h2>
                  <span className={cn(
                    "text-xs font-mono",
                    capacityUsed > baseCapacity ? "text-red-400" : "text-muted-foreground"
                  )}>
                    {capacityUsed} / {baseCapacity}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => {
                    const equipped = equippedMods.find((m) => m.slotIndex === i);
                    const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                    return (
                      <ModSlotCard
                        key={i}
                        mod={mod}
                        rank={equipped?.rank ?? 0}
                        slotIndex={i}
                        slotPolarity={slotPolarities[i]}
                        onAdd={() => handleOpenModPicker(i)}
                        onRemove={() => handleRemoveMod(i)}
                        onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[i] = p; else delete next[i]; return next; })}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="border border-border rounded-xl p-6 bg-card">
                  <h3 className="text-sm font-semibold tracking-wider text-muted-foreground mb-4">COMPANION STATS</h3>
                  {calculatedStats ? (
                    <div className="space-y-0.5">
                      <StatRow label="Health" value={calculatedStats.totalHealth.toFixed(0)} />
                      <StatRow label="Shield" value={calculatedStats.totalShield.toFixed(0)} />
                      <StatRow label="Armor" value={calculatedStats.totalArmor.toFixed(0)} />
                      <div className="border-t border-border my-2" />
                      <StatRow label="Melee Dmg" value={`+${(calculatedStats.meleeDamageBonus * 100).toFixed(0)}%`} />
                      <StatRow label="Atk Speed" value={`+${(calculatedStats.attackSpeedBonus * 100).toFixed(0)}%`} />
                      <StatRow label="Crit Chance" value={`+${(calculatedStats.critChanceBonus * 100).toFixed(0)}%`} />
                      <StatRow label="Crit Dmg" value={`+${(calculatedStats.critDamageBonus * 100).toFixed(0)}%`} />
                      <div className="border-t border-border my-2" />
                      <StatRow label="Effective HP" value={calculatedStats.effectiveHealth.toFixed(0)} highlighted />
                      <StatRow label="Dmg Reduction" value={`${calculatedStats.damageReduction.toFixed(1)}%`} highlighted />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a companion to see stats</p>
                  )}
                </div>
              </div>

              {/* COMPANION WEAPON SECTION */}
              <div className="mt-8 border-t border-border pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Swords className="h-5 w-5 text-orange-400" />
                  <h2 className="text-lg font-bold">Companion Weapon</h2>
                  {selectedWeapon && (
                    <button
                      onClick={() => setHasCatalyst(!hasCatalyst)}
                      className={cn(
                        "ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all",
                        hasCatalyst
                          ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {hasCatalyst ? "Catalyst Installed" : "Orokin Catalyst"}
                    </button>
                  )}
                </div>

                {/* Weapon Selector */}
                {!selectedWeapon ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableWeapons.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No weapons available for this companion type</p>
                    ) : (
                      availableWeapons.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => { setSelectedWeapon(w); setWeaponMods([]); setHasCatalyst(false); }}
                          className="w-full text-left p-2.5 rounded-lg border border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{w.name}</span>
                            <span className="text-[10px] text-muted-foreground capitalize">{w.category.replace('_', ' ')}</span>
                          </div>
                          <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                            <span>DMG {w.damage}</span>
                            <span>CC {(w.criticalChance * 100).toFixed(0)}%</span>
                            <span>CD {w.criticalMultiplier.toFixed(1)}x</span>
                            <span>SC {(w.statusChance * 100).toFixed(0)}%</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4 p-3 border border-orange-500/30 bg-orange-500/5 rounded-lg">
                      <Crosshair className="h-4 w-4 text-orange-400" />
                      <span className="font-medium text-sm">{selectedWeapon.name}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{selectedWeapon.category.replace('_', ' ')}</span>
                      <button onClick={() => { setSelectedWeapon(null); setWeaponMods([]); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Change</button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground">WEAPON MODS</h3>
                          <span className={cn(
                            "text-xs font-mono",
                            weaponCapacityUsed > weaponCapacity ? "text-red-400" : "text-muted-foreground"
                          )}>
                            {weaponCapacityUsed} / {weaponCapacity}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 8 }, (_, i) => {
                            const equipped = weaponMods.find((m) => m.slotIndex === i);
                            const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                            return (
                              <ModSlotCard
                                key={`w${i}`}
                                mod={mod}
                                rank={equipped?.rank ?? 0}
                                slotIndex={i}
                                onAdd={() => handleOpenWeaponModPicker(i)}
                                onRemove={() => handleRemoveWeaponMod(i)}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="border border-border rounded-xl p-6 bg-card">
                        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground mb-4">WEAPON STATS</h3>
                        {weaponStats ? (
                          <div className="space-y-0.5">
                            <StatRow label="Total Damage" value={weaponStats.totalDamage.toFixed(1)} />
                            <StatRow label="Avg Hit" value={weaponStats.avgHit.toFixed(1)} />
                            <StatRow label="Crit Chance" value={`${(weaponStats.critChance * 100).toFixed(1)}%`} />
                            <StatRow label="Crit Multi" value={`${weaponStats.critMultiplier.toFixed(1)}x`} />
                            <StatRow label="Status" value={`${(weaponStats.statusChance * 100).toFixed(1)}%`} />
                            <StatRow label="Fire Rate" value={weaponStats.fireRate.toFixed(2)} />
                            <StatRow label="Multishot" value={weaponStats.multishot.toFixed(1)} />
                            <StatRow label="Magazine" value={`${weaponStats.magazine}`} />
                            <StatRow label="Reload" value={`${weaponStats.reloadTime.toFixed(2)}s`} />
                            <div className="border-t border-border my-2" />
                            <StatRow label="DPS" value={weaponStats.dps.toFixed(0)} highlighted />
                            {weaponStats.damagePerStatusBonus > 0 && (
                              <StatRow label="Dmg / status on target" value={`+${(weaponStats.damagePerStatusBonus * 100).toFixed(0)}%`} />
                            )}
                            {weaponStats.nonCritDamageBonus > 0 && (
                              <StatRow label="Non-crit damage" value={`+${(weaponStats.nonCritDamageBonus * 100).toFixed(0)}%`} />
                            )}
                            {weaponStats.healthPerSlashStack > 0 && (
                              <StatRow label="Lifesteal / Slash stack" value={`${weaponStats.healthPerSlashStack.toFixed(0)} HP`} />
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Select a weapon to see stats</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <ModPicker
        open={modPickerOpen}
        onClose={() => setModPickerOpen(false)}
        mods={modPickerTarget === "weapon" ? weaponModPool : companionMods}
        category="_prefiltered"
        equippedModIds={equippedModIds}
        onSelect={handleSelectMod}
        onSelectRiven={modPickerTarget === "weapon" ? handleSelectWeaponRiven : undefined}
        weaponCategory={selectedWeapon?.category}
      />

      {/* Saved Builds Dialog */}
      <Dialog open={showSavedBuilds} onOpenChange={setShowSavedBuilds}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle>Saved Companion Builds</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {savedBuilds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No saved builds yet.</p>
            ) : (
              <div className="space-y-2">
                {savedBuilds.map((build) => {
                  const d = build.data as CompanionBuildData;
                  const comp = allCompanions.find((c) => c.id === d.companionId);
                  return (
                    <div key={build.id} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-green-500/30 transition-all">
                      <button onClick={() => handleLoadBuild(build)} className="flex-1 text-left">
                        <span className="text-sm font-medium">{build.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {comp?.name ?? d.companionId} • {d.mods.length} mods • {new Date(build.updatedAt).toLocaleDateString()}
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

      <SaveBuildDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        defaultName={buildName || (selectedCompanion ? `${selectedCompanion.name} Build` : "Companion Build")}
        defaultDescription={buildDescription}
        defaultIsPublic={buildIsPublic}
        onSave={handleSaveBuildConfirm}
      />
    </PageShell>
  );
}
