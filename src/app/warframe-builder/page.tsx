"use client";

import { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/header";
import { ModSlotCard } from "@/components/mod-slot";
import { WarframeStatsPanel } from "@/components/stats-panel";
import { ModPicker, SlotType } from "@/components/mod-picker";
import { allWarframes } from "@/data/warframes";
import { allMods, modsMap } from "@/data/mods";
import { allArchonShards } from "@/data/archon-shards";
import { calculateWarframeBuild, calculateWeaponBuild, applyArcaneToWarframe } from "@/lib/calculator";
import { modSlotCapacityCost } from "@/lib/mod-capacity";
import { Warframe, Mod, Ability, Weapon, WarframeCalculatedStats, CalculatedStats, EquippedMod, EquippedArchonShard } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Diamond, Zap, Flag, RefreshCw, Gem, Crosshair, Star, Save, FolderOpen, Trash2, Share2, Check, Upload } from "lucide-react";
import { useWeapons } from "@/lib/use-data";
import { warframeArcanes } from "@/data/arcanes";
import { ArcaneSlotCard, ArcanePicker } from "@/components/arcane-picker";
import { allHelminthAbilities, HelminthAbility } from "@/data/helminth";
import { cn } from "@/lib/utils";
import { formatAbilityDescription } from "@/lib/ability-text";
import { getSavedBuilds, saveBuild, deleteBuild, generateBuildId, SavedBuild, WarframeBuildData, saveCloudBuild, resolveSavedArcaneSlots } from "@/lib/build-storage";
import { buildShareUrl, ShareableBuild } from "@/lib/build-url";
import { toast } from "sonner";
import { getWarframeImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";
import { BuildImporter } from "@/components/build-importer";

const shardColors: Record<string, string> = {
  crimson: "#E74C3C",
  azure: "#3498DB",
  amber: "#F39C12",
  violet: "#9B59B6",
  topaz: "#E67E22",
  emerald: "#2ECC71",
};

const bonusLabels: Record<string, string> = {
  // Crimson
  abilityStrength: "Ability Strength",
  abilityDuration: "Ability Duration",
  meleeCritDamage: "Melee Crit Damage",
  primaryStatusChance: "Primary Status Chance",
  secondaryCritChance: "Secondary Crit Chance",
  // Azure
  health: "Health",
  shield: "Shield Capacity",
  energyMax: "Max Energy",
  armor: "Armor",
  healthRegen: "Health Regen",
  // Amber
  castingSpeed: "Casting Speed",
  parkourVelocity: "Parkour Velocity",
  startingEnergy: "Starting Energy",
  healthOrbEffectiveness: "Health Orb Effectiveness",
  energyOrbEffectiveness: "Energy Orb Effectiveness",
  // Violet
  abilityDamageElectricity: "Ability Dmg vs Electricity",
  primaryElectricityDamage: "Primary Electricity Damage",
  meleeCritDamageEnergy: "Melee Crit Dmg (Energy>500: 2x)",
  orbConversion: "Orb Conversion (Equilibrium)",
  // Topaz
  blastKillHealth: "Health per Blast Kill",
  blastKillShields: "Shields on Blast Kill",
  heatKillSecondaryCrit: "Sec. Crit/Heat Kill",
  abilityDamageRadiation: "Ability Dmg vs Radiation",
  // Emerald
  toxinStatusDamage: "Toxin Status Damage",
  toxinHealthRecovery: "Health per Toxin Tick",
  abilityDamageCorrosion: "Ability Dmg vs Corrosion",
  corrosionMaxStacks: "Max Corrosion Stacks",
};

const FLAT_SHARD_KEYS = new Set([
  "health", "shield", "energyMax", "armor", "healthRegen",
  "blastKillHealth", "blastKillShields", "toxinHealthRecovery",
  "corrosionMaxStacks", "heatKillSecondaryCrit",
]);

function formatBonusValue(key: string, value: number): string {
  if (FLAT_SHARD_KEYS.has(key)) {
    const dec = value % 1 !== 0 ? 1 : 0;
    if (key === "healthRegen") return `${value > 0 ? "+" : ""}${value.toFixed(dec)}/s`;
    if (key === "heatKillSecondaryCrit") return `${value > 0 ? "+" : ""}${value.toFixed(dec)}%/kill`;
    return `${value > 0 ? "+" : ""}${value.toFixed(dec)}`;
  }
  const dec = value % 1 !== 0 ? 1 : 0;
  return `${value > 0 ? "+" : ""}${value.toFixed(dec)}%`;
}

// Slot layout: 0=Aura, 1-8=Regular, 9=Exilus
const AURA_SLOT = 0;
const EXILUS_SLOT = 9;

function getSlotType(index: number): SlotType {
  if (index === AURA_SLOT) return "aura";
  if (index === EXILUS_SLOT) return "exilus";
  return "regular";
}

// Ability stat row with base → modified display
function AbilityStatRow({ label, baseValue, modifiedValue, unit, isModified, isPositive }: {
  label: string;
  baseValue: string;
  modifiedValue: string;
  unit?: string;
  isModified: boolean;
  isPositive: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <span className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</span>
      {isModified ? (
        <>
          <span className="text-[11px] text-muted-foreground/50 line-through">{baseValue}{unit}</span>
          <span className="text-[11px] mx-0.5 text-muted-foreground">→</span>
          <span className={cn("text-[11px] font-bold", isPositive ? "text-green-400" : "text-red-400")}>
            {modifiedValue}{unit}
          </span>
        </>
      ) : (
        <span className="text-[11px]">{modifiedValue}{unit}</span>
      )}
    </div>
  );
}

// Full ability card with all stats
function AbilityCard({ ability, index, stats }: {
  ability: Ability;
  index: number;
  stats: WarframeCalculatedStats | null;
}) {
  const str = stats?.abilityStrength ?? 1;
  const dur = stats?.abilityDuration ?? 1;
  const rng = stats?.abilityRange ?? 1;
  const eff = stats?.abilityEfficiency ?? 1;

  // Energy cost: cost = baseCost × (2 - efficiency), capped at 175% eff (min 25% cost)
  const clampedEff = Math.min(Math.max(eff, 0), 1.75);
  const effectiveCost = Math.max(ability.energyCost * 0.25, ability.energyCost * (2 - clampedEff));
  const costModified = Math.abs(effectiveCost - ability.energyCost) > 0.5;

  const miscKeys = ability.miscStats ? Object.keys(ability.miscStats) : [];
  const hasAnyStats =
    (ability.damage != null && ability.damage > 0) ||
    (ability.directDamage != null && ability.directDamage > 0) ||
    (ability.aoeDamage != null && ability.aoeDamage > 0) ||
    (ability.damagePerSecond != null && ability.damagePerSecond > 0) ||
    ability.range != null ||
    ability.duration != null ||
    ability.radius != null ||
    (ability.health != null && ability.health > 0) ||
    (ability.armor != null && ability.armor > 0) ||
    (ability.shield != null && ability.shield > 0) ||
    (ability.damageReduction != null && ability.damageReduction > 0) ||
    (ability.damageBuff != null && ability.damageBuff > 0) ||
    ability.statusChance != null ||
    (ability.castTime != null && ability.castTime > 0) ||
    (ability.cooldown != null && ability.cooldown > 0) ||
    (ability.subAbilities != null && ability.subAbilities.length > 0) ||
    ability.chainRange != null ||
    ability.chainLinks != null ||
    ability.maxTargets != null ||
    miscKeys.length > 0;

  const fmtMiscVal = (v: unknown): string => {
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(2);
    return String(v);
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground w-5 h-5 rounded bg-secondary flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-semibold">{ability.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-blue-400" />
          <span className={cn("text-xs font-mono", costModified ? "text-green-400 font-bold" : "text-blue-400")}>
            {costModified ? `${effectiveCost.toFixed(0)}` : ability.energyCost}
          </span>
          {costModified && (
            <span className="text-[10px] text-muted-foreground/50 line-through">{ability.energyCost}</span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
        {formatAbilityDescription(ability.description)}
      </p>

      {ability.subAbilities != null && ability.subAbilities.length > 0 && (
        <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-1 mb-2 leading-relaxed">
          {ability.subAbilities.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {ability.damageType && (
        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
          {ability.damageType}
        </span>
      )}

      {(ability.chainRange != null || ability.chainLinks != null || ability.maxTargets != null) && (
        <div className="flex flex-wrap gap-2 mb-2 text-[10px] text-muted-foreground">
          {ability.chainRange != null && ability.chainRange > 0 && (
            <span title="Chain range (scaled by Range)">
              Chain range: <span className="font-mono text-foreground">{(ability.chainRange * rng).toFixed(1)}m</span>
            </span>
          )}
          {ability.chainLinks != null && ability.chainLinks > 0 && (
            <span>
              Chain links: <span className="font-mono text-foreground">{ability.chainLinks}</span>
            </span>
          )}
          {ability.maxTargets != null && ability.maxTargets > 0 && (
            <span>
              Max targets: <span className="font-mono text-foreground">{ability.maxTargets}</span>
            </span>
          )}
        </div>
      )}

      {hasAnyStats && (
        <div className="border-t border-border pt-2 mt-1 space-y-0">
          {ability.damage != null && ability.damage > 0 && (
            <AbilityStatRow
              label="Damage"
              baseValue={ability.damage.toFixed(0)}
              modifiedValue={(ability.damage * str).toFixed(0)}
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.damagePerSecond != null && ability.damagePerSecond > 0 && (
            <AbilityStatRow
              label="Damage/s"
              baseValue={ability.damagePerSecond.toFixed(0)}
              modifiedValue={(ability.damagePerSecond * str).toFixed(0)}
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.directDamage != null && ability.directDamage > 0 && (
            <AbilityStatRow
              label="Direct dmg"
              baseValue={ability.directDamage.toFixed(0)}
              modifiedValue={(ability.directDamage * str).toFixed(0)}
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.aoeDamage != null && ability.aoeDamage > 0 && (
            <AbilityStatRow
              label="AoE dmg"
              baseValue={ability.aoeDamage.toFixed(0)}
              modifiedValue={(ability.aoeDamage * str).toFixed(0)}
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.range != null && (
            <AbilityStatRow
              label="Range"
              baseValue={ability.range.toFixed(1)}
              modifiedValue={(ability.range * rng).toFixed(1)}
              unit="m"
              isModified={rng !== 1}
              isPositive={rng > 1}
            />
          )}
          {ability.duration != null && (
            <AbilityStatRow
              label="Duration"
              baseValue={ability.duration.toFixed(1)}
              modifiedValue={(ability.duration * dur).toFixed(1)}
              unit="s"
              isModified={dur !== 1}
              isPositive={dur > 1}
            />
          )}
          {ability.radius != null && (
            <AbilityStatRow
              label="Radius"
              baseValue={ability.radius.toFixed(1)}
              modifiedValue={(ability.radius * rng).toFixed(1)}
              unit="m"
              isModified={rng !== 1}
              isPositive={rng > 1}
            />
          )}
          {ability.health != null && ability.health > 0 && (
            <AbilityStatRow
              label="Health"
              baseValue={ability.health.toFixed(0)}
              modifiedValue={(ability.health * str).toFixed(0)}
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.armor != null && ability.armor > 0 && (
            <AbilityStatRow
              label="Armor"
              baseValue={ability.armor.toFixed(0)}
              modifiedValue={(ability.armor * str).toFixed(0)}
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.shield != null && ability.shield > 0 && (
            <AbilityStatRow
              label="Shield"
              baseValue={ability.shield.toFixed(0)}
              modifiedValue={(ability.shield * str).toFixed(0)}
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.damageReduction != null && ability.damageReduction > 0 && (
            <AbilityStatRow
              label="Dmg Reduction"
              baseValue={ability.damageReduction.toFixed(0)}
              modifiedValue={(ability.damageReduction * str).toFixed(0)}
              unit="%"
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.damageBuff != null && ability.damageBuff > 0 && (
            <AbilityStatRow
              label="Dmg Buff"
              baseValue={ability.damageBuff.toFixed(0)}
              modifiedValue={(ability.damageBuff * str).toFixed(0)}
              unit="%"
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.statusChance != null && ability.statusChance > 0 && (
            <AbilityStatRow
              label="Status"
              baseValue={(ability.statusChance * 100).toFixed(0)}
              modifiedValue={(ability.statusChance * str * 100).toFixed(0)}
              unit="%"
              isModified={str !== 1}
              isPositive={str > 1}
            />
          )}
          {ability.castTime != null && ability.castTime > 0 && (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="text-[11px] text-muted-foreground w-20 shrink-0">Cast Time</span>
              <span className="text-[11px]">{ability.castTime.toFixed(1)}s</span>
            </div>
          )}
          {ability.cooldown != null && ability.cooldown > 0 && (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="text-[11px] text-muted-foreground w-20 shrink-0">Cooldown</span>
              <span className="text-[11px]">{ability.cooldown.toFixed(1)}s</span>
            </div>
          )}
          {miscKeys.length > 0 && (
            <div className="pt-1 mt-1 border-t border-border/40 space-y-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wide">OTHER</span>
              {miscKeys.map((k) => (
                <div key={k} className="flex items-baseline gap-1.5 py-0.5">
                  <span className="text-[11px] text-muted-foreground w-24 shrink-0 leading-tight">{k}</span>
                  <span className="text-[11px] font-mono text-foreground">{fmtMiscVal(ability.miscStats![k])}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WarframeBuilderPage() {
  const [selectedWarframe, setSelectedWarframe] = useState<Warframe | null>(null);
  const [equippedMods, setEquippedMods] = useState<EquippedMod[]>([]);
  const [equippedShards, setEquippedShards] = useState<(EquippedArchonShard | null)[]>([null, null, null, null, null]);
  const [modPickerOpen, setModPickerOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [activeSlotType, setActiveSlotType] = useState<SlotType>("regular");
  const [warframeSearch, setWarframeSearch] = useState("");
  const [showWarframeList, setShowWarframeList] = useState(true);
  const [shardPickerOpen, setShardPickerOpen] = useState(false);
  const [activeShardSlot, setActiveShardSlot] = useState(0);
  const [selectedShardForBonus, setSelectedShardForBonus] = useState<typeof allArchonShards[0] | null>(null);
  const [hasOrokinReactor, setHasOrokinReactor] = useState(false);
  const [isMR30, setIsMR30] = useState(false);
  const [helminthSlot, setHelminthSlot] = useState<number | null>(null); // which ability slot (0-3) is replaced
  const [helminthAbility, setHelminthAbility] = useState<HelminthAbility | null>(null);
  const [helminthPickerOpen, setHelminthPickerOpen] = useState(false);
  const [helminthPickerSlot, setHelminthPickerSlot] = useState(0);
  const [helminthSearch, setHelminthSearch] = useState("");
  const [equippedArcanes, setEquippedArcanes] = useState<(Mod | null)[]>([null, null]);
  const [arcanePickerOpen, setArcanePickerOpen] = useState(false);
  const [activeArcaneSlot, setActiveArcaneSlot] = useState(0);
  const [exaltedMods, setExaltedMods] = useState<EquippedMod[]>([]);
  const [exaltedModPickerOpen, setExaltedModPickerOpen] = useState(false);
  const [exaltedActiveSlot, setExaltedActiveSlot] = useState(0);
  const [exaltedSlotPolarities, setExaltedSlotPolarities] = useState<Record<number, string>>({});
  const [slotPolarities, setSlotPolarities] = useState<Record<number, string>>({});
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => getSavedBuilds("warframe"));
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("");
  const [buildDescription, setBuildDescription] = useState("");

  const handleSaveBuild = useCallback(async () => {
    if (!selectedWarframe) return;
    const data: WarframeBuildData = {
      warframeId: selectedWarframe.id,
      mods: equippedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      shards: equippedShards,
      arcaneIds: equippedArcanes.map((a) => a?.id ?? null),
      hasOrokinReactor: hasOrokinReactor,
      isMR30,
      slotPolarities,
      helminthSlot,
      helminthAbilityId: helminthAbility?.id ?? null,
      exaltedMods: exaltedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      exaltedSlotPolarities,
    };
    const build: SavedBuild = {
      id: currentBuildId || generateBuildId(),
      name: buildName || `${selectedWarframe.name} Build`,
      description: buildDescription || "",
      type: "warframe",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data,
    };
    saveBuild(build);
    setCurrentBuildId(build.id);
    setSavedBuilds(getSavedBuilds("warframe"));

    // Also save to cloud if logged in
    const cloudResult = await saveCloudBuild(build);
    if (cloudResult) {
      toast.success("Build saved", { description: `${build.name} saved to your account` });
    } else {
      toast.success("Build saved locally", { description: "Log in to sync builds to your account" });
    }
  }, [selectedWarframe, equippedMods, equippedShards, equippedArcanes, hasOrokinReactor, isMR30, slotPolarities, helminthSlot, helminthAbility, exaltedMods, exaltedSlotPolarities, buildName, buildDescription, currentBuildId]);

  const handleLoadBuild = useCallback((build: SavedBuild) => {
    const d = build.data as WarframeBuildData;
    const wf = allWarframes.find((w) => w.id === d.warframeId);
    if (!wf) { toast.error("Warframe not found"); return; }
    setSelectedWarframe(wf);
    setEquippedMods(d.mods.map((m) => {
      const mod = modsMap.get(m.modId);
      return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain };
    }));
    setEquippedShards(d.shards || [null, null, null, null, null]);
    setEquippedArcanes(resolveSavedArcaneSlots(d.arcaneIds, 2));
    setHasOrokinReactor(d.hasOrokinReactor);
    setIsMR30(d.isMR30);
    setSlotPolarities(d.slotPolarities || {});
    setExaltedMods((d.exaltedMods || []).map((m) => {
      const mod = modsMap.get(m.modId);
      return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain };
    }));
    setExaltedSlotPolarities(d.exaltedSlotPolarities || {});
    if (d.helminthSlot != null) {
      setHelminthSlot(d.helminthSlot);
      if (d.helminthAbilityId) {
        setHelminthAbility(allHelminthAbilities.find((a) => a.id === d.helminthAbilityId) ?? null);
      }
    } else {
      setHelminthSlot(null);
      setHelminthAbility(null);
    }
    setCurrentBuildId(build.id);
    setBuildName(build.name);
    setBuildDescription(build.description || "");
    setShowSavedBuilds(false);
    setShowWarframeList(false);
    toast.info("Build loaded", { description: build.name });
  }, []);

  const handleDeleteBuild = useCallback((id: string) => {
    deleteBuild(id);
    setSavedBuilds(getSavedBuilds("warframe"));
    if (currentBuildId === id) setCurrentBuildId(null);
    toast.success("Build deleted");
  }, [currentBuildId]);

  const allWeaponsData = useWeapons();

  // Find exalted weapon for selected warframe
  const exaltedWeapon = useMemo<Weapon | null>(() => {
    if (!selectedWarframe) return null;
    return allWeaponsData.find((w) => w.isExalted && w.warframeId === selectedWarframe.id) ?? null;
  }, [selectedWarframe, allWeaponsData]);

  const exaltedStats = useMemo<CalculatedStats | null>(() => {
    if (!exaltedWeapon) return null;
    const slots = exaltedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex }));
    return calculateWeaponBuild(exaltedWeapon, slots, modsMap);
  }, [exaltedWeapon, exaltedMods]);

  const exaltedCapacity = useMemo(() => {
    return exaltedMods.reduce((sum, m) => {
      const mod = modsMap.get(m.modId);
      if (!mod) return sum;
      const baseDrain = mod.drain + m.rank;
      const slotPol = exaltedSlotPolarities[m.slotIndex];
      return sum + modSlotCapacityCost(baseDrain, slotPol, mod.polarity);
    }, 0);
  }, [exaltedMods, exaltedSlotPolarities]);

  const filteredWarframes = useMemo(() => {
    const sorted = [...allWarframes]
      .filter((w) => w.id !== "helminth")
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!warframeSearch.trim()) return sorted;
    const q = warframeSearch.toLowerCase();
    return sorted.filter((w) => w.name.toLowerCase().includes(q));
  }, [warframeSearch]);

  const calculatedStats = useMemo<WarframeCalculatedStats | null>(() => {
    if (!selectedWarframe) return null;
    const modSlots = equippedMods.map((m) => ({
      modId: m.modId,
      rank: m.rank,
      slotIndex: m.slotIndex,
    }));
    const stats = calculateWarframeBuild(selectedWarframe, modSlots, modsMap);

    // Apply archon shard bonuses
    for (const shard of equippedShards) {
      if (!shard) continue;
      const bonusKey = shard.selectedBonus;
      const bonusValue = shard.bonusValue;
      switch (bonusKey) {
        // Flat bonuses (Azure health/shield/energy, Topaz armor)
        case "health":
          stats.flatHealthBonus += bonusValue;
          break;
        case "shield":
          stats.flatShieldBonus += bonusValue;
          break;
        case "armor":
          stats.flatArmorBonus += bonusValue;
          break;
        case "energyMax":
          stats.flatEnergyBonus += bonusValue;
          break;
        // Percentage bonuses (Crimson, Violet)
        case "abilityStrength":
          stats.abilityStrength += bonusValue / 100;
          break;
        case "abilityDuration":
          stats.abilityDuration += bonusValue / 100;
          break;
        case "abilityEfficiency":
          stats.abilityEfficiency += bonusValue / 100;
          break;
        case "abilityRange":
          stats.abilityRange += bonusValue / 100;
          break;
        // Amber
        case "sprintSpeed":
          stats.sprintSpeedBonus += bonusValue / 100;
          break;
        case "castingSpeed":
          stats.castingSpeedBonus += bonusValue;
          break;
        case "parkourVelocity":
          stats.parkourVelocityBonus += bonusValue;
          break;
        case "startingEnergy":
        case "healthOrbEffectiveness":
        case "energyOrbEffectiveness":
          break;
        // Azure
        case "healthRegen":
          stats.healthRegenPerSec += bonusValue;
          break;
        // Crimson weapon bonuses (display only on warframe, applied via weapon builder)
        case "meleeCritDamage":
        case "meleeCritDamageEnergy":
          stats.meleeCritDamageBonus += bonusValue;
          break;
        case "primaryStatusChance":
          stats.primaryShardBonus += bonusValue;
          break;
        case "secondaryCritChance":
          stats.secondaryShardBonus += bonusValue;
          break;
        // Violet
        case "abilityDamageElectricity":
        case "abilityDamageRadiation":
        case "abilityDamageCorrosion":
          break;
        case "primaryElectricityDamage":
        case "orbConversion":
          break;
        // Topaz (all conditional/on-kill)
        case "blastKillHealth":
        case "blastKillShields":
        case "heatKillSecondaryCrit":
          break;
        // Emerald (conditional)
        case "toxinStatusDamage":
          stats.statusDurationBonus += bonusValue;
          break;
        case "toxinHealthRecovery":
        case "corrosionMaxStacks":
          break;
      }
    }

    // Apply warframe arcanes
    for (const arcane of equippedArcanes) {
      if (arcane) applyArcaneToWarframe(stats, arcane);
    }

    // Recalculate derived stats after shard + arcane bonuses (flat shards add after percentage scaling)
    stats.totalHealth = stats.baseHealth * (1 + stats.healthBonus) + stats.flatHealthBonus;
    stats.totalShield = stats.baseShield * (1 + stats.shieldBonus) + stats.flatShieldBonus;
    stats.totalArmor = stats.baseArmor * (1 + stats.armorBonus) + stats.flatArmorBonus;
    stats.totalEnergy = stats.baseEnergy * (1 + stats.energyBonus + stats.flowBonus) + stats.flatEnergyBonus;
    stats.totalSprint = stats.baseSprint * (1 + stats.sprintSpeedBonus);
    const armorDR = stats.totalArmor / (stats.totalArmor + 300);
    stats.effectiveHealth = (stats.totalHealth / (1 - armorDR)) + stats.totalShield;
    stats.damageReduction = armorDR * 100;

    return stats;
  }, [selectedWarframe, equippedMods, equippedShards, equippedArcanes]);

  // Calculate capacity
  const baseCapacity = (hasOrokinReactor ? 60 : 30) + (isMR30 ? 10 : 0);
  const auraBonus = useMemo(() => {
    const auraMod = equippedMods.find((m) => m.slotIndex === AURA_SLOT);
    if (!auraMod) return 0;
    const mod = modsMap.get(auraMod.modId);
    if (!mod) return 0;
    // Aura drain is stored as negative (e.g. -4 for Steel Charge).
    // Capacity bonus = |drain| at max rank. drain + rank gives the scaled value.
    // We negate it so it becomes a positive capacity bonus.
    return Math.abs(mod.drain) + auraMod.rank;
  }, [equippedMods]);

  const totalCapacity = baseCapacity + auraBonus;

  const capacityUsed = useMemo(() => {
    return equippedMods
      .filter((m) => m.slotIndex !== AURA_SLOT) // Aura adds capacity, doesn't cost
      .reduce((sum, m) => {
        const mod = modsMap.get(m.modId);
        if (!mod) return sum;
        const baseDrain = mod.drain + m.rank;
        const slotPol = slotPolarities[m.slotIndex];
        return sum + modSlotCapacityCost(baseDrain, slotPol, mod.polarity);
      }, 0);
  }, [equippedMods, slotPolarities]);

  const handleSelectWarframe = useCallback((warframe: Warframe) => {
    setSelectedWarframe(warframe);
    setEquippedMods([]);
    setEquippedShards([null, null, null, null, null]);
    setEquippedArcanes([null, null]);
    setExaltedMods([]);
    setExaltedSlotPolarities({});
    setHelminthSlot(null);
    setHelminthAbility(null);
    setSlotPolarities({});
    // New frame from the picker = new draft; keep old id/name or cloud upsert overwrites the wrong row title
    setCurrentBuildId(null);
    setBuildName(`${warframe.name} Build`);
    setBuildDescription("");
    setShowWarframeList(false);
  }, []);

  const handleOpenModPicker = useCallback((slotIndex: number) => {
    setActiveSlotIndex(slotIndex);
    setActiveSlotType(getSlotType(slotIndex));
    setModPickerOpen(true);
  }, []);

  const handleSelectMod = useCallback((mod: Mod, rank: number) => {
    setEquippedMods((prev) => {
      const filtered = prev.filter((m) => m.slotIndex !== activeSlotIndex);
      return [
        ...filtered,
        { modId: mod.id, modName: mod.name, rank, slotIndex: activeSlotIndex, polarity: mod.polarity, drain: mod.drain },
      ];
    });
  }, [activeSlotIndex]);

  const handleRemoveMod = useCallback((slotIndex: number) => {
    setEquippedMods((prev) => prev.filter((m) => m.slotIndex !== slotIndex));
  }, []);

  const handleOpenShardPicker = useCallback((slotIndex: number) => {
    setActiveShardSlot(slotIndex);
    setShardPickerOpen(true);
    setSelectedShardForBonus(null);
  }, []);

  const handleSelectShardBonus = useCallback((shard: typeof allArchonShards[0], bonusKey: string, bonusValue: number) => {
    setEquippedShards((prev) => {
      const next = [...prev];
      next[activeShardSlot] = {
        shardId: shard.id,
        shardColor: shard.color,
        shardTier: shard.tier,
        selectedBonus: bonusKey,
        bonusValue,
        slotIndex: activeShardSlot,
      };
      return next;
    });
    setShardPickerOpen(false);
    setSelectedShardForBonus(null);
  }, [activeShardSlot]);

  const handleRemoveShard = useCallback((slotIndex: number) => {
    setEquippedShards((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }, []);

  const [shareCopied, setShareCopied] = useState(false);
  const handleShareBuild = useCallback(async () => {
    if (!selectedWarframe) return;

    // Fallback shareable object for offline/unauthenticated sharing
    const build: ShareableBuild = {
      type: "warframe",
      itemId: selectedWarframe.id,
      mods: equippedMods.map((m) => ({ id: m.modId, rank: m.rank })),
      shards: equippedShards.filter((s): s is EquippedArchonShard => s !== null).map((s) => ({ id: s.shardId, bonus: s.selectedBonus })),
    };

    try {
      // First try to save the build publicly to the server
      const data: WarframeBuildData = {
        warframeId: selectedWarframe.id,
        mods: equippedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
        shards: equippedShards,
        arcaneIds: equippedArcanes.map((a) => a?.id ?? null),
        hasOrokinReactor,
        isMR30,
        slotPolarities,
        helminthSlot,
        helminthAbilityId: helminthAbility?.id ?? null,
        exaltedMods: exaltedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
        exaltedSlotPolarities,
      };

      const payload = {
        id: currentBuildId || generateBuildId(),
        name: buildName || `${selectedWarframe.name} Build`,
        description: buildDescription || "",
        isPublic: true,
        type: "warframe",
        data,
      };

      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setCurrentBuildId(saved.id);
        const url = `${window.location.origin}/build/${saved.id}`;
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
        toast.success("Share link copied!", { description: "Link copied to clipboard" });
        return;
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to share publicly, falling back to local URL logic", e);
      }
    }

    // Fallback to local base64 sharing
    const url = window.location.origin + buildShareUrl(build);
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      toast.success("Share link copied!", { description: "Link copied to clipboard" });
    });
  }, [selectedWarframe, equippedMods, equippedShards, equippedArcanes, hasOrokinReactor, isMR30, slotPolarities, helminthSlot, helminthAbility, exaltedMods, exaltedSlotPolarities, buildName, buildDescription, currentBuildId]);

  const equippedModIds = equippedMods.map((m) => m.modId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {showWarframeList || !selectedWarframe ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Select a Warframe</h1>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warframes..."
                value={warframeSearch}
                onChange={(e) => setWarframeSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">{filteredWarframes.length} warframes</p>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-1 pr-4">
                {filteredWarframes.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => handleSelectWarframe(wf)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <GameAssetImage src={getWarframeImage(wf.name)} alt="" width={40} height={40} className="w-10 h-10 rounded object-contain bg-muted/20 shrink-0" hideOnError />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{wf.name}</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span>HP {wf.health}</span>
                          <span>SH {wf.shield}</span>
                          <span>AR {wf.armor}</span>
                          <span>EN {wf.energy}</span>
                          <span>SPD {wf.sprintSpeed}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div>
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowWarframeList(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Change
                </button>
                <GameAssetImage src={getWarframeImage(selectedWarframe.name)} alt="" width={40} height={40} className="w-10 h-10 rounded object-contain bg-muted/20 hidden sm:block" hideOnError />
                <h1 className="text-lg sm:text-2xl font-bold truncate">{selectedWarframe.name}</h1>
              </div>
              <div className="flex items-center gap-4 flex-wrap mt-2 mb-4">
                {/* primary actions */}
                <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-lg shadow-sm">
                  <button onClick={handleSaveBuild} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-all font-medium" title="Save Build">
                    <Save className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Save</span>
                  </button>
                  <button onClick={() => { setSavedBuilds(getSavedBuilds("warframe")); setShowSavedBuilds(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-all font-medium" title="Load Build">
                    <FolderOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Load</span>
                  </button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <button
                    onClick={() => setShowImporter(!showImporter)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                      showImporter
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
                    )}
                    title="Import Build"
                  >
                    <Upload className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Import</span>
                  </button>
                  <button
                    onClick={handleShareBuild}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                      shareCopied
                        ? "bg-green-500/10 text-green-400"
                        : "text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10"
                    )}
                    title="Copy shareable link"
                  >
                    {shareCopied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{shareCopied ? "Copied!" : "Share"}</span>
                  </button>
                </div>

                {/* build modifiers */}
                <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-lg shadow-sm">
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
                    onClick={() => setHasOrokinReactor(!hasOrokinReactor)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                      hasOrokinReactor
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reactor</span>
                  </button>
                </div>

                <div className="flex-1" />

                {/* meta */}
                <a
                  href={`/report-issue?type=warframe&name=${encodeURIComponent(selectedWarframe.name)}&id=${encodeURIComponent(selectedWarframe.id)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/5 transition-colors"
                >
                  <Flag className="h-3 w-3" /> <span className="hidden sm:inline">Report</span>
                </a>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-6">
                {/* Mod Configuration */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">
                      MOD CONFIGURATION
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-mono",
                        capacityUsed > totalCapacity ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {capacityUsed} / {totalCapacity}
                      </span>
                      {auraBonus > 0 && (
                        <span className="text-[10px] text-green-400/70">+{auraBonus} aura</span>
                      )}
                    </div>
                  </div>

                  {/* Aura Slot */}
                  <div className="mb-2">
                    <span className="text-[10px] font-semibold text-purple-400 tracking-wider mb-1 block">AURA</span>
                    {(() => {
                      const equipped = equippedMods.find((m) => m.slotIndex === AURA_SLOT);
                      const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                      return (
                        <ModSlotCard
                          mod={mod}
                          rank={equipped?.rank ?? 0}
                          slotIndex={AURA_SLOT}
                          label="Aura"
                          slotPolarity={slotPolarities[AURA_SLOT]}
                          onAdd={() => handleOpenModPicker(AURA_SLOT)}
                          onRemove={() => handleRemoveMod(AURA_SLOT)}
                          onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[AURA_SLOT] = p; else delete next[AURA_SLOT]; return next; })}
                        />
                      );
                    })()}
                  </div>

                  {/* Build Importer */}
                  {showImporter && (
                    <div className="mb-4">
                      <BuildImporter
                        modCategory="warframe"
                        numSlots={8}
                        onImport={(mods) => {
                          const remapped = mods.map((m, i) => ({ ...m, slotIndex: i + 1 }));
                          setEquippedMods(remapped);
                          setShowImporter(false);
                        }}
                        onClose={() => setShowImporter(false)}
                      />
                    </div>
                  )}
                  {/* Regular Mod Slots (1-8) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    {Array.from({ length: 8 }, (_, i) => {
                      const slotIdx = i + 1;
                      const equipped = equippedMods.find((m) => m.slotIndex === slotIdx);
                      const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                      return (
                        <ModSlotCard
                          key={slotIdx}
                          mod={mod}
                          rank={equipped?.rank ?? 0}
                          slotIndex={slotIdx}
                          slotPolarity={slotPolarities[slotIdx]}
                          onAdd={() => handleOpenModPicker(slotIdx)}
                          onRemove={() => handleRemoveMod(slotIdx)}
                          onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[slotIdx] = p; else delete next[slotIdx]; return next; })}
                        />
                      );
                    })}
                  </div>

                  {/* Exilus Slot */}
                  <div>
                    <span className="text-[10px] font-semibold text-cyan-400 tracking-wider mb-1 block">EXILUS</span>
                    {(() => {
                      const equipped = equippedMods.find((m) => m.slotIndex === EXILUS_SLOT);
                      const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                      return (
                        <ModSlotCard
                          mod={mod}
                          rank={equipped?.rank ?? 0}
                          slotIndex={EXILUS_SLOT}
                          label="Exilus"
                          slotPolarity={slotPolarities[EXILUS_SLOT]}
                          onAdd={() => handleOpenModPicker(EXILUS_SLOT)}
                          onRemove={() => handleRemoveMod(EXILUS_SLOT)}
                          onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[EXILUS_SLOT] = p; else delete next[EXILUS_SLOT]; return next; })}
                        />
                      );
                    })()}
                  </div>
                </div>

                {/* Archon Shards */}
                <div>
                  <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3">
                    ARCHON SHARDS
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    {equippedShards.map((shard, i) => (
                      <div key={i}>
                        {shard ? (
                          <button
                            onClick={() => handleRemoveShard(i)}
                            className="relative w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all hover:opacity-80"
                            style={{
                              borderColor: shardColors[shard.shardColor] || "#888",
                              backgroundColor: `${shardColors[shard.shardColor]}15`,
                            }}
                          >
                            <Diamond className="h-5 w-5" style={{ color: shardColors[shard.shardColor] }} />
                            <span className="text-[9px] font-bold capitalize" style={{ color: shardColors[shard.shardColor] }}>
                              {shard.shardColor}
                            </span>
                            <span className="text-[8px] text-muted-foreground">
                              {shard.shardTier === 2 ? "TAU" : "STD"}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenShardPicker(i)}
                            className="w-16 h-20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-purple-500/50 hover:text-purple-400 transition-all"
                          >
                            <Diamond className="h-4 w-4" />
                            <span className="text-[9px]">Shard {i + 1}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warframe Arcanes (2 slots) */}
                <div>
                  <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Gem className="h-4 w-4 text-purple-400" />
                    ARCANES
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {equippedArcanes.map((arcane, i) => (
                      <ArcaneSlotCard
                        key={i}
                        arcane={arcane}
                        rank={arcane?.maxRank ?? 0}
                        label={`Arcane ${i + 1}`}
                        onAdd={() => { setActiveArcaneSlot(i); setArcanePickerOpen(true); }}
                        onRemove={() => setEquippedArcanes((prev) => { const next = [...prev]; next[i] = null; return next; })}
                      />
                    ))}
                  </div>
                </div>

                {/* Abilities + Helminth */}
                {selectedWarframe.abilities.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3">
                      ABILITIES
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedWarframe.abilities.map((ability, i) => {
                        const isHelminthed = helminthSlot === i && helminthAbility;
                        return (
                          <div key={i} className="relative group">
                            {isHelminthed ? (
                              <div className="border border-green-500/30 rounded-xl p-3 bg-green-500/5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-green-400">{helminthAbility.name}</span>
                                  <button
                                    onClick={() => { setHelminthSlot(null); setHelminthAbility(null); }}
                                    className="text-[10px] text-red-400 hover:text-red-300"
                                  >✕</button>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">{helminthAbility.description}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[9px] text-green-400/70">⚡ {helminthAbility.energyCost}</span>
                                  <span className="text-[9px] text-green-400/70">
                                    {helminthAbility.sourceWarframe ? `from ${helminthAbility.sourceWarframe}` : "Helminth"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <AbilityCard ability={ability} index={i} stats={calculatedStats} />
                            )}
                            {!isHelminthed && (
                              <button
                                onClick={() => { setHelminthPickerSlot(i); setHelminthPickerOpen(true); setHelminthSearch(""); }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                title="Replace with Helminth ability"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Build Description */}
                <div>
                  <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3">BUILD DESCRIPTION</h2>
                  <textarea
                    value={buildDescription}
                    onChange={(e) => setBuildDescription(e.target.value)}
                    placeholder="Write a description for this build... (e.g. mechanics, synergies, how to play)"
                    className="w-full h-24 p-3 bg-card border border-border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/60 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <WarframeStatsPanel stats={calculatedStats} warframe={selectedWarframe} equippedMods={equippedMods} allMods={modsMap} helminthSlot={helminthSlot} helminthAbility={helminthAbility} />

                {/* Exalted Weapon Section */}
                {exaltedWeapon && (
                  <div className="border border-amber-500/30 rounded-xl p-5 bg-amber-500/5">
                    <h2 className="text-sm font-semibold tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                      <Crosshair className="h-4 w-4" />
                      EXALTED WEAPON — {exaltedWeapon.name}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {Array.from({ length: exaltedWeapon.modSlots }, (_, i) => {
                        const equipped = exaltedMods.find((m) => m.slotIndex === i);
                        const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                        return (
                          <ModSlotCard
                            key={`ex${i}`}
                            mod={mod}
                            rank={equipped?.rank ?? 0}
                            slotIndex={i}
                            slotPolarity={exaltedSlotPolarities[i]}
                            onAdd={() => { setExaltedActiveSlot(i); setExaltedModPickerOpen(true); }}
                            onRemove={() => setExaltedMods((prev) => prev.filter((m) => m.slotIndex !== i))}
                            onPolarize={(p) => setExaltedSlotPolarities((prev) => { const next = { ...prev }; if (p) next[i] = p; else delete next[i]; return next; })}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className={cn(
                        "font-mono",
                        exaltedCapacity > 60 ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {exaltedCapacity} / 60
                      </span>
                    </div>
                    {exaltedStats && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Damage</span><span>{exaltedStats.totalDamage.toFixed(1)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Crit Chance</span><span>{(exaltedStats.criticalChance * 100).toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Crit Multi</span><span>{exaltedStats.criticalMultiplier.toFixed(1)}x</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{(exaltedStats.statusChance * 100).toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Fire Rate</span><span>{exaltedStats.fireRate.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">DPS</span><span className="text-amber-400 font-medium">{exaltedStats.burstDps.toFixed(0)}</span></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <ModPicker
        open={modPickerOpen}
        onClose={() => setModPickerOpen(false)}
        mods={allMods}
        category="warframe"
        slotType={activeSlotType}
        equippedModIds={equippedModIds}
        onSelect={handleSelectMod}
        warframeId={selectedWarframe?.id}
      />

      {/* Archon Shard Picker */}
      <Dialog open={shardPickerOpen} onOpenChange={(v) => !v && setShardPickerOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedShardForBonus ? `${selectedShardForBonus.name} — Select Bonus` : "Select Archon Shard"}
            </DialogTitle>
          </DialogHeader>

          {selectedShardForBonus ? (
            <div className="space-y-2">
              {Object.entries(selectedShardForBonus.statBonuses).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleSelectShardBonus(selectedShardForBonus, key, value)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                >
                  <span className="text-sm font-medium">{bonusLabels[key] || key}</span>
                  <span className="text-sm text-purple-400 ml-2">
                    {formatBonusValue(key, value)}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setSelectedShardForBonus(null)}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
              >
                ← Back to shard list
              </button>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-1">
                {allArchonShards.map((shard) => (
                  <button
                    key={shard.id}
                    onClick={() => setSelectedShardForBonus(shard)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center gap-3"
                  >
                    <Diamond className="h-5 w-5 shrink-0" style={{ color: shardColors[shard.color] }} />
                    <div>
                      <span className="text-sm font-medium">{shard.name}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{shard.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Helminth Ability Picker */}
      <Dialog open={helminthPickerOpen} onOpenChange={(v) => { if (!v) setHelminthPickerOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Replace Ability {helminthPickerSlot + 1} with Helminth</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Helminth abilities..."
                value={helminthSearch}
                onChange={(e) => setHelminthSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-1">
              {allHelminthAbilities
                .filter((a) => {
                  if (!helminthSearch.trim()) return true;
                  const q = helminthSearch.toLowerCase();
                  return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || (a.sourceWarframe || "").toLowerCase().includes(q);
                })
                .map((ability) => (
                  <button
                    key={ability.id}
                    onClick={() => {
                      setHelminthSlot(helminthPickerSlot);
                      setHelminthAbility(ability);
                      setHelminthPickerOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{ability.name}</span>
                      <span className="text-[10px] text-green-400/70">
                        {ability.sourceWarframe ? ability.sourceWarframe : "Helminth"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{ability.description}</p>
                    <span className="text-[9px] text-muted-foreground">⚡ {ability.energyCost} energy</span>
                  </button>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Arcane Picker */}
      <ArcanePicker
        open={arcanePickerOpen}
        onOpenChange={setArcanePickerOpen}
        arcanes={warframeArcanes}
        equippedArcaneIds={equippedArcanes.filter(Boolean).map((a) => a!.id)}
        onSelect={(arcane) => {
          setEquippedArcanes((prev) => {
            const next = [...prev];
            next[activeArcaneSlot] = arcane;
            return next;
          });
          setArcanePickerOpen(false);
        }}
        title="Select Warframe Arcane"
      />

      {/* Exalted Weapon Mod Picker */}
      {exaltedWeapon && (
        <ModPicker
          open={exaltedModPickerOpen}
          onClose={() => setExaltedModPickerOpen(false)}
          mods={allMods}
          category={exaltedWeapon.category === "melee" ? "melee" : "primary"}
          equippedModIds={exaltedMods.map((m) => m.modId)}
          onSelect={(mod, rank) => {
            setExaltedMods((prev) => {
              const filtered = prev.filter((m) => m.slotIndex !== exaltedActiveSlot);
              return [...filtered, { modId: mod.id, modName: mod.name, rank, slotIndex: exaltedActiveSlot, polarity: mod.polarity, drain: mod.drain }];
            });
          }}
        />
      )}

      {/* Saved Builds Dialog */}
      <Dialog open={showSavedBuilds} onOpenChange={setShowSavedBuilds}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle>Saved Warframe Builds</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {savedBuilds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No saved builds yet.</p>
            ) : (
              <div className="space-y-2">
                {savedBuilds.map((build) => {
                  const d = build.data as WarframeBuildData;
                  const wf = allWarframes.find((w) => w.id === d.warframeId);
                  return (
                    <div key={build.id} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-purple-500/30 transition-all">
                      <button onClick={() => handleLoadBuild(build)} className="flex-1 text-left">
                        <span className="text-sm font-medium">{build.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {wf?.name ?? d.warframeId} • {d.mods.length} mods • {new Date(build.updatedAt).toLocaleDateString()}
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
