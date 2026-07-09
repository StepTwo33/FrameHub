"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageShell, PageMain, PageHero, ContentPanel, EmptyState } from "@/components/page-shell";
import { getLoadouts, saveLoadout, deleteLoadout, generateId, loadoutToBuildData, loadoutFromSavedBuild } from "@/lib/loadouts";
import {
  generateBuildId,
  saveCloudBuild,
  getSavedBuilds,
  SavedBuild,
  WarframeBuildData,
  WeaponBuildData,
  CompanionBuildData,
  ModularBuildData,
} from "@/lib/build-storage";
import { SaveBuildDialog, type SaveBuildDialogValues } from "@/components/save-build-dialog";
import {
  useCloudBuildFromUrl,
  setCloudBuildInUrl,
  markCloudBuildLoaded,
} from "@/lib/use-cloud-build-from-url";
import { Loadout, EquippedArchonShard } from "@/lib/types";
import { modularBuildDisplayName, modularBuildMatchesLoadoutSlot } from "@/lib/modular-resolve";
import type { LoadoutWeaponSlot } from "@/lib/modular-resolve";
import { allWarframes } from "@/data/warframes";
import { allCompanions } from "@/data/companions";
import { useWeapons } from "@/lib/use-data";
import type { Weapon } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Swords,
  Shield,
  Dog,
  Crosshair,
  Search,
  ExternalLink,
  Copy,
  Info,
  Library,
  Sparkles,
  Wrench,
  FolderOpen,
  Save,
  Share2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getWarframeImage, getWeaponImage, getCompanionImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";
import { toast } from "sonner";
import { LoadoutDamagePanel } from "@/components/loadout-damage-panel";
import { dualFormModCountSummary, emptyDualFormBuilds, isDualFormWarframe } from "@/lib/dual-form-warframes";

type SlotType = "warframe" | "primary" | "secondary" | "melee" | "companion";

const SLOT_CONFIG: Record<SlotType, { label: string; color: string; builderPath: string }> = {
  warframe: { label: "Warframe", color: "purple", builderPath: "/warframe-builder" },
  primary: { label: "Primary", color: "blue", builderPath: "/weapon-builder" },
  secondary: { label: "Secondary", color: "cyan", builderPath: "/weapon-builder" },
  melee: { label: "Melee", color: "orange", builderPath: "/weapon-builder" },
  companion: { label: "Companion", color: "green", builderPath: "/companion-builder" },
};

/** Tailwind cannot compile dynamic `border-${color}` — use explicit classes. */
const SLOT_CARD_STYLES: Record<SlotType, string> = {
  warframe: "border-purple-500/35 bg-purple-500/[0.07]",
  primary: "border-blue-500/35 bg-blue-500/[0.07]",
  secondary: "border-cyan-500/35 bg-cyan-500/[0.07]",
  melee: "border-orange-500/35 bg-orange-500/[0.07]",
  companion: "border-green-500/35 bg-green-500/[0.07]",
};

const SLOT_ICONS: Record<SlotType, React.ReactNode> = {
  warframe: <Shield className="h-4 w-4" />,
  primary: <Crosshair className="h-4 w-4" />,
  secondary: <Crosshair className="h-4 w-4" />,
  melee: <Swords className="h-4 w-4" />,
  companion: <Dog className="h-4 w-4" />,
};

const EMPTY_SHARDS: (EquippedArchonShard | null)[] = [null, null, null, null, null];

function pickerSlotToWeaponSlot(slot: SlotType): LoadoutWeaponSlot | null {
  if (slot === "primary" || slot === "secondary" || slot === "melee") return slot;
  return null;
}

function getWeaponSlotPayload(
  loadout: Loadout,
  w: LoadoutWeaponSlot,
): { kind: "weapon"; weaponId: string } | { kind: "modular"; data: ModularBuildData & { slot: LoadoutWeaponSlot } } | null {
  if (loadout.modularBuild?.slot === w) {
    return { kind: "modular", data: loadout.modularBuild };
  }
  const weaponId =
    w === "primary"
      ? loadout.primaryBuild?.weaponId
      : w === "secondary"
        ? loadout.secondaryBuild?.weaponId
        : loadout.meleeBuild?.weaponId;
  if (!weaponId) return null;
  return { kind: "weapon", weaponId };
}

function getSlotLabelName(loadout: Loadout, slot: SlotType, weaponsMap: Map<string, Weapon>): string | null {
  switch (slot) {
    case "warframe": {
      const id = loadout.warframeBuild?.warframeId;
      return id ? allWarframes.find((w) => w.id === id)?.name ?? id : null;
    }
    case "companion": {
      const id = loadout.companionBuild?.companionId;
      return id ? allCompanions.find((c) => c.id === id)?.name ?? id : null;
    }
    case "primary":
    case "secondary":
    case "melee": {
      const w = pickerSlotToWeaponSlot(slot);
      if (!w) return null;
      const p = getWeaponSlotPayload(loadout, w);
      if (!p) return null;
      if (p.kind === "modular") return modularBuildDisplayName(p.data);
      return weaponsMap.get(p.weaponId)?.name ?? p.weaponId;
    }
  }
}

function getSlotModCount(loadout: Loadout, slot: SlotType): number {
  switch (slot) {
    case "warframe": {
      const wb = loadout.warframeBuild;
      if (!wb) return 0;
      if (isDualFormWarframe(wb.warframeId)) {
        const primary = wb.mods?.length ?? 0;
        const secondary = Object.values(wb.dualFormBuilds ?? {}).reduce(
          (sum, s) => sum + (s.mods?.length ?? 0),
          0,
        );
        return primary + secondary;
      }
      return wb.mods?.length ?? 0;
    }
    case "companion":
      return (loadout.companionBuild?.mods?.length ?? 0) + (loadout.companionBuild?.weaponMods?.length ?? 0);
    case "primary":
    case "secondary":
    case "melee": {
      const w = pickerSlotToWeaponSlot(slot);
      if (!w) return 0;
      const p = getWeaponSlotPayload(loadout, w);
      if (!p) return 0;
      if (p.kind === "modular") {
        const mods = p.data.mods?.length ?? 0;
        const arcanes = p.data.arcaneIds?.filter(Boolean).length ?? 0;
        return mods + arcanes;
      }
      const build =
        w === "primary" ? loadout.primaryBuild : w === "secondary" ? loadout.secondaryBuild : loadout.meleeBuild;
      return build?.mods?.length ?? 0;
    }
  }
}

function getSlotModLabel(loadout: Loadout, slot: SlotType): string {
  if (slot === "warframe" && loadout.warframeBuild && isDualFormWarframe(loadout.warframeBuild.warframeId)) {
    return dualFormModCountSummary(loadout.warframeBuild as WarframeBuildData);
  }
  const count = getSlotModCount(loadout, slot);
  return `${count} mod${count === 1 ? "" : "s"} filled`;
}

function getSlotImage(slot: SlotType, name: string, weaponsMap: Map<string, Weapon>): string {
  switch (slot) {
    case "warframe":
      return getWarframeImage(name);
    case "primary":
    case "secondary":
    case "melee": {
      const w = [...weaponsMap.values()].find((x) => x.name === name);
      return getWeaponImage(name, w ? { category: w.category } : undefined);
    }
    case "companion":
      return getCompanionImage(name);
  }
}

function getWeaponCategories(slot: SlotType): string[] {
  switch (slot) {
    case "primary":
      return ["primary", "rifle", "shotgun", "bow", "launcher"];
    case "secondary":
      return ["secondary", "pistol", "dual_pistols"];
    case "melee":
      return ["melee"];
    default:
      return [];
  }
}

function listSavedBuildsForSlot(slot: SlotType, weaponsMap: Map<string, Weapon>): SavedBuild[] {
  const all = getSavedBuilds();
  if (slot === "warframe") return all.filter((b) => b.type === "warframe");
  if (slot === "companion") return all.filter((b) => b.type === "companion");
  const cats = getWeaponCategories(slot);
  return all.filter((b) => {
    if (b.type !== "weapon") return false;
    const d = b.data as WeaponBuildData;
    const w = weaponsMap.get(d.weaponId);
    return !!w && cats.includes(w.category);
  });
}

function listModularBuildsForWeaponSlot(slot: SlotType): SavedBuild[] {
  const ws = pickerSlotToWeaponSlot(slot);
  if (!ws) return [];
  return getSavedBuilds("modular").filter((b) => {
    if (b.type !== "modular") return false;
    return modularBuildMatchesLoadoutSlot(b.data as ModularBuildData, ws);
  });
}

function normalizeWarframeBuild(d: WarframeBuildData): NonNullable<Loadout["warframeBuild"]> {
  const shards =
    d.shards && d.shards.length === 5 ? d.shards : ([...EMPTY_SHARDS] as (EquippedArchonShard | null)[]);
  return {
    ...d,
    shards,
    arcaneIds: d.arcaneIds ?? [null, null],
    slotPolarities: d.slotPolarities ?? {},
    exaltedMods: d.exaltedMods ?? [],
    exaltedSlotPolarities: d.exaltedSlotPolarities ?? {},
    exaltedArcaneIds: d.exaltedArcaneIds ?? [null, null],
    dualFormBuilds: d.dualFormBuilds,
  };
}

export default function LoadoutsPage() {
  const weapons = useWeapons();
  const weaponsMap = useMemo(() => new Map(weapons.map((w) => [w.id, w])), [weapons]);
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<SlotType>("warframe");
  const [pickerLoadoutId, setPickerLoadoutId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerTab, setPickerTab] = useState<"saved" | "catalog" | "modular">("catalog");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogLoadoutId, setSaveDialogLoadoutId] = useState<string | null>(null);
  const [saveDialogDefaultPublic, setSaveDialogDefaultPublic] = useState(false);
  const [shareCopiedId, setShareCopiedId] = useState<string | null>(null);

  const saveDialogLoadout = useMemo(
    () => (saveDialogLoadoutId ? loadouts.find((l) => l.id === saveDialogLoadoutId) ?? null : null),
    [loadouts, saveDialogLoadoutId],
  );

  useEffect(() => {
    queueMicrotask(() => setLoadouts(getLoadouts()));
  }, []);

  const refresh = useCallback(() => setLoadouts(getLoadouts()), []);

  const applyCloudLoadout = useCallback(
    (build: SavedBuild, options?: { silent?: boolean }) => {
      const imported = loadoutFromSavedBuild(build);
      const existing = getLoadouts().find((l) => l.cloudId === build.id || l.id === build.id);
      const loadout: Loadout = existing
        ? { ...imported, id: existing.id, cloudId: build.id }
        : imported;
      saveLoadout(loadout);
      refresh();
      if (!options?.silent) {
        toast.success(`Loaded “${build.name}”`, { description: "Loadout updated from your account." });
      }
    },
    [refresh],
  );

  useCloudBuildFromUrl("loadout", (build) => applyCloudLoadout(build, { silent: true }));

  const handleOpenSaveDialog = useCallback((loadoutId: string, defaultPublic = false) => {
    setSaveDialogLoadoutId(loadoutId);
    setSaveDialogDefaultPublic(defaultPublic);
    setSaveDialogOpen(true);
  }, []);

  const handleSaveLoadoutConfirm = useCallback(
    async ({ name, description, isPublic }: SaveBuildDialogValues) => {
      if (!saveDialogLoadoutId) return;
      const loadout = loadouts.find((l) => l.id === saveDialogLoadoutId);
      if (!loadout) return;

      const build: SavedBuild = {
        id: loadout.cloudId || generateBuildId(),
        name,
        description,
        isPublic,
        type: "loadout",
        createdAt: loadout.createdAt,
        updatedAt: Date.now(),
        data: loadoutToBuildData(loadout),
      };

      const cloudResult = await saveCloudBuild(build);
      if (!cloudResult) {
        toast.error("Could not save loadout", { description: "Sign in to save loadouts to your account." });
        return;
      }

      const updated: Loadout = {
        ...loadout,
        name,
        description,
        isPublic: cloudResult.isPublic ?? isPublic,
        cloudId: cloudResult.id,
        updatedAt: Date.now(),
      };
      saveLoadout(updated);
      refresh();
      setCloudBuildInUrl(cloudResult.id);
      markCloudBuildLoaded(cloudResult.id);
      toast.success("Loadout saved", {
        description: isPublic ? "Listed in Community Builds." : "Saved to your account.",
      });
    },
    [saveDialogLoadoutId, loadouts, refresh],
  );

  const handleShareLoadout = useCallback(
    async (loadout: Loadout) => {
      if (loadout.isPublic && loadout.cloudId) {
        const url = `${window.location.origin}/build/${loadout.cloudId}`;
        await navigator.clipboard.writeText(url);
        setShareCopiedId(loadout.id);
        setTimeout(() => setShareCopiedId(null), 2000);
        toast.success("Share link copied!", { description: "Anyone can view and upvote this loadout." });
        return;
      }

      if (loadout.cloudId) {
        const url = `${window.location.origin}/loadouts?buildId=${encodeURIComponent(loadout.cloudId)}`;
        await navigator.clipboard.writeText(url);
        setShareCopiedId(loadout.id);
        setTimeout(() => setShareCopiedId(null), 2000);
        toast.success("Share link copied!", { description: "Private link — only you can open it when signed in." });
        return;
      }

      handleOpenSaveDialog(loadout.id, true);
      toast.info("Save to share", { description: "Save to your account first, then copy a share link." });
    },
    [handleOpenSaveDialog],
  );

  const handleCreate = useCallback(() => {
    const list = getLoadouts();
    const newLoadout: Loadout = {
      id: generateId(),
      name: `Loadout ${list.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveLoadout(newLoadout);
    refresh();
    toast.success("Loadout created", { description: "Add frames and weapons using the slots below." });
  }, [refresh]);

  const handleDuplicate = useCallback(
    (loadout: Loadout) => {
      const copy: Loadout = {
        ...JSON.parse(JSON.stringify(loadout)) as Loadout,
        id: generateId(),
        name: `${loadout.name} (copy)`,
        cloudId: undefined,
        isPublic: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveLoadout(copy);
      refresh();
      toast.success("Loadout duplicated");
    },
    [refresh]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Delete this loadout permanently?")) return;
      deleteLoadout(id);
      refresh();
      toast.success("Loadout deleted");
    },
    [refresh]
  );

  const handleStartEdit = useCallback((loadout: Loadout) => {
    setEditingId(loadout.id);
    setEditName(loadout.name);
  }, []);

  const handleSaveEdit = useCallback(
    (id: string) => {
      const loadout = loadouts.find((l) => l.id === id);
      if (loadout && editName.trim()) {
        saveLoadout({ ...loadout, name: editName.trim() });
        refresh();
        toast.success("Name updated");
      }
      setEditingId(null);
    },
    [loadouts, editName, refresh]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
  }, []);

  const handleOpenPicker = useCallback((loadoutId: string, slot: SlotType) => {
    setPickerLoadoutId(loadoutId);
    setPickerSlot(slot);
    setPickerSearch("");
    const saved = listSavedBuildsForSlot(slot, weaponsMap);
    const modular = listModularBuildsForWeaponSlot(slot);
    if (saved.length > 0) setPickerTab("saved");
    else if (modular.length > 0) setPickerTab("modular");
    else setPickerTab("catalog");
    setPickerOpen(true);
  }, [weaponsMap]);

  const handlePickCatalogItem = useCallback(
    (itemId: string) => {
      if (!pickerLoadoutId) return;
      const loadout = loadouts.find((l) => l.id === pickerLoadoutId);
      if (!loadout) return;

      const updated = { ...loadout };
      switch (pickerSlot) {
        case "warframe":
          updated.warframeBuild = {
            warframeId: itemId,
            mods: [],
            shards: [...EMPTY_SHARDS],
            arcaneIds: [null, null],
            hasOrokinReactor: false,
            isMR30: false,
            slotPolarities: {},
            exaltedMods: [],
            exaltedSlotPolarities: {},
            dualFormBuilds: emptyDualFormBuilds(itemId),
          };
          break;
        case "primary":
        case "secondary":
        case "melee":
          {
            const ws = pickerSlotToWeaponSlot(pickerSlot);
            if (ws && updated.modularBuild?.slot === ws) delete updated.modularBuild;
            const weaponShell: NonNullable<Loadout["primaryBuild"]> = {
              weaponId: itemId,
              mods: [],
              arcaneIds: [null, null],
              hasOrokinCatalyst: false,
              isMR30: false,
              slotPolarities: {},
            };
            if (pickerSlot === "primary") updated.primaryBuild = weaponShell;
            else if (pickerSlot === "secondary") updated.secondaryBuild = weaponShell;
            else updated.meleeBuild = weaponShell;
          }
          break;
        case "companion":
          updated.companionBuild = {
            companionId: itemId,
            mods: [],
            weaponMods: [],
            arcaneIds: [null, null],
            hasReactor: false,
            hasCatalyst: false,
            isMR30: false,
            slotPolarities: {},
          };
          break;
      }
      saveLoadout(updated);
      refresh();
      setPickerOpen(false);
      toast.success(`${SLOT_CONFIG[pickerSlot].label} added`, {
        description: "Empty build — attach a saved build or configure in the builder.",
      });
    },
    [pickerLoadoutId, pickerSlot, loadouts, refresh]
  );

  const handleAttachSavedBuild = useCallback(
    (build: SavedBuild) => {
      if (!pickerLoadoutId) return;
      const loadout = loadouts.find((l) => l.id === pickerLoadoutId);
      if (!loadout) return;

      const updated = { ...loadout };

      if (pickerSlot === "warframe" && build.type === "warframe") {
        updated.warframeBuild = normalizeWarframeBuild(build.data as WarframeBuildData);
      } else if (pickerSlot === "companion" && build.type === "companion") {
        const d = build.data as CompanionBuildData & { hasCatalyst?: boolean };
        updated.companionBuild = {
          ...d,
          arcaneIds: d.arcaneIds ?? [null, null],
          slotPolarities: d.slotPolarities ?? {},
          weaponMods: d.weaponMods ?? [],
          hasCatalyst: d.hasCatalyst ?? false,
        };
      } else if (["primary", "secondary", "melee"].includes(pickerSlot) && build.type === "weapon") {
        const d = build.data as WeaponBuildData;
        const w = weaponsMap.get(d.weaponId);
        if (!w || !getWeaponCategories(pickerSlot).includes(w.category)) {
          toast.error("This saved build does not match this weapon slot.");
          return;
        }
        const ws = pickerSlotToWeaponSlot(pickerSlot);
        if (ws && updated.modularBuild?.slot === ws) delete updated.modularBuild;
        const payload: NonNullable<Loadout["primaryBuild"]> = {
          ...d,
          arcaneIds: d.arcaneIds ?? [null, null],
          slotPolarities: d.slotPolarities ?? {},
        };
        if (pickerSlot === "primary") updated.primaryBuild = payload;
        else if (pickerSlot === "secondary") updated.secondaryBuild = payload;
        else updated.meleeBuild = payload;
      } else {
        toast.error("Incompatible saved build for this slot.");
        return;
      }

      saveLoadout(updated);
      refresh();
      setPickerOpen(false);
      toast.success(`Attached “${build.name}”`, { description: SLOT_CONFIG[pickerSlot].label });
    },
    [pickerLoadoutId, pickerSlot, loadouts, refresh, weaponsMap]
  );

  const handleAttachModularBuild = useCallback(
    (build: SavedBuild) => {
      if (!pickerLoadoutId || build.type !== "modular") return;
      const ws = pickerSlotToWeaponSlot(pickerSlot);
      if (!ws) return;
      const data = build.data as ModularBuildData;
      if (!modularBuildMatchesLoadoutSlot(data, ws)) {
        toast.error("This modular build does not fit this weapon slot.");
        return;
      }
      const loadout = loadouts.find((l) => l.id === pickerLoadoutId);
      if (!loadout) return;
      const updated: Loadout = {
        ...loadout,
        modularBuild: { ...data, slot: ws },
        updatedAt: Date.now(),
      };
      if (ws === "primary") delete updated.primaryBuild;
      if (ws === "secondary") delete updated.secondaryBuild;
      if (ws === "melee") delete updated.meleeBuild;
      saveLoadout(updated);
      refresh();
      setPickerOpen(false);
      toast.success(`Attached “${build.name}”`, { description: `${SLOT_CONFIG[pickerSlot].label} (modular)` });
    },
    [pickerLoadoutId, pickerSlot, loadouts, refresh]
  );

  const handleClearSlot = useCallback(
    (loadoutId: string, slot: SlotType) => {
      if (!confirm(`Remove ${SLOT_CONFIG[slot].label} from this loadout?`)) return;
      const loadout = loadouts.find((l) => l.id === loadoutId);
      if (!loadout) return;
      const updated = { ...loadout };
      switch (slot) {
        case "warframe":
          delete updated.warframeBuild;
          break;
        case "primary":
          if (loadout.modularBuild?.slot === "primary") delete updated.modularBuild;
          else delete updated.primaryBuild;
          break;
        case "secondary":
          if (loadout.modularBuild?.slot === "secondary") delete updated.modularBuild;
          else delete updated.secondaryBuild;
          break;
        case "melee":
          if (loadout.modularBuild?.slot === "melee") delete updated.modularBuild;
          else delete updated.meleeBuild;
          break;
        case "companion":
          delete updated.companionBuild;
          break;
      }
      saveLoadout(updated);
      refresh();
      toast.info(`${SLOT_CONFIG[slot].label} cleared`);
    },
    [loadouts, refresh]
  );

  const pickerCatalogItems = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    if (pickerSlot === "warframe") {
      return allWarframes
        .filter((w) => !q || w.name.toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((w) => ({ id: w.id, name: w.name, detail: `HP ${w.health} • SH ${w.shield} • AR ${w.armor}` }));
    }
    if (pickerSlot === "companion") {
      return allCompanions
        .filter((c) => !q || c.name.toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({ id: c.id, name: c.name, detail: `${c.type} • HP ${c.health}` }));
    }
    const cats = getWeaponCategories(pickerSlot);
    return weapons
      .filter((w) => cats.includes(w.category))
      .filter((w) => !q || w.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((w) => ({
        id: w.id,
        name: w.name,
        detail: `DMG ${w.damage} • CC ${(w.criticalChance * 100).toFixed(0)}% • SC ${(w.statusChance * 100).toFixed(0)}%`,
      }));
  }, [pickerSlot, pickerSearch, weapons]);

  const pickerSavedBuilds = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    return listSavedBuildsForSlot(pickerSlot, weaponsMap).filter((b) => {
      if (!q) return true;
      if (b.name.toLowerCase().includes(q)) return true;
      if (b.type === "warframe") {
        const wf = allWarframes.find((w) => w.id === (b.data as WarframeBuildData).warframeId);
        return wf?.name.toLowerCase().includes(q);
      }
      if (b.type === "weapon") {
        const w = weaponsMap.get((b.data as WeaponBuildData).weaponId);
        return w?.name.toLowerCase().includes(q);
      }
      if (b.type === "companion") {
        const c = allCompanions.find((x) => x.id === (b.data as CompanionBuildData).companionId);
        return c?.name.toLowerCase().includes(q);
      }
      return false;
    });
  }, [pickerSlot, pickerSearch, weaponsMap]);

  const pickerModularBuilds = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    return listModularBuildsForWeaponSlot(pickerSlot).filter((b) => {
      if (!q) return true;
      if (b.name.toLowerCase().includes(q)) return true;
      const d = b.data as ModularBuildData;
      return modularBuildDisplayName(d).toLowerCase().includes(q);
    });
  }, [pickerSlot, pickerSearch]);

  const savedCount = pickerSavedBuilds.length;
  const modularCount = pickerModularBuilds.length;
  const showModularTab = pickerSlot === "primary" || pickerSlot === "secondary" || pickerSlot === "melee";

  return (
    <PageShell>
      <PageMain maxWidth="lg">
        <PageHero
          icon={FolderOpen}
          accent="green"
          title="Loadouts"
          description="Group a warframe, weapons (including kitguns, zaws, and amps from the Modular tab), and a companion into one kit."
          actions={
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New loadout
            </button>
          }
        />

        <ContentPanel className="mb-6">
          <div className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
            <div className="space-y-1.5">
              <p>
                <span className="font-medium text-foreground">1.</span> Save builds in Warframe / Weapon / Companion
                builders (Load button lists them here).
              </p>
              <p>
                <span className="font-medium text-foreground">2.</span> Weapon slots also have a <strong>Modular</strong>{" "}
                tab for saved kitgun / zaw / amp builds.
              </p>
              <p>
                <span className="font-medium text-foreground">3.</span> Save to your account to sync across devices. Enable{" "}
                <strong>List in Community Builds</strong> to share publicly on Discover.
              </p>
            </div>
          </div>
        </ContentPanel>

        {loadouts.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No loadouts yet"
            description="Create one, then attach saved builds from your builders for a full kit in one place."
          >
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create first loadout
            </button>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {loadouts.map((loadout) => (
              <ContentPanel key={loadout.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    {editingId === loadout.id ? (
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(loadout.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="max-w-xs h-9 text-sm"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(loadout.id)}
                          className="p-2 rounded-lg hover:bg-green-500/10 text-green-400"
                          aria-label="Save name"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                          aria-label="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-lg font-semibold truncate">{loadout.name}</h2>
                        {loadout.isPublic && (
                          <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                            Public
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(loadout)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground shrink-0"
                          aria-label="Rename loadout"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground tabular-nums mr-2">
                        Updated {new Date(loadout.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenSaveDialog(loadout.id)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Save to account"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareLoadout(loadout)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Copy share link"
                      >
                        {shareCopiedId === loadout.id ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </button>
                      {loadout.cloudId && (
                        <a
                          href={`/build/${loadout.cloudId}`}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View build page"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(loadout)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Duplicate loadout"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(loadout.id)}
                        className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete loadout"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {(["warframe", "primary", "secondary", "melee", "companion"] as SlotType[]).map((slot) => {
                      const cfg = SLOT_CONFIG[slot];
                      const itemName = getSlotLabelName(loadout, slot, weaponsMap);
                      const ws = pickerSlotToWeaponSlot(slot);
                      const isModularSlot = ws && getWeaponSlotPayload(loadout, ws)?.kind === "modular";
                      const cardStyle = SLOT_CARD_STYLES[slot];

                      if (!itemName) {
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleOpenPicker(loadout.id, slot)}
                            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border/80 hover:border-primary/45 hover:bg-primary/5 transition-all text-left group min-h-[100px]"
                          >
                            <span className="text-muted-foreground/60 group-hover:text-primary">{SLOT_ICONS[slot]}</span>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground block">
                                {cfg.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground/50">Add frame, weapon, or companion</span>
                            </div>
                          </button>
                        );
                      }

                      return (
                        <div key={slot} className={cn("relative rounded-xl border p-4 flex flex-col gap-2 min-h-[100px]", cardStyle)}>
                          <div className="flex items-start gap-2.5">
                            {isModularSlot ? (
                              <span className="w-10 h-10 rounded-md flex items-center justify-center bg-amber-500/15 border border-amber-500/30 shrink-0">
                                <Wrench className="h-5 w-5 text-amber-400/90" aria-hidden />
                              </span>
                            ) : (
                            <GameAssetImage
                              src={getSlotImage(slot, itemName ?? "", weaponsMap)}
                              alt=""
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-md object-contain bg-background/40 border border-border/30 shrink-0"
                              hideOnError
                            />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                                {cfg.label}
                              </span>
                              <span className="text-sm font-semibold truncate block leading-tight">{itemName}</span>
                              <span className="text-[11px] text-muted-foreground mt-0.5">
                                {getSlotModLabel(loadout, slot)}
                                {isModularSlot ? " • Modular" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-auto pt-1">
                            <a
                              href={isModularSlot ? "/modular-builder" : cfg.builderPath}
                              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg bg-background/60 border border-border/60 hover:border-primary/35 hover:text-primary transition-colors"
                            >
                              Open builder <ExternalLink className="h-3 w-3 opacity-70" />
                            </a>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenPicker(loadout.id, slot)}
                                className="text-xs py-1.5 rounded-lg border border-border/60 hover:bg-background/80 transition-colors"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClearSlot(loadout.id, slot)}
                                className="text-xs py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <LoadoutDamagePanel loadout={loadout} />
                </ContentPanel>
              ))}
            </div>
          )}
      </PageMain>

      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setPickerLoadoutId(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 sm:max-w-lg">
          <DialogHeader className="p-5 pb-0 shrink-0">
            <DialogTitle className="text-left">Fill {SLOT_CONFIG[pickerSlot]?.label} slot</DialogTitle>
            <p className="text-xs text-muted-foreground text-left font-normal pt-1">
              Saved builds include mods and settings from each builder. Catalog adds the item with an empty build.
            </p>
          </DialogHeader>

          <div className="px-5 pt-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search…"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <Tabs
            value={pickerTab}
            onValueChange={(v) => setPickerTab(v as "saved" | "catalog" | "modular")}
            className="flex flex-col flex-1 min-h-0 px-5 pb-5 pt-3"
          >
            <TabsList className={cn("w-full mb-3 shrink-0 h-9 grid", showModularTab ? "grid-cols-3" : "grid-cols-2")}>
              <TabsTrigger value="saved" className="gap-1.5 text-xs sm:text-sm">
                <Library className="h-3.5 w-3.5" />
                <span className="truncate">Saved</span>
                {savedCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary/15 text-primary px-1.5 py-0 text-[10px] tabular-nums">
                    {savedCount}
                  </span>
                )}
              </TabsTrigger>
              {showModularTab && (
                <TabsTrigger value="modular" className="gap-1.5 text-xs sm:text-sm">
                  <Wrench className="h-3.5 w-3.5" />
                  <span className="truncate">Modular</span>
                  {modularCount > 0 && (
                    <span className="ml-0.5 rounded-full bg-amber-500/15 text-amber-400 px-1.5 py-0 text-[10px] tabular-nums">
                      {modularCount}
                    </span>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger value="catalog" className="gap-1.5 text-xs sm:text-sm">
                <Crosshair className="h-3.5 w-3.5" />
                Catalog
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col">
              <ScrollArea className="h-[min(50vh,360px)] pr-3">
                {pickerSavedBuilds.length === 0 ? (
                  <div className="text-center py-10 px-2 text-sm text-muted-foreground">
                    <p className="mb-2">No matching saved builds for this slot.</p>
                    <p className="text-xs">
                      Save a build in the {SLOT_CONFIG[pickerSlot].label} builder, then return here — or use the Catalog
                      tab to start from a blank item.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 pr-1">
                    {pickerSavedBuilds.map((build) => {
                      let subtitle = "";
                      let modTotal = 0;
                      if (build.type === "warframe") {
                        const d = build.data as WarframeBuildData;
                        subtitle = allWarframes.find((w) => w.id === d.warframeId)?.name ?? d.warframeId;
                        modTotal = d.mods?.length ?? 0;
                      } else if (build.type === "weapon") {
                        const d = build.data as WeaponBuildData;
                        subtitle = weaponsMap.get(d.weaponId)?.name ?? d.weaponId;
                        modTotal = d.mods?.length ?? 0;
                      } else if (build.type === "companion") {
                        const d = build.data as CompanionBuildData;
                        subtitle = allCompanions.find((c) => c.id === d.companionId)?.name ?? d.companionId;
                        modTotal = (d.mods?.length ?? 0) + (d.weaponMods?.length ?? 0);
                      }
                      return (
                        <button
                          key={build.id}
                          type="button"
                          onClick={() => handleAttachSavedBuild(build)}
                          className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col gap-0.5"
                        >
                          <span className="text-sm font-medium">{build.name}</span>
                          <span className="text-xs text-muted-foreground">{subtitle}</span>
                          <span className="text-[10px] text-muted-foreground/80">
                            {modTotal} mods • {new Date(build.updatedAt).toLocaleDateString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="catalog" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col">
              <p className="text-[11px] text-muted-foreground mb-2">
                {pickerCatalogItems.length} items — empty mod loadout; use builders to configure, save, then attach from{" "}
                <strong>Saved</strong>.
              </p>
              <ScrollArea className="h-[min(50vh,360px)] pr-3">
                <div className="space-y-1.5 pr-1">
                  {pickerCatalogItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePickCatalogItem(item.id)}
                      className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-3"
                    >
                      <GameAssetImage
                        src={getSlotImage(pickerSlot, item.name, weaponsMap)}
                        alt=""
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-md object-contain bg-muted/30 shrink-0 border border-border/40"
                        hideOnError
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{item.name}</span>
                        <span className="text-xs text-muted-foreground block truncate">{item.detail}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {showModularTab && (
              <TabsContent value="modular" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col">
                <p className="text-[11px] text-muted-foreground mb-2">
                  Kitgun, Zaw, and Amp presets from Modular Builder. Attaching one <strong>replaces</strong> this weapon
                  slot (same as in-game).
                </p>
                <ScrollArea className="h-[min(50vh,360px)] pr-3">
                  {pickerModularBuilds.length === 0 ? (
                    <div className="text-center py-10 px-2 text-sm text-muted-foreground">
                      <p className="mb-2">No modular builds fit this slot.</p>
                      <p className="text-xs">
                        Save a kitgun / zaw / amp in{" "}
                        <a href="/modular-builder" className="text-primary underline">
                          Modular Builder
                        </a>
                        , then return here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 pr-1">
                      {pickerModularBuilds.map((build) => {
                        const d = build.data as ModularBuildData;
                        const subtitle = `${d.modularType} • ${modularBuildDisplayName(d)}`;
                        const modTotal = d.mods?.length ?? 0;
                        return (
                          <button
                            key={build.id}
                            type="button"
                            onClick={() => handleAttachModularBuild(build)}
                            className="w-full text-left p-3 rounded-xl border border-amber-500/20 hover:border-amber-500/45 hover:bg-amber-500/5 transition-all flex flex-col gap-0.5"
                          >
                            <span className="text-sm font-medium">{build.name}</span>
                            <span className="text-xs text-muted-foreground">{subtitle}</span>
                            <span className="text-[10px] text-muted-foreground/80">
                              {modTotal} mods • {new Date(build.updatedAt).toLocaleDateString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <SaveBuildDialog
        open={saveDialogOpen}
        onOpenChange={(open) => {
          setSaveDialogOpen(open);
          if (!open) setSaveDialogLoadoutId(null);
        }}
        defaultName={saveDialogLoadout?.name ?? "Loadout"}
        defaultDescription={saveDialogLoadout?.description ?? ""}
        defaultIsPublic={saveDialogDefaultPublic || (saveDialogLoadout?.isPublic ?? false)}
        title="Save Loadout"
        onSave={handleSaveLoadoutConfirm}
      />
    </PageShell>
  );
}
