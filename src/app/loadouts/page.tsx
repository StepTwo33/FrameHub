"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/header";
import { getLoadouts, saveLoadout, deleteLoadout, generateId } from "@/lib/loadouts";
import { Loadout } from "@/lib/types";
import { allWarframes, warframesMap } from "@/data/warframes";
import { allWeapons, weaponsMap } from "@/data/weapons";
import { allCompanions, companionsMap } from "@/data/companions";
import { useWeapons } from "@/lib/use-data";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Check, X, Swords, Shield, Dog, Crosshair, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWarframeImage, getWeaponImage, getCompanionImage } from "@/lib/images";

type SlotType = "warframe" | "primary" | "secondary" | "melee" | "companion";

const SLOT_CONFIG: Record<SlotType, { label: string; color: string; builderPath: string }> = {
  warframe: { label: "Warframe", color: "purple", builderPath: "/warframe-builder" },
  primary: { label: "Primary", color: "blue", builderPath: "/weapon-builder" },
  secondary: { label: "Secondary", color: "cyan", builderPath: "/weapon-builder" },
  melee: { label: "Melee", color: "orange", builderPath: "/weapon-builder" },
  companion: { label: "Companion", color: "green", builderPath: "/companion-builder" },
};

const SLOT_ICONS: Record<SlotType, React.ReactNode> = {
  warframe: <Shield className="h-4 w-4" />,
  primary: <Crosshair className="h-4 w-4" />,
  secondary: <Crosshair className="h-4 w-4" />,
  melee: <Swords className="h-4 w-4" />,
  companion: <Dog className="h-4 w-4" />,
};

function getSlotItemId(loadout: Loadout, slot: SlotType): string | undefined {
  switch (slot) {
    case "warframe": return loadout.warframeBuild?.warframeId;
    case "primary": return loadout.primaryBuild?.weaponId;
    case "secondary": return loadout.secondaryBuild?.weaponId;
    case "melee": return loadout.meleeBuild?.weaponId;
    case "companion": return loadout.companionBuild?.companionId;
  }
}

function getSlotModCount(loadout: Loadout, slot: SlotType): number {
  switch (slot) {
    case "warframe": return loadout.warframeBuild?.mods?.length ?? 0;
    case "primary": return loadout.primaryBuild?.mods?.length ?? 0;
    case "secondary": return loadout.secondaryBuild?.mods?.length ?? 0;
    case "melee": return loadout.meleeBuild?.mods?.length ?? 0;
    case "companion": return loadout.companionBuild?.mods?.length ?? 0;
  }
}

function getItemName(slot: SlotType, id: string | undefined): string | null {
  if (!id) return null;
  switch (slot) {
    case "warframe": return warframesMap.get(id)?.name ?? id;
    case "primary": case "secondary": case "melee": return weaponsMap.get(id)?.name ?? id;
    case "companion": return companionsMap.get(id)?.name ?? id;
  }
}

function getSlotImage(slot: SlotType, name: string): string {
  switch (slot) {
    case "warframe": return getWarframeImage(name);
    case "primary": case "secondary": case "melee": return getWeaponImage(name);
    case "companion": return getCompanionImage(name);
  }
}

function getWeaponCategories(slot: SlotType): string[] {
  switch (slot) {
    case "primary": return ["primary", "rifle", "shotgun", "bow", "launcher"];
    case "secondary": return ["secondary", "pistol"];
    case "melee": return ["melee"];
    default: return [];
  }
}

export default function LoadoutsPage() {
  const weapons = useWeapons();
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<SlotType>("warframe");
  const [pickerLoadoutId, setPickerLoadoutId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  useEffect(() => {
    setLoadouts(getLoadouts());
  }, []);

  const handleCreate = useCallback(() => {
    const newLoadout: Loadout = {
      id: generateId(),
      name: `Loadout ${loadouts.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveLoadout(newLoadout);
    setLoadouts(getLoadouts());
  }, [loadouts.length]);

  const handleDelete = useCallback((id: string) => {
    deleteLoadout(id);
    setLoadouts(getLoadouts());
  }, []);

  const handleStartEdit = useCallback((loadout: Loadout) => {
    setEditingId(loadout.id);
    setEditName(loadout.name);
  }, []);

  const handleSaveEdit = useCallback((id: string) => {
    const loadout = loadouts.find((l) => l.id === id);
    if (loadout && editName.trim()) {
      saveLoadout({ ...loadout, name: editName.trim() });
      setLoadouts(getLoadouts());
    }
    setEditingId(null);
  }, [loadouts, editName]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
  }, []);

  const handleOpenPicker = useCallback((loadoutId: string, slot: SlotType) => {
    setPickerLoadoutId(loadoutId);
    setPickerSlot(slot);
    setPickerSearch("");
    setPickerOpen(true);
  }, []);

  const handlePickItem = useCallback((itemId: string) => {
    if (!pickerLoadoutId) return;
    const loadout = loadouts.find((l) => l.id === pickerLoadoutId);
    if (!loadout) return;

    const updated = { ...loadout };
    switch (pickerSlot) {
      case "warframe":
        updated.warframeBuild = { warframeId: itemId, mods: [], shards: [null, null, null, null, null], hasOrokinReactor: false };
        break;
      case "primary":
        updated.primaryBuild = { weaponId: itemId, mods: [], hasOrokinCatalyst: false };
        break;
      case "secondary":
        updated.secondaryBuild = { weaponId: itemId, mods: [], hasOrokinCatalyst: false };
        break;
      case "melee":
        updated.meleeBuild = { weaponId: itemId, mods: [], hasOrokinCatalyst: false };
        break;
      case "companion":
        updated.companionBuild = { companionId: itemId, mods: [], weaponMods: [], hasReactor: false, hasCatalyst: false };
        break;
    }
    saveLoadout(updated);
    setLoadouts(getLoadouts());
    setPickerOpen(false);
  }, [pickerLoadoutId, pickerSlot, loadouts]);

  const handleClearSlot = useCallback((loadoutId: string, slot: SlotType) => {
    const loadout = loadouts.find((l) => l.id === loadoutId);
    if (!loadout) return;
    const updated = { ...loadout };
    switch (slot) {
      case "warframe": delete updated.warframeBuild; break;
      case "primary": delete updated.primaryBuild; break;
      case "secondary": delete updated.secondaryBuild; break;
      case "melee": delete updated.meleeBuild; break;
      case "companion": delete updated.companionBuild; break;
    }
    saveLoadout(updated);
    setLoadouts(getLoadouts());
  }, [loadouts]);

  const pickerItems = useMemo(() => {
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
      .map((w) => ({ id: w.id, name: w.name, detail: `DMG ${w.damage} • CC ${(w.criticalChance * 100).toFixed(0)}% • SC ${(w.statusChance * 100).toFixed(0)}%` }));
  }, [pickerSlot, pickerSearch, weapons]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Loadouts</h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Loadout
            </button>
          </div>

          {loadouts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">No loadouts yet</p>
              <p className="text-sm text-muted-foreground/70 mb-6">
                Create a loadout to save your warframe, weapon, and companion builds together.
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create First Loadout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {loadouts.map((loadout) => (
                <div
                  key={loadout.id}
                  className="border border-border rounded-xl p-5 bg-card"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    {editingId === loadout.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(loadout.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="max-w-xs h-8 text-sm"
                          autoFocus
                        />
                        <button onClick={() => handleSaveEdit(loadout.id)} className="p-1.5 rounded hover:bg-green-500/10 text-green-400">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={handleCancelEdit} className="p-1.5 rounded hover:bg-red-500/10 text-red-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{loadout.name}</h3>
                        <button onClick={() => handleStartEdit(loadout)} className="p-1 rounded hover:bg-foreground/5 text-muted-foreground">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground/50">
                        {new Date(loadout.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(loadout.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Build Slots */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {(["warframe", "primary", "secondary", "melee", "companion"] as SlotType[]).map((slot) => {
                      const cfg = SLOT_CONFIG[slot];
                      const itemId = getSlotItemId(loadout, slot);
                      const itemName = getItemName(slot, itemId);
                      const modCount = getSlotModCount(loadout, slot);

                      if (!itemName) {
                        return (
                          <button
                            key={slot}
                            onClick={() => handleOpenPicker(loadout.id, slot)}
                            className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                          >
                            <span className="text-muted-foreground/50 group-hover:text-blue-400">{SLOT_ICONS[slot]}</span>
                            <div className="text-left">
                              <span className="text-xs text-muted-foreground/50 group-hover:text-blue-400 block">{cfg.label}</span>
                              <span className="text-[10px] text-muted-foreground/30">Click to add</span>
                            </div>
                          </button>
                        );
                      }

                      return (
                        <div
                          key={slot}
                          className={cn(
                            "relative p-3 rounded-lg border transition-all",
                            `border-${cfg.color}-500/30 bg-${cfg.color}-500/5`
                          )}
                        >
                          <button
                            onClick={() => handleClearSlot(loadout.id, slot)}
                            className="absolute top-1 right-1 p-0.5 rounded hover:bg-red-500/20 text-muted-foreground/40 hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="flex items-start gap-2">
                            <img src={getSlotImage(slot, itemName)} alt="" className="w-8 h-8 rounded object-contain bg-muted/20 shrink-0 mt-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
                              <span className="text-sm font-medium truncate block">{itemName}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-muted-foreground">{modCount} mods</span>
                                <a
                                  href={cfg.builderPath}
                                  className="inline-flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-blue-300"
                                >
                                  Configure <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenPicker(loadout.id, slot)}
                            className="mt-1.5 w-full text-[10px] text-muted-foreground hover:text-foreground py-0.5 rounded border border-border/50 hover:border-border transition-colors"
                          >
                            Change
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Item Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Select {SLOT_CONFIG[pickerSlot]?.label}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${SLOT_CONFIG[pickerSlot]?.label.toLowerCase()}s...`}
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{pickerItems.length} items</p>
          </div>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-1">
              {pickerItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePickItem(item.id)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center gap-3"
                >
                  <img src={getSlotImage(pickerSlot, item.name)} alt="" className="w-8 h-8 rounded object-contain bg-muted/20 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">{item.detail}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
