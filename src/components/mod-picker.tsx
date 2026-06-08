"use client";

import { useState, useMemo, useEffect } from "react";
import { Mod, getRivenStatsForCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search, Plus, X } from "lucide-react";
import { PolarityIcon } from "@/components/polarity-icon";
import { getModImage, getArcaneImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";
import { getBlockedModIds } from "@/data/mod-exclusions";

function isRivenMod(mod: Mod): boolean {
  return mod.subCategory === "riven" || mod.id.startsWith("riven_");
}

/** Augment data uses base warframe ids (e.g. loki); selected frame may be loki_prime or excalibur_umbra. */
function augmentMatchesWarframe(mod: Mod, selectedWarframeId: string): boolean {
  const mid = mod.warframeId;
  if (!mid || mid === "universal") return mid === "universal";
  const candidates = new Set([
    selectedWarframeId,
    selectedWarframeId.replace(/_prime$/i, ""),
    selectedWarframeId.replace(/_umbra$/i, ""),
  ]);
  return candidates.has(mid);
}

const rarityColors: Record<string, string> = {
  common: "bg-amber-900/30 text-amber-300 border-amber-900/50",
  uncommon: "bg-slate-500/20 text-slate-300 border-slate-500/50",
  rare: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  legendary: "bg-white/10 text-white border-white/30",
};

// Known aura mod IDs (matched to actual data)
const AURA_MODS = new Set([
  "aura_steel_charge", "aura_energy_siphon", "aura_corrosive_projection", "aura_rejuvenation",
  "aura_enemy_radar", "aura_physique", "aura_rifle_amplification", "aura_shotgun_amplification",
  "aura_pistol_amplification", "dead_eye", "aura_infested_impedance", "loot_detector",
  "aura_shield_disruption", "aura_speed_holster", "aura_sprint_boost", "stand_united",
  "growing_power", "brief_respite", "aerodynamic", "power_donation_r5",
  "combat_discipline", "shepherd", "coaction_drift",
]);

// Known exilus mod IDs (movement, utility, drift mods — matched to actual data)
const EXILUS_MODS = new Set([
  "rush_r3", "maglev", "master_thief", "intruder",
  "enemy_sense_r3", "vigilante_pursuit", "animal_instinct",
  "aura_cunning_drift", "endurance_drift", "power_drift", "speed_drift",
  "lightning_dash", "firewalker", "ice_spring", "toxic_flight", "battering_maneuver",
  "handspring_r10", "sure_footed_r5",
  "constitution", "aviator", "agility_drift",
  "mobilize_r3", "patagium", "proton_pulse", "streamlined_form", "preparation_r10",
]);

// Wiki: Exilus_Mods → Secondary weapon tab (+ patch-listed Vigilante Supplies)
const SECONDARY_WEAPON_EXILUS_MOD_IDS = new Set([
  "trick_mag_r3",
  "pistol_ammo_mutation",
  "primed_pistol_ammo_mutation",
  "vigilante_supplies",
  "air_recon",
  "hawk_eye",
  "spry_sights",
  "strafing_slide",
  "steady_hands",
  "primed_steady_hands",
  "targeting_subsystem",
  "suppress_r3",
  "reflex_draw",
  "eject_magazine",
  "lethal_momentum",
  "energizing_shot",
  "ruinous_extension",
  "fass_canticle",
  "jahu_canticle",
  "khra_canticle",
  "lohk_canticle",
]);

/** Melee Exilus (utility / block / glaive); matches in-game Exilus-eligible melee weapon mods. */
const MELEE_WEAPON_EXILUS_MOD_IDS = new Set([
  "dispatch_overdrive",
  "electromagnetic_shielding",
  "focused_defense",
  "guardian_derision",
  "whirlwind",
  "focus_energy_r3",
  "power_throw",
  "quick_return",
  "rebound",
  "volatile_quick_return",
  "volatile_rebound",
  "parry_r3",
]);

export type SlotType = "regular" | "aura" | "exilus" | "weapon_exilus_secondary" | "weapon_exilus_melee";

interface ModPickerProps {
  open: boolean;
  onClose: () => void;
  mods: Mod[];
  category: string;
  slotType?: SlotType;
  equippedModIds: string[];
  onSelect: (mod: Mod, rank: number) => void;
  onSelectRiven?: (mod: Mod, stats: Record<string, number>) => void;
  weaponCategory?: string; // for riven stat pool filtering
  warframeId?: string; // When set, augment mods are filtered to this warframe + universal
  /** When provided, shows Mods / Arcanes tabs for browsing warframe arcanes. */
  arcaneCatalog?: Mod[];
  initialBrowseTab?: "mods" | "arcanes";
  equippedArcaneIds?: string[];
}

export function ModPicker({ open, onClose, mods, category, slotType = "regular", equippedModIds, onSelect, onSelectRiven, weaponCategory, warframeId, arcaneCatalog, initialBrowseTab = "mods", equippedArcaneIds = [] }: ModPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [selectedRank, setSelectedRank] = useState(0);
  const [browseTab, setBrowseTab] = useState<"mods" | "arcanes">(initialBrowseTab);
  // Riven stat configuration state
  const [rivenStats, setRivenStats] = useState<Record<string, number>>({});
  const [rivenStatKey, setRivenStatKey] = useState("");
  const [rivenStatValue, setRivenStatValue] = useState("");

  const blockedByExclusion = useMemo(() => getBlockedModIds(equippedModIds), [equippedModIds]);

  const filteredMods = useMemo(() => {
    let categoryMods: Mod[];
    if (slotType === "weapon_exilus_secondary") {
      categoryMods = mods.filter((m) => SECONDARY_WEAPON_EXILUS_MOD_IDS.has(m.id));
    } else if (slotType === "weapon_exilus_melee") {
      categoryMods = mods.filter((m) => MELEE_WEAPON_EXILUS_MOD_IDS.has(m.id));
    } else if (category === "_prefiltered") {
      // Mods already filtered by caller (e.g. companion weapon mods)
      categoryMods = [...mods];
    } else {
      categoryMods = mods.filter((m) => {
        // Stance mods should never appear in regular mod slots
        if (m.category === "stance") return false;
        // Necramech/archwing/operator mods should not leak into normal weapon builders
        if (m.category === "necramech" || m.category === "archwing" || m.category === "operator") return false;
        // Riven mods: only show the riven matching the specific weapon category
        if (m.subCategory === "riven") {
          if (!weaponCategory) return false;
          const wc = weaponCategory.toLowerCase();
          if (m.id === "riven_rifle") return ["rifle", "bow", "primary", "launcher"].includes(wc);
          if (m.id === "riven_shotgun") return wc === "shotgun";
          if (m.id === "riven_pistol") return ["pistol", "secondary", "dual_pistols"].includes(wc);
          if (m.id === "riven_melee") return wc === "melee";
          return false;
        }
        if (category === "primary") return ["primary", "rifle", "shotgun", "bow", "general"].includes(m.category);
        if (category === "secondary") return ["secondary", "pistol", "general"].includes(m.category);
        if (category === "melee") return m.category === "melee" || m.category === "general";
        if (category === "warframe") return m.category === "warframe" || m.category === "augment";
        if (category === "companion") return m.category === "companion";
        return m.category === category;
      });
    }

    // Filter by slot type
    if (slotType === "aura") {
      categoryMods = categoryMods.filter((m) => AURA_MODS.has(m.id));
    } else if (slotType === "exilus") {
      categoryMods = categoryMods.filter((m) => EXILUS_MODS.has(m.id));
    }

    // Filter augments to matching warframe (+ universal; primes/umbra base ids; Umbra polarity = any frame)
    if (warframeId) {
      categoryMods = categoryMods.filter((m) => {
        if (m.category !== "augment") return true;
        if (m.polarity === "umbra") return true;
        return augmentMatchesWarframe(m, warframeId);
      });
    }

    if (!search.trim()) return categoryMods;
    const q = search.toLowerCase();
    return categoryMods.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }, [mods, category, slotType, search, warframeId, weaponCategory]);

  const filteredArcanes = useMemo(() => {
    if (!arcaneCatalog) return [];
    if (!search.trim()) return arcaneCatalog;
    const q = search.toLowerCase();
    return arcaneCatalog.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [arcaneCatalog, search]);

  const isArcaneBrowse = browseTab === "arcanes" && !!arcaneCatalog;

  useEffect(() => {
    if (open) setBrowseTab(initialBrowseTab);
  }, [open, initialBrowseTab]);

  const handleSelectMod = (mod: Mod) => {
    setSelectedMod(mod);
    setSelectedRank(mod.maxRank);
  };

  const handleConfirm = () => {
    if (selectedMod) {
      if (isRivenMod(selectedMod) && onSelectRiven) {
        onSelectRiven(selectedMod, rivenStats);
      } else {
        onSelect(selectedMod, selectedRank);
      }
      setSelectedMod(null);
      setSelectedRank(0);
      setRivenStats({});
      setRivenStatKey("");
      setRivenStatValue("");
      setSearch("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedMod(null);
    setSelectedRank(0);
    setRivenStats({});
    setRivenStatKey("");
    setRivenStatValue("");
    setSearch("");
    setBrowseTab(initialBrowseTab);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {isArcaneBrowse
              ? "Select Arcane"
              : slotType === "aura"
                ? "Select Aura Mod"
                : slotType === "exilus"
                  ? "Select Exilus Mod"
                  : slotType === "weapon_exilus_secondary"
                    ? "Select Secondary Exilus Mod"
                    : slotType === "weapon_exilus_melee"
                      ? "Select Melee Exilus Mod"
                      : "Select Mod"}
          </DialogTitle>
        </DialogHeader>

        {selectedMod ? (
          <div className="p-6 space-y-4">
            <div className="border border-border rounded-lg p-4 bg-secondary/30">
              <div className="flex items-center gap-3 mb-2">
                <GameAssetImage
                  src={selectedMod.category === "arcane" ? getArcaneImage(selectedMod.name) : getModImage(selectedMod.name)}
                  alt=""
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded object-contain bg-muted/20 shrink-0"
                  hideOnError
                />
                <div className="flex-1 flex items-center justify-between">
                  <h4 className="font-semibold">{selectedMod.name}</h4>
                  <Badge variant="outline" className={cn("text-[10px]", rarityColors[selectedMod.rarity])}>
                    {selectedMod.rarity}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedMod.description.replace(/<[^>]+>/g, "")}
              </p>
              {Object.keys(selectedMod.stats).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(selectedMod.stats).map(([key, value]) => (
                    <span key={key} className="text-xs bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">
                      {key}: {value > 0 ? "+" : ""}{value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isRivenMod(selectedMod) ? (() => {
              const rivenPool = getRivenStatsForCategory(weaponCategory || category);
              return (
                <div className="space-y-3">
                  <div className="text-[10px] text-purple-300/60 uppercase tracking-wider">
                    Configure Riven Stats (up to 4)
                  </div>
                  {Object.keys(rivenStats).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(rivenStats).map(([key, value]) => {
                        const statDef = rivenPool.find((s) => s.key === key);
                        return (
                          <div key={key} className="flex items-center justify-between text-xs p-1.5 rounded bg-background">
                            <span className="text-muted-foreground">{statDef?.label || key}</span>
                            <div className="flex items-center gap-2">
                              <span className={value >= 0 ? "text-green-400" : "text-red-400"}>
                                {value >= 0 ? "+" : ""}{(value * 100).toFixed(1)}%
                              </span>
                              <button
                                onClick={() => setRivenStats((prev) => { const n = { ...prev }; delete n[key]; return n; })}
                                className="text-muted-foreground hover:text-red-400 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {Object.keys(rivenStats).length < 4 && (
                    <div className="flex gap-2">
                      <select
                        value={rivenStatKey}
                        onChange={(e) => setRivenStatKey(e.target.value)}
                        className="flex-1 text-xs bg-background border border-border rounded px-2 py-1.5"
                      >
                        <option value="">Select stat...</option>
                        {rivenPool.filter((s) => !(s.key in rivenStats)).map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="% value"
                        value={rivenStatValue}
                        onChange={(e) => setRivenStatValue(e.target.value)}
                        className="w-24 text-xs bg-background border border-border rounded px-2 py-1.5"
                      />
                      <button
                        onClick={() => {
                          if (!rivenStatKey || !rivenStatValue) return;
                          const val = parseFloat(rivenStatValue) / 100;
                          setRivenStats((prev) => ({ ...prev, [rivenStatKey]: val }));
                          setRivenStatKey("");
                          setRivenStatValue("");
                        }}
                        disabled={!rivenStatKey || !rivenStatValue}
                        className="px-3 py-1.5 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rank: {selectedRank} / {selectedMod.maxRank}
                </label>
                <input
                  type="range"
                  min={0}
                  max={selectedMod.maxRank}
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>{selectedMod.maxRank}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedMod(null)}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
              >
                {selectedMod?.category === "arcane" ? "Equip Arcane" : "Equip Mod"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 pb-3">
              {arcaneCatalog && arcaneCatalog.length > 0 && (
                <div className="flex gap-1 mb-3 p-1 rounded-lg bg-secondary/40">
                  <button
                    type="button"
                    onClick={() => setBrowseTab("mods")}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded-md transition-colors",
                      browseTab === "mods" ? "bg-background text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Mods
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrowseTab("arcanes")}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded-md transition-colors",
                      browseTab === "arcanes" ? "bg-background text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Arcanes
                  </button>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArcaneBrowse ? "Search arcanes..." : "Search mods..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isArcaneBrowse ? filteredArcanes.length : filteredMods.length}{" "}
                {isArcaneBrowse ? "arcanes" : "mods"} available
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
              <div className="space-y-1">
                {isArcaneBrowse ? filteredArcanes.map((arcane) => {
                  const isEquipped = equippedArcaneIds.includes(arcane.id);
                  return (
                    <button
                      key={arcane.id}
                      onClick={() => !isEquipped && handleSelectMod(arcane)}
                      disabled={isEquipped}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        isEquipped
                          ? "border-border opacity-40 cursor-not-allowed"
                          : "border-border hover:border-purple-500/50 hover:bg-purple-500/5 hover:scale-[1.01] cursor-pointer shadow-sm",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GameAssetImage src={getArcaneImage(arcane.name)} alt="" width={32} height={32} className="w-8 h-8 rounded object-contain bg-muted/20 shrink-0" hideOnError />
                          <span className="text-sm font-medium">{arcane.name}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px]", rarityColors[arcane.rarity])}>
                          {arcane.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {arcane.description.replace(/<[^>]+>/g, "").substring(0, 100)}
                      </p>
                      {isEquipped && (
                        <span className="text-[10px] text-muted-foreground">Already equipped</span>
                      )}
                    </button>
                  );
                }) : filteredMods.map((mod) => {
                  const isEquipped = equippedModIds.includes(mod.id);
                  const isBlocked = blockedByExclusion.has(mod.id);
                  const isDisabled = isEquipped || isBlocked;
                  const hasStats = Object.keys(mod.stats).length > 0;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => !isDisabled && handleSelectMod(mod)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        isDisabled
                          ? "border-border opacity-40 cursor-not-allowed"
                          : "border-border hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-[1.01] cursor-pointer shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GameAssetImage src={getModImage(mod.name)} alt="" width={32} height={32} className="w-8 h-8 rounded object-contain bg-muted/20 shrink-0" hideOnError />
                          <PolarityIcon polarity={mod.polarity} size={14} />
                          <span className="text-sm font-medium">{mod.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {!hasStats && (
                            <span className="text-[10px] text-yellow-500/70">utility</span>
                          )}
                          <Badge variant="outline" className={cn("text-[10px]", rarityColors[mod.rarity])}>
                            {mod.rarity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {mod.description.replace(/<[^>]+>/g, "").substring(0, 80)}
                      </p>
                      {isEquipped && (
                        <span className="text-[10px] text-muted-foreground">Already equipped</span>
                      )}
                      {isBlocked && !isEquipped && (
                        <span className="text-[10px] text-orange-400">Variant equipped</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
