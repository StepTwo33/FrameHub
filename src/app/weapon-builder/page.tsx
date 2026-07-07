"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
import { WeaponStatsPanel } from "@/components/stats-panel";
import { ModPicker, type SlotType } from "@/components/mod-picker";
import { allMods, modsMap } from "@/data/mods";
import { useWeapons } from "@/lib/use-data";
import { calculateWeaponBuild, calculateWeaponBuildWithArcanes } from "@/lib/calculator";
import { modSlotCapacityCost, modCapacityAtRank } from "@/lib/mod-capacity";
import { Weapon, Mod, CalculatedStats, EquippedMod, SimulationParams, DEFAULT_SIM_PARAMS, WeaponCalculationOptions } from "@/lib/types";
import {
  weaponSupportsProgenitor,
  PROGENITOR_ELEMENT_IDS,
  PROGENITOR_ELEMENT_LABELS,
  PROGENITOR_BONUS_DEFAULT,
  PROGENITOR_BONUS_MIN,
  PROGENITOR_BONUS_MAX,
} from "@/lib/weapon-progenitor";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Zap, Flag, Flame, Plus, X, Gem, Star, Save, FolderOpen, Trash2, Share2, Check, Upload, Crosshair } from "lucide-react";
import { PolarityIcon } from "@/components/polarity-icon";
import { STANCE_WEAPON_TYPE, MELEE_TYPE_LABELS } from "@/data/stances";
import { isPrimaryWeaponCategory } from "@/lib/mod-weapon-eligibility";
import { isTomeWeapon } from "@/lib/tome-weapons";
import { getWeaponArcanes } from "@/lib/weapon-arcane-config";
import { ArcaneSlotCard, ArcanePicker } from "@/components/arcane-picker";
import { incarnonDataMap } from "@/data/incarnon";
import { cn } from "@/lib/utils";
import { appendReturnTo } from "@/lib/nav-return";
import { getSavedBuilds, saveBuild, deleteBuild, generateBuildId, SavedBuild, WeaponBuildData, saveCloudBuild, resolveSavedArcaneSlots, resolveArcaneById } from "@/lib/build-storage";
import { buildShareUrl, extractBuildFromUrl, ShareableBuild } from "@/lib/build-url";
import { toast } from "sonner";
import { getWeaponImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";
import { BuildImporter } from "@/components/build-importer";
import { useCloudBuildFromUrl, fetchCloudBuild, setCloudBuildInUrl, clearCloudBuildInUrl, markCloudBuildLoaded } from "@/lib/use-cloud-build-from-url";
import { SaveBuildDialog, type SaveBuildDialogValues } from "@/components/save-build-dialog";
import { CommunityBuildsPanel } from "@/components/community-builds-panel";

const categoryLabels: Record<string, string> = {
  all: "All",
  primary: "Primary",
  rifle: "Rifles",
  shotgun: "Shotguns",
  bow: "Bows",
  secondary: "Secondary",
  pistol: "Pistols",
  melee: "Melee",
  launcher: "Launchers",
  archgun: "Archguns",
  archmelee: "Archmelee",
  sentinel_weapon: "Sentinel",
  hound_weapon: "Hound",
  beast_claw: "Beast Claws",
  tektolyst: "Tektolyst",
};

function getModCategory(weaponCategory: string): string {
  if (["rifle", "shotgun", "bow", "primary", "launcher"].includes(weaponCategory)) return "primary";
  if (weaponCategory === "archgun") return "archgun";
  if (["pistol", "secondary", "dual_pistols"].includes(weaponCategory)) return "secondary";
  if (weaponCategory === "archmelee") return "archmelee";
  if (["melee", "beast_claw"].includes(weaponCategory)) return "melee";
  if (["sentinel_weapon", "hound_weapon"].includes(weaponCategory)) return "primary";
  if (weaponCategory === "tektolyst") return "tektolyst";
  return weaponCategory;
}

/** 9th slot (index 8) for primary / secondary / melee — in-game weapon Exilus slot. */
const WEAPON_EXILUS_SLOT_INDEX = 8;

export default function WeaponBuilderPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const builderReturnTo = useMemo(() => {
    const q = searchParams.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [pathname, searchParams]);

  const allWeapons = useWeapons();
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [equippedMods, setEquippedMods] = useState<EquippedMod[]>([]);
  const [modPickerOpen, setModPickerOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [modPickerSlotType, setModPickerSlotType] = useState<SlotType>("regular");
  const [weaponSearch, setWeaponSearch] = useState("");
  const [weaponCategory, setWeaponCategory] = useState("all");
  const [showWeaponList, setShowWeaponList] = useState(true);
  const [hasOrokinCatalyst, setHasOrokinCatalyst] = useState(false);
  const [isMR30, setIsMR30] = useState(false);
  const [selectedEvolutions, setSelectedEvolutions] = useState<Record<number, number>>({}); // tier -> slot
  const [rivenStatsMap, setRivenStatsMap] = useState<Record<number, Record<string, number>>>({});
  const [equippedArcanes, setEquippedArcanes] = useState<(Mod | null)[]>([null, null]);
  const [arcanePickerOpen, setArcanePickerOpen] = useState(false);
  const [activeArcaneSlot, setActiveArcaneSlot] = useState(0);
  const [stanceMod, setStanceMod] = useState<Mod | null>(null);
  const [stancePickerOpen, setStancePickerOpen] = useState(false);
  const [stanceSearch, setStanceSearch] = useState("");
  const [slotPolarities, setSlotPolarities] = useState<Record<number, string>>({});
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => getSavedBuilds("weapon"));
  const [buildName, setBuildName] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildIsPublic, setBuildIsPublic] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogDefaultPublic, setSaveDialogDefaultPublic] = useState(false);
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [simParams, setSimParams] = useState<SimulationParams>({ ...DEFAULT_SIM_PARAMS });
  const [progenitorElement, setProgenitorElement] = useState<string>("heat");
  const [progenitorBonusPercent, setProgenitorBonusPercent] = useState(PROGENITOR_BONUS_DEFAULT);

  const weaponCalcOptions = useMemo<WeaponCalculationOptions | undefined>(() => {
    if (!selectedWeapon || !weaponSupportsProgenitor(selectedWeapon)) return undefined;
    return { progenitorElement, progenitorBonusPercent };
  }, [selectedWeapon, progenitorElement, progenitorBonusPercent]);

  // Load build from URL ?build= param
  useEffect(() => {
    queueMicrotask(() => {
      if (allWeapons.length === 0) return;
      const params = new URLSearchParams(window.location.search);
      const shared = extractBuildFromUrl(params);
      if (!shared || shared.type !== "weapon") return;
      const weapon = allWeapons.find((w) => w.id === shared.itemId);
      if (!weapon) return;
      setSelectedWeapon(weapon);
      setShowWeaponList(false);
      const mods: EquippedMod[] = shared.mods.map((m, i) => {
        const mod = modsMap.get(m.id);
        return { modId: m.id, modName: mod?.name ?? "", rank: m.rank, slotIndex: i, polarity: mod?.polarity, drain: mod?.drain };
      });
      setEquippedMods(mods);
      if (shared.arcanes) {
        setEquippedArcanes(shared.arcanes.map((id) => (id ? resolveArcaneById(id) : null)));
      }
      setCurrentBuildId(null);
      setBuildName(`${weapon.name} Build`);
      setBuildDescription("");
      if (shared.progenitorElement) setProgenitorElement(shared.progenitorElement);
      if (shared.progenitorBonusPercent != null) setProgenitorBonusPercent(shared.progenitorBonusPercent);
      if (shared.hasOrokinCatalyst != null) setHasOrokinCatalyst(shared.hasOrokinCatalyst);
      if (shared.isMR30 != null) setIsMR30(shared.isMR30);
      if (shared.slotPolarities) setSlotPolarities(shared.slotPolarities);
      const sharedIncarnon = (shared as ShareableBuild & { incarnonEvolutions?: Record<number, number> }).incarnonEvolutions;
      if (sharedIncarnon) setSelectedEvolutions(sharedIncarnon);
      const url = new URL(window.location.href);
      url.searchParams.delete("build");
      const qs = url.searchParams.toString();
      window.history.replaceState({}, "", qs ? `${url.pathname}?${qs}` : url.pathname);
    });
  }, [allWeapons]);

  const buildWeaponData = useCallback((): WeaponBuildData | null => {
    if (!selectedWeapon) return null;
    return {
      weaponId: selectedWeapon.id,
      mods: equippedMods.map((m) => ({ modId: m.modId, rank: m.rank, slotIndex: m.slotIndex })),
      stanceModId: stanceMod?.id,
      arcaneIds: equippedArcanes.map((a) => a?.id ?? null),
      hasOrokinCatalyst,
      isMR30,
      slotPolarities,
      ...(weaponCalcOptions?.progenitorElement != null
        ? {
            progenitorElement: weaponCalcOptions.progenitorElement,
            progenitorBonusPercent: weaponCalcOptions.progenitorBonusPercent,
          }
        : {}),
      ...(Object.keys(selectedEvolutions).length > 0 ? { incarnonEvolutions: selectedEvolutions } : {}),
    };
  }, [selectedWeapon, equippedMods, stanceMod, equippedArcanes, hasOrokinCatalyst, isMR30, slotPolarities, weaponCalcOptions, selectedEvolutions]);

  const applyLoadedBuild = useCallback((build: SavedBuild, options?: { silent?: boolean }) => {
    const d = build.data as WeaponBuildData;
    const weapon = allWeapons.find((w) => w.id === d.weaponId);
    if (!weapon) { toast.error("Weapon not found"); return; }
    setSelectedWeapon(weapon);
    setEquippedMods(d.mods.map((m) => {
      const mod = modsMap.get(m.modId);
      return { ...m, modName: mod?.name ?? "", polarity: mod?.polarity, drain: mod?.drain };
    }));
    if (d.stanceModId) {
      const sm = allMods.find((m) => m.id === d.stanceModId);
      setStanceMod(sm ?? null);
    } else {
      setStanceMod(null);
    }
    setEquippedArcanes(resolveSavedArcaneSlots(d.arcaneIds, 2));
    setHasOrokinCatalyst(d.hasOrokinCatalyst);
    setIsMR30(d.isMR30);
    setSlotPolarities(d.slotPolarities || {});
    if (weaponSupportsProgenitor(weapon)) {
      setProgenitorElement(d.progenitorElement ?? "heat");
      setProgenitorBonusPercent(d.progenitorBonusPercent ?? PROGENITOR_BONUS_DEFAULT);
    } else {
      setProgenitorElement("heat");
      setProgenitorBonusPercent(PROGENITOR_BONUS_DEFAULT);
    }
    setCurrentBuildId(build.id);
    setBuildName(build.name);
    setBuildDescription(build.description || "");
    setBuildIsPublic(build.isPublic ?? false);
    setSelectedEvolutions(d.incarnonEvolutions ?? {});
    setShowSavedBuilds(false);
    setShowWeaponList(false);
    if (!options?.silent) {
      toast.info("Build loaded", { description: build.name });
    }
  }, [allWeapons]);

  const handleSaveBuildConfirm = useCallback(async ({ name, description, isPublic }: SaveBuildDialogValues) => {
    const data = buildWeaponData();
    if (!data || !selectedWeapon) return;
    const build: SavedBuild = {
      id: currentBuildId || generateBuildId(),
      name,
      description,
      isPublic,
      type: "weapon",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data,
    };
    saveBuild(build);
    setCurrentBuildId(build.id);
    setBuildName(name);
    setBuildDescription(description);
    setBuildIsPublic(isPublic);
    setSavedBuilds(getSavedBuilds("weapon"));

    const cloudResult = await saveCloudBuild(build);
    if (cloudResult) {
      if (cloudResult.id !== build.id) {
        // Server assigned a new id — replace the local copy so we don't keep a duplicate
        deleteBuild(build.id);
        saveBuild({ ...build, id: cloudResult.id, isPublic: cloudResult.isPublic ?? isPublic });
        setSavedBuilds(getSavedBuilds("weapon"));
      }
      setCurrentBuildId(cloudResult.id);
      setBuildIsPublic(cloudResult.isPublic ?? isPublic);
      toast.success("Build saved", { description: `${name} saved to your account` });
    } else {
      toast.success("Build saved locally", { description: "Log in to sync builds to your account" });
    }
  }, [buildWeaponData, selectedWeapon, currentBuildId]);

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

  useCloudBuildFromUrl("weapon", (build) => applyLoadedBuild(build, { silent: true }));

  const handleDeleteBuild = useCallback((id: string) => {
    deleteBuild(id);
    setSavedBuilds(getSavedBuilds("weapon"));
    if (currentBuildId === id) setCurrentBuildId(null);
    toast.success("Build deleted");
  }, [currentBuildId]);

  const [shareCopied, setShareCopied] = useState(false);
  const handleShareBuild = useCallback(async () => {
    if (!selectedWeapon) return;

    const fallbackShareable: ShareableBuild = {
      type: "weapon",
      itemId: selectedWeapon.id,
      mods: equippedMods.map((m) => ({ id: m.modId, rank: m.rank })),
      arcanes: equippedArcanes.map((a) => a?.id ?? ""),
      hasOrokinCatalyst,
      isMR30,
      slotPolarities: slotPolarities as Record<string, string>,
      ...(weaponCalcOptions?.progenitorElement != null
        ? {
            progenitorElement: weaponCalcOptions.progenitorElement,
            progenitorBonusPercent: weaponCalcOptions.progenitorBonusPercent,
          }
        : {}),
      ...(Object.keys(selectedEvolutions).length > 0 ? { incarnonEvolutions: selectedEvolutions } : {}),
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
  }, [selectedWeapon, equippedMods, equippedArcanes, hasOrokinCatalyst, isMR30, slotPolarities, weaponCalcOptions, selectedEvolutions, buildIsPublic, currentBuildId]);

  const filteredWeapons = useMemo(() => {
    const hiddenCategories = ["amp_prism", "zaw_strike", "kitgun_chamber"];
    let weapons = allWeapons.filter((w) => !hiddenCategories.includes(w.category));
    if (weaponCategory !== "all") {
      weapons = weapons.filter((w) => w.category === weaponCategory);
    }
    if (weaponSearch.trim()) {
      const q = weaponSearch.toLowerCase();
      weapons = weapons.filter((w) => w.name.toLowerCase().includes(q));
    }
    return weapons.sort((a, b) => a.name.localeCompare(b.name));
  }, [allWeapons, weaponCategory, weaponSearch]);

  // Get Incarnon evolution data for selected weapon
  const incarnonData = selectedWeapon ? incarnonDataMap.get(selectedWeapon.id) : undefined;
  const isIncarnon = !!(incarnonData || selectedWeapon?.isIncarnon);

  // Merge selected incarnon evolution stat changes
  const incarnonStatChanges = useMemo<Record<string, number> | undefined>(() => {
    if (!incarnonData || Object.keys(selectedEvolutions).length === 0) return undefined;
    const merged: Record<string, number> = {};
    for (const [tierStr, slot] of Object.entries(selectedEvolutions)) {
      const tier = Number(tierStr);
      const evo = incarnonData.evolutions.find((e) => e.tier === tier && e.slot === slot);
      if (evo) {
        for (const [stat, val] of Object.entries(evo.statChanges)) {
          merged[stat] = (merged[stat] ?? 0) + val;
        }
      }
    }
    return Object.keys(merged).length > 0 ? merged : undefined;
  }, [incarnonData, selectedEvolutions]);

  // Gather riven stat changes from any slot that has a riven equipped (applied multiplicatively by the calculator)
  const rivenStatChanges = useMemo<Record<string, number> | undefined>(() => {
    const merged: Record<string, number> = {};
    for (const [slotStr, stats] of Object.entries(rivenStatsMap)) {
      const slotIdx = Number(slotStr);
      const equipped = equippedMods.find((m) => m.slotIndex === slotIdx);
      if (equipped && equipped.modId.startsWith("riven_")) {
        for (const [k, v] of Object.entries(stats)) merged[k] = (merged[k] ?? 0) + v;
      }
    }
    return Object.keys(merged).length > 0 ? merged : undefined;
  }, [rivenStatsMap, equippedMods]);

  const calculatedStats = useMemo<CalculatedStats | null>(() => {
    if (!selectedWeapon) return null;
    const modSlots = equippedMods.map((m) => ({
      modId: m.modId,
      rank: m.rank,
      slotIndex: m.slotIndex,
    }));
    const activeArcanes = equippedArcanes.filter((a): a is Mod => a !== null);
    if (activeArcanes.length > 0) {
      return calculateWeaponBuildWithArcanes(selectedWeapon, modSlots, modsMap, activeArcanes, incarnonStatChanges, simParams, weaponCalcOptions, undefined, rivenStatChanges);
    }
    return calculateWeaponBuild(selectedWeapon, modSlots, modsMap, incarnonStatChanges, simParams, weaponCalcOptions, undefined, rivenStatChanges);
  }, [selectedWeapon, equippedMods, equippedArcanes, incarnonStatChanges, rivenStatChanges, simParams, weaponCalcOptions]);

  const baseStats = useMemo<CalculatedStats | null>(() => {
    if (!selectedWeapon) return null;
    return calculateWeaponBuild(selectedWeapon, [], modsMap, undefined, simParams, weaponCalcOptions);
  }, [selectedWeapon, simParams, weaponCalcOptions]);

  const handleSelectWeapon = useCallback((weapon: Weapon) => {
    setSelectedWeapon(weapon);
    setEquippedMods([]);
    setHasOrokinCatalyst(false);
    setSelectedEvolutions({});
    setRivenStatsMap({});
    setEquippedArcanes([null, null]);
    setStanceMod(null);
    setSlotPolarities({});
    setProgenitorElement("heat");
    setProgenitorBonusPercent(PROGENITOR_BONUS_DEFAULT);
    setCurrentBuildId(null);
    setBuildName(`${weapon.name} Build`);
    setBuildDescription("");
    setShowWeaponList(false);
  }, []);

  const handleOpenModPicker = useCallback((slotIndex: number) => {
    setActiveSlotIndex(slotIndex);
    const w = selectedWeapon;
    const pri = w && isPrimaryWeaponCategory(w.category);
    const sec = w && ["pistol", "secondary", "dual_pistols"].includes(w.category);
    const mel = w && w.category === "melee";
    const isExilus = slotIndex === WEAPON_EXILUS_SLOT_INDEX && Boolean(pri || sec || mel);
    setModPickerSlotType(
      pri && isExilus
        ? "weapon_exilus_primary"
        : sec && isExilus
          ? "weapon_exilus_secondary"
          : mel && isExilus
            ? "weapon_exilus_melee"
            : "regular",
    );
    setModPickerOpen(true);
  }, [selectedWeapon]);

  const handleSelectMod = useCallback((mod: Mod, rank: number) => {
    setEquippedMods((prev) => {
      const filtered = prev.filter((m) => m.slotIndex !== activeSlotIndex);
      return [
        ...filtered,
        {
          modId: mod.id,
          modName: mod.name,
          rank,
          slotIndex: activeSlotIndex,
          polarity: mod.polarity,
          drain: mod.drain,
        },
      ];
    });
  }, [activeSlotIndex]);

  const handleSelectRiven = useCallback((mod: Mod, stats: Record<string, number>) => {
    setEquippedMods((prev) => {
      const filtered = prev.filter((m) => m.slotIndex !== activeSlotIndex);
      return [
        ...filtered,
        {
          modId: mod.id,
          modName: mod.name,
          rank: 0,
          slotIndex: activeSlotIndex,
          polarity: mod.polarity,
          drain: mod.drain,
        },
      ];
    });
    setRivenStatsMap((prev) => ({ ...prev, [activeSlotIndex]: stats }));
  }, [activeSlotIndex]);

  const handleRemoveMod = useCallback((slotIndex: number) => {
    setEquippedMods((prev) => prev.filter((m) => m.slotIndex !== slotIndex));
    setRivenStatsMap((prev) => { const n = { ...prev }; delete n[slotIndex]; return n; });
  }, []);

  const modCategory = selectedWeapon ? getModCategory(selectedWeapon.category) : "primary";
  const equippedModIds = equippedMods.map((m) => m.modId);
  const numSlots = selectedWeapon?.modSlots || 8;
  const isPrimaryWeapon = selectedWeapon ? isPrimaryWeaponCategory(selectedWeapon.category) : false;
  const isSecondaryWeapon = selectedWeapon ? ["pistol", "secondary", "dual_pistols"].includes(selectedWeapon.category) : false;
  const isMeleeWeapon = selectedWeapon?.category === "melee";
  const hasWeaponExilusSlot = isPrimaryWeapon || isSecondaryWeapon || isMeleeWeapon;
  const totalModSlots = hasWeaponExilusSlot ? numSlots + 1 : numSlots;

  return (
    <PageShell>

      <main className="flex-1 container mx-auto px-4 py-6">
        {showWeaponList || !selectedWeapon ? (
          <ItemPickerScreen
            icon={Crosshair}
            accent="blue"
            title="Weapon Builder"
            description="Choose a weapon to configure mods, arcanes, rivens, and Incarnon evolutions."
            count={filteredWeapons.length}
            search={weaponSearch}
            onSearchChange={setWeaponSearch}
            searchPlaceholder="Search weapons..."
            filters={Object.entries(categoryLabels).map(([key, label]) => (
              <ItemPickerFilter
                key={key}
                active={weaponCategory === key}
                onClick={() => setWeaponCategory(key)}
              >
                {label}
              </ItemPickerFilter>
            ))}
          >
            {filteredWeapons.map((weapon) => (
              <ItemPickerRow
                key={weapon.id}
                accent="blue"
                onClick={() => handleSelectWeapon(weapon)}
                image={
                  <GameAssetImage
                    src={getWeaponImage(weapon.name, { category: weapon.category })}
                    alt=""
                    width={40}
                    height={40}
                    className="h-9 w-9 object-contain"
                    hideOnError
                  />
                }
                title={
                  <>
                    {weapon.name}
                    {incarnonDataMap.has(weapon.id) && <Flame className="ml-1 inline h-3 w-3 text-orange-400" />}
                  </>
                }
                badge={
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {categoryLabels[weapon.category] || weapon.category}
                  </span>
                }
                meta={
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {weapon.category === "tektolyst" ? (
                      <span>Tektolyst Artifact — {weapon.focusSchool || "Focus"} School</span>
                    ) : (
                      <>
                        <span>DMG {weapon.damage}</span>
                        <span>CC {(weapon.criticalChance * 100).toFixed(0)}%</span>
                        <span>CM {weapon.criticalMultiplier.toFixed(1)}x</span>
                        <span>SC {(weapon.statusChance * 100).toFixed(0)}%</span>
                        <span>FR {weapon.fireRate.toFixed(1)}</span>
                      </>
                    )}
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
                setShowWeaponList(true);
              }}
              image={
                <GameAssetImage
                  src={getWeaponImage(selectedWeapon.name, { category: selectedWeapon.category })}
                  alt=""
                  width={40}
                  height={40}
                  className="hidden h-10 w-10 rounded-lg object-contain sm:block"
                  hideOnError
                />
              }
              title={selectedWeapon.name}
              subtitle={`${selectedWeapon.category} • ${selectedWeapon.triggerType}`}
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
                  <button
                    onClick={() => { setSavedBuilds(getSavedBuilds("weapon")); setShowSavedBuilds(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-all font-medium"
                    title="Load Build"
                  >
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
                    onClick={() => setHasOrokinCatalyst(!hasOrokinCatalyst)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all font-medium",
                      hasOrokinCatalyst
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Catalyst</span>
                  </button>
                </BuilderActionGroup>

                {selectedWeapon && weaponSupportsProgenitor(selectedWeapon) && (
                  <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06]">
                    <span className="text-xs font-medium text-amber-400/90 shrink-0">Progenitor bonus</span>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="hidden sm:inline">Element</span>
                      <select
                        value={progenitorElement}
                        onChange={(e) => setProgenitorElement(e.target.value)}
                        className="bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground max-w-[140px]"
                      >
                        {PROGENITOR_ELEMENT_IDS.map((id) => (
                          <option key={id} value={id}>
                            {PROGENITOR_ELEMENT_LABELS[id] ?? id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Bonus %</span>
                      <input
                        type="number"
                        min={PROGENITOR_BONUS_MIN}
                        max={PROGENITOR_BONUS_MAX}
                        value={progenitorBonusPercent}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isFinite(v)) return;
                          setProgenitorBonusPercent(Math.min(PROGENITOR_BONUS_MAX, Math.max(PROGENITOR_BONUS_MIN, Math.round(v))));
                        }}
                        className="w-14 bg-background border border-border rounded-md px-1.5 py-1 text-xs font-mono text-foreground"
                      />
                      <span className="text-[10px] opacity-70">({PROGENITOR_BONUS_MIN}–{PROGENITOR_BONUS_MAX})</span>
                    </label>
                  </div>
                )}

                <div className="flex-1" />

                {/* meta */}
                <a
                  href={appendReturnTo(
                    `/report-issue?type=weapon&name=${encodeURIComponent(selectedWeapon.name)}&id=${encodeURIComponent(selectedWeapon.id)}`,
                    builderReturnTo,
                  )}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/5 transition-colors"
                >
                  <Flag className="h-3 w-3" /> <span className="hidden sm:inline">Report</span>
                </a>
              </BuilderActionBar>
            </BuilderItemHeader>

            <div className="mb-6">
              <CommunityBuildsPanel
                type="weapon"
                itemId={selectedWeapon.id}
                itemName={selectedWeapon.name}
                onLoadBuild={handleLoadCommunityBuild}
              />
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">
                    MOD CONFIGURATION
                  </h2>
                  <span className={cn(
                    "text-xs font-mono",
                    equippedMods.reduce((sum, m) => {
                      const mod = modsMap.get(m.modId);
                      if (!mod) return sum;
                      const baseDrain = modCapacityAtRank(mod.drain, m.rank);
                      const slotPol = slotPolarities[m.slotIndex];
                      return sum + modSlotCapacityCost(baseDrain, slotPol, mod.polarity);
                    }, 0) > ((hasOrokinCatalyst ? 60 : 30) + (isMR30 ? 10 : 0))
                      ? "text-red-400" : "text-muted-foreground"
                  )}>
                    {equippedMods.reduce((sum, m) => {
                      const mod = modsMap.get(m.modId);
                      if (!mod) return sum;
                      const baseDrain = modCapacityAtRank(mod.drain, m.rank);
                      const slotPol = slotPolarities[m.slotIndex];
                      return sum + modSlotCapacityCost(baseDrain, slotPol, mod.polarity);
                    }, 0)} / {(hasOrokinCatalyst ? 60 : 30) + (isMR30 ? 10 : 0)}
                  </span>
                </div>
                {showImporter && (
                  <div className="mb-4">
                    <BuildImporter
                      modCategory={modCategory}
                      numSlots={totalModSlots}
                      onImport={(mods) => {
                        setEquippedMods(mods);
                        setShowImporter(false);
                      }}
                      onClose={() => setShowImporter(false)}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Array.from({ length: totalModSlots }, (_, i) => {
                    const equipped = equippedMods.find((m) => m.slotIndex === i);
                    const mod = equipped ? modsMap.get(equipped.modId) ?? null : null;
                    const isExilus = hasWeaponExilusSlot && i === WEAPON_EXILUS_SLOT_INDEX;
                    return (
                      <ModSlotCard
                        key={i}
                        mod={mod}
                        rank={equipped?.rank ?? 0}
                        slotIndex={i}
                        label={isExilus ? (isTomeWeapon(selectedWeapon.id) ? "Canticle" : "Exilus") : undefined}
                        slotPolarity={slotPolarities[i]}
                        rivenStats={rivenStatsMap[i]}
                        weaponCategory={selectedWeapon.category}
                        onAdd={() => handleOpenModPicker(i)}
                        onRemove={() => handleRemoveMod(i)}
                        onPolarize={(p) => setSlotPolarities((prev) => { const next = { ...prev }; if (p) next[i] = p; else delete next[i]; return next; })}
                        onEditRiven={() => handleOpenModPicker(i)}
                      />
                    );
                  })}
                </div>

                {/* Stance Mod (melee only) */}
                {selectedWeapon.category === "melee" && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3">STANCE</h2>
                    {stanceMod ? (
                      <div className="relative border border-amber-500/30 rounded-lg p-3 bg-amber-500/5">
                        <button
                          onClick={() => setStanceMod(null)}
                          className="absolute top-1 right-1 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{stanceMod.name}</span>
                          <span className="text-[10px] text-amber-400">
                            +{Math.abs(modCapacityAtRank(stanceMod.drain, stanceMod.maxRank))} capacity
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                          {stanceMod.description.replace(/<[^>]+>/g, "").substring(0, 60)}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setStancePickerOpen(true)}
                        className="w-full h-14 border border-dashed border-amber-500/30 rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Add Stance</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Weapon Arcanes */}
                {(() => {
                  const arcaneConfig = getWeaponArcanes(selectedWeapon);
                  if (arcaneConfig.slots === 0) return null;
                  return (
                    <div className="mt-6">
                      <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Gem className="h-4 w-4 text-purple-400" />
                        ARCANES
                      </h2>
                      <div className={cn("grid gap-2", arcaneConfig.slots === 2 ? "grid-cols-2" : "grid-cols-1")}>
                        {Array.from({ length: arcaneConfig.slots }).map((_, i) => (
                          <ArcaneSlotCard
                            key={i}
                            arcane={equippedArcanes[i]}
                            rank={equippedArcanes[i]?.maxRank ?? 0}
                            label={`${arcaneConfig.label} ${arcaneConfig.slots > 1 ? i + 1 : ""}`}
                            onAdd={() => { setActiveArcaneSlot(i); setArcanePickerOpen(true); }}
                            onRemove={() => setEquippedArcanes((prev) => { const next = [...prev]; next[i] = null; return next; })}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Incarnon Evolutions */}
                {isIncarnon && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      INCARNON EVOLUTIONS
                    </h2>
                    {incarnonData ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((tier) => {
                          const choices = incarnonData.evolutions.filter((e) => e.tier === tier);
                          if (choices.length === 0) return null;
                          const selected = selectedEvolutions[tier];
                          return (
                            <div key={tier} className="border border-border rounded-lg p-3">
                              <span className="text-[10px] font-semibold text-orange-400 tracking-wider">EVOLUTION {tier}</span>
                              <div className="flex gap-2 mt-1.5">
                                {choices.map((evo) => (
                                  <button
                                    key={evo.slot}
                                    onClick={() => setSelectedEvolutions((prev) => ({ ...prev, [tier]: evo.slot }))}
                                    className={cn(
                                      "flex-1 text-left p-2 rounded-lg border text-[10px] transition-all",
                                      selected === evo.slot
                                        ? "border-orange-500/50 bg-orange-500/10 text-orange-900 dark:text-orange-300"
                                        : "border-border text-muted-foreground hover:border-orange-500/30"
                                    )}
                                  >
                                    <span className="font-medium block">{evo.name}</span>
                                    <span className="text-[9px] opacity-70">{evo.description}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-4 text-center">
                        Incarnon evolution data not yet available for this weapon.
                        <br />
                        <span className="text-[10px]">Evolution data is being added — check back soon.</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Build Description */}
                <div className="mt-6">
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
                <WeaponStatsPanel
                  stats={calculatedStats}
                  baseStats={baseStats}
                  weapon={selectedWeapon}
                  isMelee={selectedWeapon?.category === 'melee' || selectedWeapon?.triggerType === 'Melee'}
                  selectedEvolutions={isIncarnon ? selectedEvolutions : undefined}
                  allEvolutions={incarnonData?.evolutions}
                  simParams={simParams}
                  onSimParamsChange={setSimParams}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <ModPicker
        open={modPickerOpen}
        onClose={() => setModPickerOpen(false)}
        mods={allMods}
        category={modCategory}
        slotType={modPickerSlotType}
        equippedModIds={equippedModIds}
        onSelect={handleSelectMod}
        onSelectRiven={handleSelectRiven}
        weaponCategory={selectedWeapon?.category}
        weapon={selectedWeapon ?? undefined}
      />

      {/* Weapon Arcane Picker */}
      {selectedWeapon && (
        <ArcanePicker
          open={arcanePickerOpen}
          onOpenChange={setArcanePickerOpen}
          arcanes={getWeaponArcanes(selectedWeapon).arcanes}
          equippedArcaneIds={equippedArcanes.filter(Boolean).map((a) => a!.id)}
          onSelect={(arcane) => {
            setEquippedArcanes((prev) => {
              const next = [...prev];
              next[activeArcaneSlot] = arcane;
              return next;
            });
            setArcanePickerOpen(false);
          }}
          title={`Select ${getWeaponArcanes(selectedWeapon).label}`}
        />
      )}

      {/* Stance Mod Picker */}
      {selectedWeapon && selectedWeapon.category === "melee" && stancePickerOpen && (
        <Dialog open={stancePickerOpen} onOpenChange={setStancePickerOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Select Stance Mod</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stances..."
                  value={stanceSearch}
                  onChange={(e) => setStanceSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
              <div className="space-y-4">
                {Object.entries(
                  allMods
                    .filter((m) => m.category === "stance")
                    .filter((m) => {
                      // Filter stances to match the selected weapon's stanceType
                      if (selectedWeapon?.stanceType) {
                        const stanceType = STANCE_WEAPON_TYPE[m.id];
                        if (stanceType && stanceType !== selectedWeapon.stanceType) return false;
                      }
                      return true;
                    })
                    .filter((m) => !stanceSearch.trim() || m.name.toLowerCase().includes(stanceSearch.toLowerCase()))
                    .reduce<Record<string, typeof allMods>>((groups, mod) => {
                      const type = STANCE_WEAPON_TYPE[mod.id] || "other";
                      const label = MELEE_TYPE_LABELS[type] || "Other";
                      if (!groups[label]) groups[label] = [];
                      groups[label].push(mod);
                      return groups;
                    }, {})
                )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([type, mods]) => (
                    <div key={type}>
                      <h3 className="text-[10px] font-semibold tracking-wider text-amber-400/70 uppercase mb-1">{type}</h3>
                      <div className="space-y-1">
                        {mods.map((mod) => (
                          <button
                            key={mod.id}
                            onClick={() => { setStanceMod(mod); setStancePickerOpen(false); setStanceSearch(""); }}
                            className="w-full text-left p-2.5 rounded-lg border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{mod.name}</span>
                              <PolarityIcon polarity={mod.polarity} size={14} />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{mod.description.replace(/<[^>]+>/g, "").substring(0, 80)}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Saved Builds Dialog */}
      <Dialog open={showSavedBuilds} onOpenChange={setShowSavedBuilds}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle>Saved Weapon Builds</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {savedBuilds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No saved builds yet. Build a weapon and click Save!</p>
            ) : (
              <div className="space-y-2">
                {savedBuilds.map((build) => {
                  const d = build.data as WeaponBuildData;
                  const weapon = allWeapons.find((w) => w.id === d.weaponId);
                  return (
                    <div key={build.id} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-cyan-500/30 transition-all">
                      <button
                        onClick={() => handleLoadBuild(build)}
                        className="flex-1 text-left"
                      >
                        <span className="text-sm font-medium">{build.name}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {weapon?.name ?? d.weaponId} • {d.mods.length} mods • {new Date(build.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteBuild(build.id)}
                        className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
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
        defaultName={buildName || (selectedWeapon ? `${selectedWeapon.name} Build` : "Weapon Build")}
        defaultDescription={buildDescription}
        defaultIsPublic={saveDialogDefaultPublic}
        onSave={handleSaveBuildConfirm}
      />
    </PageShell>
  );
}
