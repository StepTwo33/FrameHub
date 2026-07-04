"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import {
  ItemPickerScreen,
  ItemPickerRow,
  BuilderItemHeader,
  BuilderActionBar,
  BuilderActionGroup,
} from "@/components/item-picker";
import { ModSlotCard } from "@/components/mod-slot";
import { WarframeStatsPanel } from "@/components/stats-panel";
import { ModPicker, SlotType } from "@/components/mod-picker";
import { useWeapons, useWarframes, useMods, useArchonShards } from "@/lib/use-data";
import { calculateWarframeBuild, calculateWeaponBuild, applyWarframeShardsAndArcanes } from "@/lib/calculator";
import { modSlotCapacityCost } from "@/lib/mod-capacity";
import { Warframe, Mod, Ability, Weapon, WarframeCalculatedStats, CalculatedStats, EquippedMod, EquippedArchonShard } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Zap, Flag, RefreshCw, Gem, Crosshair, Star, Save, FolderOpen, Trash2, Share2, Check, Upload, Shield } from "lucide-react";
import { warframeArcanes } from "@/data/arcanes";
import { ArcaneSlotCard } from "@/components/arcane-picker";
import { ArchonShardSlot, ArchonShardIcon } from "@/components/archon-shard-slot";
import { allHelminthAbilities, HelminthAbility } from "@/data/helminth";
import { cn } from "@/lib/utils";
import { formatAbilityDescription } from "@/lib/ability-text";
import { getSavedBuilds, saveBuild, deleteBuild, generateBuildId, SavedBuild, WarframeBuildData, saveCloudBuild, resolveSavedArcaneSlots } from "@/lib/build-storage";
import { buildShareUrl, extractBuildFromUrl, ShareableBuild } from "@/lib/build-url";
import { toast } from "sonner";
import { getWarframeImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";
import { BuildImporter } from "@/components/build-importer";
import { SaveBuildDialog, type SaveBuildDialogValues } from "@/components/save-build-dialog";
import { CommunityBuildsPanel } from "@/components/community-builds-panel";
import { useCloudBuildFromUrl, fetchCloudBuild, setCloudBuildInUrl, clearCloudBuildInUrl, markCloudBuildLoaded } from "@/lib/use-cloud-build-from-url";
import { DualFormTabs } from "@/components/dual-form-tabs";
import {
  dualFormStatesFromBuild,
  getDualFormConfig,
  getDualFormAbilities,
  serializeDualFormBuilds,
  EMPTY_ARCANE_IDS,
  DEFAULT_ARCANE_RANKS,
  type DualFormBuildSlice,
} from "@/lib/dual-form-warframes";
import { scaledAbilityEnergyCost } from "@/lib/ability-misc-stats";
import {
  AbilityCardShell,
  AbilitySlotBadge,
  AbilityFormBadge,
  AbilityEnergyChip,
  AbilityDamageTypeChip,
  AbilityStatsBlock,
  AbilitiesSectionHeader,
} from "@/components/ability-display";

const EMPTY_SHARDS: (EquippedArchonShard | null)[] = [null, null, null, null, null];

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

// Full ability card with all stats
function AbilityCard({ ability, index, stats, gameSlot, formLabel, warframeId }: {
  ability: Ability;
  index: number;
  stats: WarframeCalculatedStats | null;
  gameSlot?: number;
  formLabel?: string;
  warframeId?: string;
}) {
  const eff = stats?.abilityEfficiency ?? 1;
  const display = { warframeId, abilityName: ability.name };
  const effectiveCost = scaledAbilityEnergyCost(ability.energyCost, eff);
  const slotNum = gameSlot ?? index + 1;

  return (
    <AbilityCardShell slot={slotNum}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <AbilitySlotBadge slot={slotNum} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-tight tracking-tight">{ability.name}</h3>
              {formLabel && <AbilityFormBadge label={formLabel} />}
            </div>
          </div>
        </div>
        <AbilityEnergyChip baseCost={ability.energyCost} effectiveCost={effectiveCost} />
      </div>

      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        {formatAbilityDescription(ability.description)}
      </p>

      {ability.subAbilities != null && ability.subAbilities.length > 0 && (
        <ul className="mb-3 list-inside list-disc space-y-1 text-[11px] leading-relaxed text-muted-foreground">
          {ability.subAbilities.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {ability.damageType && (
        <div className="mb-3">
          <AbilityDamageTypeChip type={ability.damageType} />
        </div>
      )}

      <AbilityStatsBlock ability={ability} stats={stats} display={display} />
    </AbilityCardShell>
  );
}

function HelminthAbilityCard({ ability, stats, onRemove }: {
  ability: HelminthAbility;
  stats: WarframeCalculatedStats | null;
  onRemove: () => void;
}) {
  const eff = stats?.abilityEfficiency ?? 1;
  const effectiveCost = scaledAbilityEnergyCost(ability.energyCost, eff);
  const display = { warframeId: undefined, abilityName: ability.name, helminth: true as const };

  return (
    <AbilityCardShell slot={1} variant="helminth">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-emerald-400">{ability.name}</h3>
          <p className="mt-0.5 text-[10px] text-emerald-400/60">
            {ability.sourceWarframe ? `Subsumed from ${ability.sourceWarframe}` : "Helminth"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AbilityEnergyChip baseCost={ability.energyCost} effectiveCost={effectiveCost} />
          <button
            onClick={onRemove}
            className="rounded-md px-1.5 py-0.5 text-[10px] text-rose-400 ring-1 ring-rose-500/30 transition-colors hover:bg-rose-500/10"
          >
            Remove
          </button>
        </div>
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
        {formatAbilityDescription(ability.description)}
      </p>
      <AbilityStatsBlock ability={ability} stats={stats} display={display} />
    </AbilityCardShell>
  );
}

export default function WarframeBuilderPage() {
  const allWarframes = useWarframes();
  const { mods: allMods, modsMap } = useMods();
  const allArchonShards = useArchonShards();
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
  const [modPickerBrowseTab, setModPickerBrowseTab] = useState<"mods" | "arcanes">("mods");
  const [equippedArcanes, setEquippedArcanes] = useState<(Mod | null)[]>([null, null]);
  const [equippedArcaneRanks, setEquippedArcaneRanks] = useState<number[]>([5, 5]);
  const [activeArcaneSlot, setActiveArcaneSlot] = useState(0);
  const [exaltedMods, setExaltedMods] = useState<EquippedMod[]>([]);
  const [exaltedModPickerOpen, setExaltedModPickerOpen] = useState(false);
  const [exaltedActiveSlot, setExaltedActiveSlot] = useState(0);
  const [exaltedSlotPolarities, setExaltedSlotPolarities] = useState<Record<number, string>>({});
  const [slotPolarities, setSlotPolarities] = useState<Record<number, string>>({});
  const [activeDualFormId, setActiveDualFormId] = useState("sirius");
  const [dualFormBuilds, setDualFormBuilds] = useState<Record<string, DualFormBuildSlice>>({});
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => getSavedBuilds("warframe"));
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildIsPublic, setBuildIsPublic] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogDefaultPublic, setSaveDialogDefaultPublic] = useState(false);

  const dualFormConfig = useMemo(
    () => (selectedWarframe ? getDualFormConfig(selectedWarframe.id) : null),
    [selectedWarframe],
  );

  const modSlotsToEquipped = useCallback((mods: { modId: string; rank: number; slotIndex: number }[]): EquippedMod[] => {
    return mods.map((m) => {
      const mod = modsMap.get(m.modId);
      return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain };
    });
  }, []);

  // Load build from URL ?build= param (hash share links)
  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const shared = extractBuildFromUrl(params);
      if (!shared || shared.type !== "warframe") return;
      const wf = allWarframes.find((w) => w.id === shared.itemId);
      if (!wf) return;
      setSelectedWarframe(wf);
      setShowWarframeList(false);
      setEquippedMods(shared.mods.map((m, i) => {
        const mod = modsMap.get(m.id);
        return { modId: m.id, modName: mod?.name ?? "", rank: m.rank, slotIndex: m.slotIndex ?? i, polarity: mod?.polarity, drain: mod?.drain };
      }));
      if (shared.arcanes) {
        setEquippedArcanes(resolveSavedArcaneSlots(shared.arcanes.map((id) => id || null), 2));
      }
      if (shared.shards && shared.shards.length > 0) {
        const restored: (EquippedArchonShard | null)[] = [...EMPTY_SHARDS];
        shared.shards.forEach((s, i) => {
          if (i >= restored.length) return;
          const def = allArchonShards.find((sh) => sh.id === s.id);
          if (!def) return;
          restored[i] = {
            shardId: def.id,
            shardColor: def.color,
            shardTier: def.tier,
            selectedBonus: s.bonus,
            bonusValue: def.statBonuses[s.bonus] ?? 0,
            slotIndex: i,
          };
        });
        setEquippedShards(restored);
      }
      setCurrentBuildId(null);
      setBuildName(`${wf.name} Build`);
      setBuildDescription("");
      const url = new URL(window.location.href);
      url.searchParams.delete("build");
      const qs = url.searchParams.toString();
      window.history.replaceState({}, "", qs ? `${url.pathname}?${qs}` : url.pathname);
    });
  }, []);

  const currentFormSlice = useCallback((): DualFormBuildSlice => ({
    mods: equippedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
    slotPolarities: { ...slotPolarities },
    arcaneIds: equippedArcanes.map((a) => a?.id ?? null),
    arcaneRanks: [...equippedArcaneRanks],
  }), [equippedMods, slotPolarities, equippedArcanes, equippedArcaneRanks]);

  const buildWarframePayload = useCallback((): Pick<
    WarframeBuildData,
    "mods" | "slotPolarities" | "shards" | "arcaneIds" | "arcaneRanks" | "dualFormBuilds"
  > => {
    const shards = equippedShards;
    if (!selectedWarframe) {
      return {
        mods: [],
        slotPolarities: {},
        shards: [...EMPTY_SHARDS],
        arcaneIds: [...EMPTY_ARCANE_IDS],
      };
    }
    if (!dualFormConfig) {
      return { ...currentFormSlice(), shards };
    }
    const formStates = {
      ...dualFormBuilds,
      [activeDualFormId]: currentFormSlice(),
    };
    return { ...serializeDualFormBuilds(selectedWarframe.id, formStates), shards };
  }, [selectedWarframe, dualFormConfig, dualFormBuilds, activeDualFormId, currentFormSlice, equippedShards]);

  const handleDualFormSwitch = useCallback(
    (newFormId: string) => {
      if (!dualFormConfig || newFormId === activeDualFormId) return;
      const merged = { ...dualFormBuilds, [activeDualFormId]: currentFormSlice() };
      const next = merged[newFormId] ?? {
        mods: [],
        slotPolarities: {},
        arcaneIds: [...EMPTY_ARCANE_IDS],
        arcaneRanks: [...DEFAULT_ARCANE_RANKS],
      };
      setDualFormBuilds(merged);
      setActiveDualFormId(newFormId);
      setEquippedMods(modSlotsToEquipped(next.mods));
      setSlotPolarities(next.slotPolarities);
      setEquippedArcanes(resolveSavedArcaneSlots(next.arcaneIds, 2));
      setEquippedArcaneRanks(next.arcaneRanks ?? [...DEFAULT_ARCANE_RANKS]);
    },
    [dualFormConfig, activeDualFormId, dualFormBuilds, currentFormSlice, modSlotsToEquipped],
  );

  const buildWarframeData = useCallback((): WarframeBuildData | null => {
    if (!selectedWarframe) return null;
    const payload = buildWarframePayload();
    return {
      warframeId: selectedWarframe.id,
      ...payload,
      hasOrokinReactor: hasOrokinReactor,
      isMR30,
      helminthSlot,
      helminthAbilityId: helminthAbility?.id ?? null,
      exaltedMods: exaltedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      exaltedSlotPolarities,
    };
  }, [selectedWarframe, buildWarframePayload, hasOrokinReactor, isMR30, helminthSlot, helminthAbility, exaltedMods, exaltedSlotPolarities]);

  const applyLoadedBuild = useCallback((build: SavedBuild, options?: { silent?: boolean }) => {
    const d = build.data as WarframeBuildData;
    const wf = allWarframes.find((w) => w.id === d.warframeId);
    if (!wf) { toast.error("Warframe not found"); return; }
    const config = getDualFormConfig(d.warframeId);
    if (config) {
      const states = dualFormStatesFromBuild(d)!;
      const nonDefault: Record<string, DualFormBuildSlice> = {};
      for (const form of config.forms) {
        if (form.id !== config.defaultFormId) nonDefault[form.id] = states[form.id];
      }
      setDualFormBuilds(nonDefault);
      setActiveDualFormId(config.defaultFormId);
      const defaultState = states[config.defaultFormId];
      setEquippedMods(modSlotsToEquipped(defaultState.mods));
      setSlotPolarities(defaultState.slotPolarities);
      setEquippedArcanes(resolveSavedArcaneSlots(defaultState.arcaneIds, 2));
      setEquippedArcaneRanks(defaultState.arcaneRanks ?? [...DEFAULT_ARCANE_RANKS]);
    } else {
      setDualFormBuilds({});
      setActiveDualFormId("sirius");
      setEquippedMods(modSlotsToEquipped(d.mods));
      setSlotPolarities(d.slotPolarities || {});
      setEquippedArcanes(resolveSavedArcaneSlots(d.arcaneIds, 2));
      setEquippedArcaneRanks(d.arcaneRanks ?? [...DEFAULT_ARCANE_RANKS]);
    }
    setEquippedShards(d.shards?.length === 5 ? d.shards : [...EMPTY_SHARDS]);
    setSelectedWarframe(wf);
    setHasOrokinReactor(d.hasOrokinReactor);
    setIsMR30(d.isMR30);
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
    setBuildIsPublic(build.isPublic ?? false);
    setShowSavedBuilds(false);
    setShowWarframeList(false);
    if (!options?.silent) {
      toast.info("Build loaded", { description: build.name });
    }
  }, [modSlotsToEquipped]);

  const handleSaveBuildConfirm = useCallback(async ({ name, description, isPublic }: SaveBuildDialogValues) => {
    const data = buildWarframeData();
    if (!data || !selectedWarframe) return;
    const build: SavedBuild = {
      id: currentBuildId || generateBuildId(),
      name,
      description,
      isPublic,
      type: "warframe",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data,
    };
    saveBuild(build);
    setCurrentBuildId(build.id);
    setBuildName(name);
    setBuildDescription(description);
    setBuildIsPublic(isPublic);
    setSavedBuilds(getSavedBuilds("warframe"));

    const cloudResult = await saveCloudBuild(build);
    if (cloudResult) {
      if (cloudResult.id !== build.id) {
        // Server assigned a new id — replace the local copy so we don't keep a duplicate
        deleteBuild(build.id);
        saveBuild({ ...build, id: cloudResult.id, isPublic: cloudResult.isPublic ?? isPublic });
        setSavedBuilds(getSavedBuilds("warframe"));
      }
      setCurrentBuildId(cloudResult.id);
      setBuildIsPublic(cloudResult.isPublic ?? isPublic);
      toast.success("Build saved", { description: `${name} saved to your account` });
    } else {
      toast.success("Build saved locally", { description: "Log in to sync builds to your account" });
    }
  }, [buildWarframeData, selectedWarframe, currentBuildId]);

  const handleLoadCommunityBuild = useCallback(async (buildId: string) => {
    const build = await fetchCloudBuild(buildId);
    if (!build) {
      toast.error("Could not load build");
      return;
    }
    setCloudBuildInUrl(buildId);
    markCloudBuildLoaded(buildId);
    applyLoadedBuild(build);
  }, [applyLoadedBuild]);

  const handleLoadBuild = useCallback((build: SavedBuild) => {
    applyLoadedBuild(build);
  }, [applyLoadedBuild]);

  useCloudBuildFromUrl("warframe", (build) => applyLoadedBuild(build, { silent: true }));

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
    // Shards + arcanes + derived-total recompute shared with loadout stats
    return applyWarframeShardsAndArcanes(stats, equippedShards, equippedArcanes, equippedArcaneRanks);
  }, [selectedWarframe, equippedMods, equippedShards, equippedArcanes, equippedArcaneRanks]);

  const abilityDisplayEntries = useMemo(() => {
    if (!selectedWarframe) return [];
    if (dualFormConfig) {
      const entries = getDualFormAbilities(
        selectedWarframe.id,
        activeDualFormId,
        selectedWarframe.abilities,
      );
      if (entries) {
        return entries.map((entry) => ({
          key: `${entry.abilityIndex}-${activeDualFormId}`,
          ability: entry.ability,
          abilityIndex: entry.abilityIndex,
          gameSlot: entry.gameSlot,
          formLabel: entry.formLabel,
        }));
      }
    }
    return selectedWarframe.abilities.map((ability, i) => ({
      key: String(i),
      ability,
      abilityIndex: i,
      gameSlot: i + 1,
      formLabel: undefined as string | undefined,
    }));
  }, [selectedWarframe, dualFormConfig, activeDualFormId]);

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
    setEquippedArcaneRanks([5, 5]);
    setExaltedMods([]);
    setExaltedSlotPolarities({});
    setHelminthSlot(null);
    setHelminthAbility(null);
    setSlotPolarities({});
    const config = getDualFormConfig(warframe.id);
    setActiveDualFormId(config?.defaultFormId ?? "sirius");
    setDualFormBuilds({});
    // New frame from the picker = new draft; keep old id/name or cloud upsert overwrites the wrong row title
    setCurrentBuildId(null);
    setBuildName(`${warframe.name} Build`);
    setBuildDescription("");
    setShowWarframeList(false);
  }, []);

  const handleOpenModPicker = useCallback((slotIndex: number) => {
    setActiveSlotIndex(slotIndex);
    setActiveSlotType(getSlotType(slotIndex));
    setModPickerBrowseTab("mods");
    setModPickerOpen(true);
  }, []);

  const handleOpenArcanePicker = useCallback((slotIndex: number) => {
    setActiveArcaneSlot(slotIndex);
    setModPickerBrowseTab("arcanes");
    setModPickerOpen(true);
  }, []);

  const handleSelectFromPicker = useCallback((mod: Mod, rank: number) => {
    if (mod.category === "arcane") {
      setEquippedArcanes((prev) => {
        const next = [...prev];
        next[activeArcaneSlot] = mod;
        return next;
      });
      setEquippedArcaneRanks((prev) => {
        const next = [...prev];
        next[activeArcaneSlot] = rank;
        return next;
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
  }, [activeSlotIndex, activeArcaneSlot]);

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

    const fallbackShareable: ShareableBuild = {
      type: "warframe",
      itemId: selectedWarframe.id,
      mods: equippedMods.map((m) => ({ id: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      arcanes: equippedArcanes.map((a) => a?.id ?? ""),
      shards: equippedShards.filter((s): s is EquippedArchonShard => s !== null).map((s) => ({ id: s.shardId, bonus: s.selectedBonus })),
    };

    if (buildIsPublic && currentBuildId) {
      const url = `${window.location.origin}/build/${currentBuildId}`;
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      toast.success("Share link copied!", { description: "Link copied to clipboard" });
      return;
    }

    if (!buildIsPublic) {
      setSaveDialogDefaultPublic(true);
      setSaveDialogOpen(true);
      toast.info("Enable community listing to share", { description: "Check \"List in Community Builds\" when saving, then copy the link." });
      return;
    }

    const url = window.location.origin + buildShareUrl(fallbackShareable);
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
    toast.success("Share link copied!", { description: "Link copied to clipboard" });
  }, [selectedWarframe, equippedMods, equippedArcanes, equippedShards, buildIsPublic, currentBuildId]);

  const equippedModIds = equippedMods.map((m) => m.modId);

  return (
    <PageShell>

      <main className="flex-1 container mx-auto px-4 py-6">
        {showWarframeList || !selectedWarframe ? (
          <ItemPickerScreen
            icon={Shield}
            accent="purple"
            title="Warframe Builder"
            description="Choose a warframe to configure mods, archon shards, Helminth abilities, and arcanes."
            count={filteredWarframes.length}
            search={warframeSearch}
            onSearchChange={setWarframeSearch}
            searchPlaceholder="Search warframes..."
          >
            {filteredWarframes.map((wf) => (
              <ItemPickerRow
                key={wf.id}
                accent="purple"
                onClick={() => handleSelectWarframe(wf)}
                image={
                  <GameAssetImage
                    src={getWarframeImage(wf.name)}
                    alt=""
                    width={40}
                    height={40}
                    className="h-9 w-9 object-contain"
                    hideOnError
                  />
                }
                title={wf.name}
                meta={
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>HP {wf.health}</span>
                    <span>SH {wf.shield}</span>
                    <span>AR {wf.armor}</span>
                    <span>EN {wf.energy}</span>
                    <span>SPD {wf.sprintSpeed}</span>
                  </div>
                }
              />
            ))}
          </ItemPickerScreen>
        ) : (
          <div>
            <BuilderItemHeader
              onChange={() => {
                clearCloudBuildInUrl();
                setShowWarframeList(true);
              }}
              image={
                <GameAssetImage
                  src={getWarframeImage(selectedWarframe.name)}
                  alt=""
                  width={40}
                  height={40}
                  className="hidden h-10 w-10 rounded-lg object-contain sm:block"
                  hideOnError
                />
              }
              title={selectedWarframe.name}
            >
              <BuilderActionBar>
                <BuilderActionGroup>
                  <button
                    onClick={() => {
                      setSaveDialogDefaultPublic(buildIsPublic);
                      setSaveDialogOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-all font-medium"
                    title="Save Build"
                  >
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
                </BuilderActionGroup>

                <div className="flex-1" />

                <a
                  href={`/report-issue?type=warframe&name=${encodeURIComponent(selectedWarframe.name)}&id=${encodeURIComponent(selectedWarframe.id)}`}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-400/70 transition-colors hover:bg-amber-500/5 hover:text-amber-400"
                >
                  <Flag className="h-3 w-3" /> <span className="hidden sm:inline">Report</span>
                </a>
              </BuilderActionBar>
            </BuilderItemHeader>

            <div className="mb-6">
              <CommunityBuildsPanel
                type="warframe"
                itemId={selectedWarframe.id}
                itemName={selectedWarframe.name}
                onLoadBuild={handleLoadCommunityBuild}
              />
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-6">
                {/* Mod Configuration */}
                <div>
                  {dualFormConfig && (
                    <div className="mb-4 space-y-2">
                      <DualFormTabs
                        forms={dualFormConfig.forms}
                        activeFormId={activeDualFormId}
                        onChange={handleDualFormSwitch}
                      />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Sirius and Orion share one loadout slot. Mods and arcanes are saved per form; archon shards and Helminth apply to both.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">
                      MOD CONFIGURATION{dualFormConfig ? ` — ${dualFormConfig.forms.find((f) => f.id === activeDualFormId)?.label ?? ""}` : ""}
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

                  {/* Aura + Exilus — top row (matches in-game warframe mod layout) */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
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
                            equippedModIds={equippedModIds}
                            onAdd={() => handleOpenModPicker(AURA_SLOT)}
                            onRemove={() => handleRemoveMod(AURA_SLOT)}
                            onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[AURA_SLOT] = p; else delete next[AURA_SLOT]; return next; })}
                          />
                        );
                      })()}
                    </div>
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
                            equippedModIds={equippedModIds}
                            onAdd={() => handleOpenModPicker(EXILUS_SLOT)}
                            onRemove={() => handleRemoveMod(EXILUS_SLOT)}
                            onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[EXILUS_SLOT] = p; else delete next[EXILUS_SLOT]; return next; })}
                          />
                        );
                      })()}
                    </div>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          equippedModIds={equippedModIds}
                          onAdd={() => handleOpenModPicker(slotIdx)}
                          onRemove={() => handleRemoveMod(slotIdx)}
                          onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[slotIdx] = p; else delete next[slotIdx]; return next; })}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Archon Shards */}
                <div>
                  <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-1">
                    ARCHON SHARDS
                  </h2>
                  {dualFormConfig && (
                    <p className="mb-2 text-[10px] text-muted-foreground">
                      One shard set for Sirius &amp; Orion — switching forms keeps these equipped.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {equippedShards.map((shard, i) => (
                      <ArchonShardSlot
                        key={i}
                        shard={shard}
                        slotIndex={i}
                        onEquip={() => handleOpenShardPicker(i)}
                        onRemove={() => handleRemoveShard(i)}
                      />
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
                        rank={equippedArcaneRanks[i] ?? arcane?.maxRank ?? 0}
                        label={`Arcane ${i + 1}`}
                        onAdd={() => handleOpenArcanePicker(i)}
                        onRemove={() => {
                          setEquippedArcanes((prev) => { const next = [...prev]; next[i] = null; return next; });
                          setEquippedArcaneRanks((prev) => { const next = [...prev]; next[i] = 5; return next; });
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Abilities + Helminth */}
                {abilityDisplayEntries.length > 0 && (
                  <div>
                    <AbilitiesSectionHeader
                      formLabel={
                        dualFormConfig
                          ? dualFormConfig.forms.find((f) => f.id === activeDualFormId)?.label
                          : undefined
                      }
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      {abilityDisplayEntries.map((entry) => {
                        const slotIndex = entry.gameSlot - 1;
                        const isHelminthed = helminthSlot === slotIndex && helminthAbility;
                        return (
                          <div key={entry.key} className="relative group">
                            {isHelminthed ? (
                              <HelminthAbilityCard
                                ability={helminthAbility}
                                stats={calculatedStats}
                                onRemove={() => { setHelminthSlot(null); setHelminthAbility(null); }}
                              />
                            ) : (
                              <AbilityCard
                                ability={entry.ability}
                                index={entry.abilityIndex}
                                gameSlot={entry.gameSlot}
                                formLabel={entry.formLabel}
                                stats={calculatedStats}
                                warframeId={selectedWarframe.id}
                              />
                            )}
                            {!isHelminthed && (
                              <button
                                onClick={() => { setHelminthPickerSlot(slotIndex); setHelminthPickerOpen(true); setHelminthSearch(""); }}
                                className="absolute bottom-3 right-3 rounded-lg bg-emerald-500/15 p-1.5 text-emerald-400 opacity-0 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/25 group-hover:opacity-100"
                                title="Replace with Helminth ability"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
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
                <WarframeStatsPanel
                  stats={calculatedStats}
                  warframe={selectedWarframe}
                  equippedMods={equippedMods}
                  allMods={modsMap}
                  helminthSlot={helminthSlot}
                  helminthAbility={helminthAbility}
                  equippedShards={equippedShards}
                  equippedArcanes={equippedArcanes}
                  arcaneRanks={equippedArcaneRanks}
                  activeDualFormId={dualFormConfig ? activeDualFormId : undefined}
                />

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
        onSelect={handleSelectFromPicker}
        warframeId={selectedWarframe?.id}
        arcaneCatalog={warframeArcanes}
        initialBrowseTab={modPickerBrowseTab}
        equippedArcaneIds={equippedArcanes.filter(Boolean).map((a) => a!.id)}
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
                    <ArchonShardIcon color={shard.color} tier={shard.tier} className="shrink-0" />
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

      {/* Exalted Weapon Mod Picker */}
      {exaltedWeapon && (
        <ModPicker
          open={exaltedModPickerOpen}
          onClose={() => setExaltedModPickerOpen(false)}
          mods={allMods}
          category={
            exaltedWeapon.category === "melee" || exaltedWeapon.category === "archmelee"
              ? "melee"
              : exaltedWeapon.category === "secondary" ||
                  exaltedWeapon.category === "pistol" ||
                  exaltedWeapon.category === "dual_pistols"
                ? "secondary"
                : "primary"
          }
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

      <SaveBuildDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        defaultName={buildName || (selectedWarframe ? `${selectedWarframe.name} Build` : "Warframe Build")}
        defaultDescription={buildDescription}
        defaultIsPublic={saveDialogDefaultPublic}
        onSave={handleSaveBuildConfirm}
      />
    </PageShell>
  );
}
