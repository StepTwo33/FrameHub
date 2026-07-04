"use client";

import { Suspense, useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  AlertTriangle,
  Library,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GameAssetImage } from "@/components/game-asset-image";
import { PageShell, ContentPanel, PanelHeading } from "@/components/page-shell";
import {
  CODEX_SECTIONS,
  CODEX_MOD_CATEGORIES,
  CODEX_ARCANE_SLOTS,
  CODEX_CATEGORY_SECTIONS,
  parseCodexSection,
  type CodexSection,
} from "@/lib/codex-sections";
import {
  CODEX_WEAPON_CATEGORY_FILTERS,
  CODEX_COMPANION_TYPE_FILTERS,
  filterCodexWeapons,
  matchesCodexSearch,
} from "@/lib/codex-catalog";
import {
  matchesModBrowserCategory,
  modBrowserCategoryLabel,
  type ModBrowserCategoryId,
} from "@/lib/mod-browser-categories";
import {
  getArcaneCoverageInfo,
  getArcaneSlotCategory,
  getArcaneWikiUrl,
  ARCANE_TRIGGER_FILTERS,
} from "@/lib/arcane-browser-meta";
import { getArcaneDisplayInfo } from "@/lib/arcane-display";
import { ArcaneEffectDef } from "@/data/arcane-effects";
import { isAuraMod, modMaxCapacity } from "@/lib/aura-mods";
import { getModImage, getArcaneImage } from "@/lib/images";
import { getArchonShardImage, SHARD_COLORS, getShardColorName } from "@/lib/shard-display";
import { scaleArcaneEffectValue } from "@/lib/arcane-utils";
import { useMods, useArcanes, useArchonShards, useArcaneEffects, useWeapons, useWarframes, useCompanions, useArchwings, useNecramechs } from "@/lib/use-data";
import { Mod, ArchonShard } from "@/lib/types";
import {
  CodexActionLinks,
  CodexWeaponRow,
  CodexWarframeRow,
  CodexCompanionRow,
  CodexArchwingRow,
  CodexNecramechRow,
  WeaponDetailPanel,
  WarframeDetailPanel,
  CompanionDetailPanel,
  ArchwingDetailPanel,
  NecramechDetailPanel,
} from "@/components/codex-entity-panels";
import { cn } from "@/lib/utils";

const POLARITIES = ["All", "madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra"] as const;
const RARITIES = ["All", "Common", "Uncommon", "Rare", "Legendary"] as const;

const POLARITY_COLORS: Record<string, string> = {
  madurai: "#FF6B35",
  vazarin: "#2ECC71",
  naramon: "#00B4D8",
  zenurik: "#9B59B6",
  unairu: "#95A5A6",
  penjaga: "#1ABC9C",
  umbra: "#E74C3C",
};

const RARITY_COLORS: Record<string, string> = {
  common: "#C0C0C0",
  uncommon: "#3498DB",
  rare: "#FFD700",
  legendary: "#E91E63",
};

function CodexPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const section = parseCodexSection(searchParams.get("section"));
  const categoryParam = searchParams.get("category") || "all";
  const modCategory = (section === "mods" ? categoryParam : "all") as ModBrowserCategoryId;
  const weaponCategory = section === "weapons" ? categoryParam : "all";
  const companionType = section === "companions" ? categoryParam : "all";
  const arcaneSlot = searchParams.get("slot") || "all";
  const selectedId = searchParams.get("id");

  const { mods } = useMods();
  const arcanes = useArcanes();
  const shards = useArchonShards();
  const arcaneEffects = useArcaneEffects();
  const weapons = useWeapons();
  const warframes = useWarframes();
  const companions = useCompanions();
  const archwings = useArchwings();
  const necramechs = useNecramechs();

  const [searchQuery, setSearchQuery] = useState("");
  const [polarityFilter, setPolarityFilter] = useState<(typeof POLARITIES)[number]>("All");
  const [rarityFilter, setRarityFilter] = useState<(typeof RARITIES)[number]>("All");
  const [arcaneTrigger, setArcaneTrigger] = useState<string>("all");
  const [previewRank, setPreviewRank] = useState<number | null>(null);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      router.replace(`/codex?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const selectSection = (s: CodexSection) => {
    setSearchQuery("");
    setParams({
      section: s,
      category: CODEX_CATEGORY_SECTIONS.has(s) ? "all" : null,
      slot: s === "arcanes" ? "all" : null,
      id: null,
    });
  };

  const filteredMods = useMemo(() => {
    let list = [...mods];
    const hasSearch = searchQuery.trim().length > 0;
    // When searching, scan all mods — don't hide augments because Aura tab is selected.
    if (!hasSearch && modCategory !== "all") {
      list = list.filter((m) => matchesModBrowserCategory(m, modCategory));
    }
    if (polarityFilter !== "All") {
      list = list.filter((m) => m.polarity === polarityFilter);
    }
    if (rarityFilter !== "All") {
      list = list.filter((m) => m.rarity.toLowerCase() === rarityFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [mods, modCategory, polarityFilter, rarityFilter, searchQuery]);

  const arcaneCoverageById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getArcaneCoverageInfo>>();
    for (const arcane of arcanes) {
      map.set(arcane.id, getArcaneCoverageInfo(arcane, arcaneEffects));
    }
    return map;
  }, [arcanes, arcaneEffects]);

  const filteredArcanes = useMemo(() => {
    let list = [...arcanes];
    if (arcaneSlot !== "all") {
      list = list.filter((a) => getArcaneSlotCategory(a) === arcaneSlot);
    }
    if (arcaneTrigger !== "all") {
      list = list.filter((a) => arcaneEffects[a.id]?.trigger === arcaneTrigger);
    }
    if (rarityFilter !== "All") {
      list = list.filter((a) => a.rarity.toLowerCase() === rarityFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [arcanes, arcaneSlot, arcaneTrigger, rarityFilter, searchQuery, arcaneEffects]);

  const filteredShards = useMemo(() => {
    let list = [...shards];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [shards, searchQuery]);

  const filteredWeapons = useMemo(
    () => filterCodexWeapons(weapons, weaponCategory, searchQuery),
    [weapons, weaponCategory, searchQuery],
  );

  const filteredWarframes = useMemo(() => {
    let list = [...warframes];
    if (searchQuery.trim()) {
      list = list.filter((w) =>
        matchesCodexSearch(searchQuery, [w.name, w.id, w.description, w.passive]),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [warframes, searchQuery]);

  const filteredCompanions = useMemo(() => {
    let list = [...companions];
    if (companionType !== "all") {
      list = list.filter((c) => c.type === companionType);
    }
    if (searchQuery.trim()) {
      list = list.filter((c) =>
        matchesCodexSearch(searchQuery, [c.name, c.id, c.description, c.precept, c.type]),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [companions, companionType, searchQuery]);

  const filteredArchwings = useMemo(() => {
    let list = [...archwings];
    if (searchQuery.trim()) {
      list = list.filter((a) =>
        matchesCodexSearch(searchQuery, [a.name, a.id, a.description]),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [archwings, searchQuery]);

  const filteredNecramechs = useMemo(() => {
    let list = [...necramechs];
    if (searchQuery.trim()) {
      list = list.filter((n) =>
        matchesCodexSearch(searchQuery, [n.name, n.id, n.description]),
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [necramechs, searchQuery]);

  const selectedMod = section === "mods" && selectedId ? mods.find((m) => m.id === selectedId) : null;
  const selectedArcane =
    section === "arcanes" && selectedId ? arcanes.find((a) => a.id === selectedId) : null;
  const selectedShard =
    section === "shards" && selectedId ? shards.find((s) => s.id === selectedId) : null;
  const selectedWeapon =
    section === "weapons" && selectedId ? weapons.find((w) => w.id === selectedId) : null;
  const selectedWarframe =
    section === "warframes" && selectedId ? warframes.find((w) => w.id === selectedId) : null;
  const selectedCompanion =
    section === "companions" && selectedId ? companions.find((c) => c.id === selectedId) : null;
  const selectedArchwing =
    section === "archwings" && selectedId ? archwings.find((a) => a.id === selectedId) : null;
  const selectedNecramech =
    section === "necramechs" && selectedId ? necramechs.find((n) => n.id === selectedId) : null;

  const arcaneRank =
    selectedArcane && previewRank !== null
      ? previewRank
      : selectedArcane?.maxRank ?? 0;

  const arcaneDisplay =
    selectedArcane && selectedArcane
      ? getArcaneDisplayInfo(selectedArcane, arcaneRank, { totalArmor: 750, persistenceActive: true }, arcaneEffects)
      : null;

  const listCount =
    section === "mods"
      ? filteredMods.length
      : section === "arcanes"
        ? filteredArcanes.length
        : section === "shards"
          ? filteredShards.length
          : section === "weapons"
            ? filteredWeapons.length
            : section === "warframes"
              ? filteredWarframes.length
              : section === "companions"
                ? filteredCompanions.length
                : section === "archwings"
                  ? filteredArchwings.length
                  : filteredNecramechs.length;

  const hasSelection = Boolean(
    selectedMod ||
    selectedArcane ||
    selectedShard ||
    selectedWeapon ||
    selectedWarframe ||
    selectedCompanion ||
    selectedArchwing ||
    selectedNecramech,
  );

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px] flex-col px-4 py-4 sm:px-6",
        hasSelection && "pb-[min(75vh,32rem)]",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Codex</h1>
            <p className="text-xs text-muted-foreground">Browse and verify game data across the full database</p>
          </div>
        </div>
        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search codex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border/60 bg-background/50 pl-9"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        {/* Left sidebar — sections + subcategories */}
        <aside className="flex shrink-0 flex-col gap-3 lg:sticky lg:top-20 lg:w-52 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          <ContentPanel className="p-2">
            <PanelHeading>Sections</PanelHeading>
            <nav className="mt-2 space-y-0.5">
              {CODEX_SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = section === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSection(s.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-amber-500/15 font-medium text-amber-300"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </ContentPanel>

          {section === "mods" && (
            <ContentPanel className="p-2">
              <PanelHeading>Mod type</PanelHeading>
              <nav className="mt-2 max-h-[40vh] space-y-0.5 overflow-y-auto">
                {CODEX_MOD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setParams({ category: cat.id, id: null })}
                    className={cn(
                      "block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      modCategory === cat.id
                        ? "bg-indigo-500/15 font-medium text-indigo-300"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>
            </ContentPanel>
          )}

          {section === "weapons" && (
            <ContentPanel className="p-2">
              <PanelHeading>Weapon type</PanelHeading>
              <nav className="mt-2 max-h-[40vh] space-y-0.5 overflow-y-auto">
                {CODEX_WEAPON_CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setParams({ category: cat.id, id: null })}
                    className={cn(
                      "block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      weaponCategory === cat.id
                        ? "bg-blue-500/15 font-medium text-blue-300"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>
            </ContentPanel>
          )}

          {section === "companions" && (
            <ContentPanel className="p-2">
              <PanelHeading>Companion type</PanelHeading>
              <nav className="mt-2 space-y-0.5">
                {CODEX_COMPANION_TYPE_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setParams({ category: cat.id, id: null })}
                    className={cn(
                      "block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      companionType === cat.id
                        ? "bg-orange-500/15 font-medium text-orange-300"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>
            </ContentPanel>
          )}

          {section === "arcanes" && (
            <ContentPanel className="p-2">
              <PanelHeading>Slot</PanelHeading>
              <nav className="mt-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setParams({ slot: "all", id: null })}
                  className={cn(
                    "block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                    arcaneSlot === "all"
                      ? "bg-purple-500/15 font-medium text-purple-300"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  All
                </button>
                {CODEX_ARCANE_SLOTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setParams({ slot: f.id, id: null })}
                    className={cn(
                      "block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      arcaneSlot === f.id
                        ? "bg-purple-500/15 font-medium text-purple-300"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </nav>
            </ContentPanel>
          )}
        </aside>

        {/* Entry list — page scrolls; detail card floats in viewport */}
        <ContentPanel padding={false} className="min-w-0 flex-1">
          <div className="border-b border-border px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                <span className="font-mono font-medium text-foreground">{listCount}</span> entries
              </span>
              {section === "mods" && (
                <>
                  {POLARITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPolarityFilter(p)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] capitalize transition-colors",
                        polarityFilter === p
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </>
              )}
              {section === "arcanes" && (
                <select
                  value={arcaneTrigger}
                  onChange={(e) => setArcaneTrigger(e.target.value)}
                  className="rounded border border-border bg-background px-2 py-0.5 text-[10px]"
                >
                  {ARCANE_TRIGGER_FILTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              )}
              {(section === "mods" || section === "arcanes") && (
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value as (typeof RARITIES)[number])}
                  className="ml-auto rounded border border-border bg-background px-2 py-0.5 text-[10px]"
                >
                  {RARITIES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {section === "mods" &&
              filteredMods.map((mod) => (
                <CodexModRow
                  key={mod.id}
                  mod={mod}
                  selected={selectedId === mod.id}
                  onSelect={() => {
                    setPreviewRank(null);
                    setParams({ id: mod.id });
                  }}
                />
              ))}
            {section === "arcanes" &&
              filteredArcanes.map((arcane) => {
                const coverage = arcaneCoverageById.get(arcane.id);
                return (
                  <CodexArcaneRow
                    key={arcane.id}
                    arcane={arcane}
                    selected={selectedId === arcane.id}
                    hasIssues={(coverage?.issues.length ?? 0) > 0}
                    onSelect={() => {
                      setPreviewRank(arcane.maxRank);
                      setParams({ id: arcane.id });
                    }}
                  />
                );
              })}
            {section === "shards" &&
              filteredShards.map((shard) => (
                <CodexShardRow
                  key={shard.id}
                  shard={shard}
                  selected={selectedId === shard.id}
                  onSelect={() => setParams({ id: shard.id })}
                />
              ))}
            {section === "weapons" &&
              filteredWeapons.map((weapon) => (
                <CodexWeaponRow
                  key={weapon.id}
                  weapon={weapon}
                  selected={selectedId === weapon.id}
                  onSelect={() => setParams({ id: weapon.id })}
                />
              ))}
            {section === "warframes" &&
              filteredWarframes.map((warframe) => (
                <CodexWarframeRow
                  key={warframe.id}
                  warframe={warframe}
                  selected={selectedId === warframe.id}
                  onSelect={() => setParams({ id: warframe.id })}
                />
              ))}
            {section === "companions" &&
              filteredCompanions.map((companion) => (
                <CodexCompanionRow
                  key={companion.id}
                  companion={companion}
                  selected={selectedId === companion.id}
                  onSelect={() => setParams({ id: companion.id })}
                />
              ))}
            {section === "archwings" &&
              filteredArchwings.map((archwing) => (
                <CodexArchwingRow
                  key={archwing.id}
                  archwing={archwing}
                  selected={selectedId === archwing.id}
                  onSelect={() => setParams({ id: archwing.id })}
                />
              ))}
            {section === "necramechs" &&
              filteredNecramechs.map((necramech) => (
                <CodexNecramechRow
                  key={necramech.id}
                  necramech={necramech}
                  selected={selectedId === necramech.id}
                  onSelect={() => setParams({ id: necramech.id })}
                />
              ))}
          </div>
        </ContentPanel>
      </div>

      {(selectedMod || selectedArcane || selectedShard || selectedWeapon || selectedWarframe || selectedCompanion || selectedArchwing || selectedNecramech) && (
        <CodexDetailCard onClose={() => setParams({ id: null })}>
          {selectedMod && <ModDetailPanel mod={selectedMod} compact />}
          {selectedArcane && arcaneDisplay && (
            <ArcaneDetailPanel
              arcane={selectedArcane}
              display={arcaneDisplay}
              coverage={arcaneCoverageById.get(selectedArcane.id)!}
              effects={arcaneEffects[selectedArcane.id]}
              rank={arcaneRank}
              onRankChange={setPreviewRank}
              compact
            />
          )}
          {selectedShard && <ShardDetailPanel shard={selectedShard} compact />}
          {selectedWeapon && <WeaponDetailPanel weapon={selectedWeapon} compact />}
          {selectedWarframe && <WarframeDetailPanel warframe={selectedWarframe} compact />}
          {selectedCompanion && <CompanionDetailPanel companion={selectedCompanion} compact />}
          {selectedArchwing && <ArchwingDetailPanel archwing={selectedArchwing} compact />}
          {selectedNecramech && <NecramechDetailPanel necramech={selectedNecramech} compact />}
        </CodexDetailCard>
      )}
    </div>
  );
}

function CodexDetailCard({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end p-3 sm:p-4 lg:p-6"
      role="dialog"
      aria-label="Selected entry details"
    >
      <ContentPanel
        className={cn(
          "pointer-events-auto flex w-full max-w-sm flex-col overflow-hidden",
          "max-h-[min(72vh,calc(100vh-5rem))] shadow-2xl shadow-black/40",
          "border-border/80 bg-card/95 backdrop-blur-md",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Selected
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="Close detail card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </ContentPanel>
    </div>
  );
}

function CodexModRow({
  mod,
  selected,
  onSelect,
}: {
  mod: Mod;
  selected: boolean;
  onSelect: () => void;
}) {
  const aura = isAuraMod(mod);
  const maxCap = modMaxCapacity(mod);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 text-left transition-all",
        selected ? "border-indigo-500/50 bg-indigo-500/5" : "border-border/60 hover:border-indigo-500/30",
      )}
    >
      <GameAssetImage
        src={getModImage(mod.name)}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded object-contain bg-muted/20"
        hideOnError
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{mod.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {modBrowserCategoryLabel(mod)}
          {aura && " · Aura"}
        </p>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground" title="Capacity drain at R0 → max rank">
        {mod.drain}
        <span className="text-muted-foreground/60"> → {maxCap}</span>
      </span>
    </button>
  );
}

function CodexArcaneRow({
  arcane,
  selected,
  hasIssues,
  onSelect,
}: {
  arcane: Mod;
  selected: boolean;
  hasIssues: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 text-left transition-all",
        selected ? "border-purple-500/50 bg-purple-500/5" : "border-border/60 hover:border-purple-500/30",
      )}
    >
      <GameAssetImage
        src={getArcaneImage(arcane.name)}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded object-contain bg-muted/20"
        hideOnError
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{arcane.name}</p>
        <p className="text-[10px] capitalize text-muted-foreground">{getArcaneSlotCategory(arcane)}</p>
      </div>
      {hasIssues && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
    </button>
  );
}

function CodexShardRow({
  shard,
  selected,
  onSelect,
}: {
  shard: ArchonShard;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 text-left transition-all",
        selected ? "border-emerald-500/50 bg-emerald-500/5" : "border-border/60 hover:border-emerald-500/30",
      )}
    >
      <GameAssetImage
        src={getArchonShardImage(shard.color, shard.tier)}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded object-contain bg-muted/20"
        hideOnError
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{shard.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {getShardColorName(shard.color)} · Tier {shard.tier}
        </p>
      </div>
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: SHARD_COLORS[shard.color] ?? "#888" }}
      />
    </button>
  );
}

function ModDetailPanel({ mod, compact }: { mod: Mod; compact?: boolean }) {
  const aura = isAuraMod(mod);
  const maxCap = modMaxCapacity(mod);

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-start gap-2.5">
        <GameAssetImage
          src={getModImage(mod.name)}
          alt={mod.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className={cn("rounded object-contain bg-muted/20", compact ? "h-12 w-12" : "h-16 w-16")}
          hideOnError
        />
        <div className="min-w-0 flex-1">
          <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{mod.name}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">{mod.id}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-[10px] capitalize">
              {modBrowserCategoryLabel(mod)}
            </Badge>
            {aura && (
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                Aura
              </Badge>
            )}
          </div>
        </div>
      </div>

      <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
        {mod.description}
      </p>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="rounded border border-border/60 p-1.5">
          <p className="text-[10px] uppercase text-muted-foreground">Base drain (R0)</p>
          <p className={cn("font-mono", compact ? "text-base" : "text-lg")}>{mod.drain}</p>
        </div>
        <div className="rounded border border-border/60 p-1.5">
          <p className="text-[10px] uppercase text-muted-foreground">
            {aura ? "Max rank bonus" : `Max drain (R${mod.maxRank})`}
          </p>
          <p className={cn("font-mono", compact ? "text-base" : "text-lg")}>{maxCap}</p>
        </div>
        <div className="rounded border border-border/60 p-1.5">
          <p className="text-[10px] uppercase text-muted-foreground">Max rank</p>
          <p className="font-mono">{mod.maxRank}</p>
        </div>
        <div className="rounded border border-border/60 p-1.5">
          <p className="text-[10px] uppercase text-muted-foreground">Polarity</p>
          <p className="capitalize">{mod.polarity}</p>
        </div>
      </div>

      {aura ? (
        <p className="text-[10px] leading-snug text-muted-foreground">
          Aura capacity: R0 = {mod.drain}, max rank R{mod.maxRank} = {maxCap} (adds matching polarity capacity).
        </p>
      ) : (
        <p className="text-[10px] leading-snug text-muted-foreground">
          Capacity drain: R0 = {mod.drain}, max rank R{mod.maxRank} = {maxCap} (+1 per rank).
        </p>
      )}

      {Object.keys(mod.stats ?? {}).length > 0 && (
        <div>
          <PanelHeading>Stats @ max rank</PanelHeading>
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.entries(mod.stats ?? {}).map(([stat, value]) => {
              const maxVal = value * (mod.maxRank + 1);
              const label = stat.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
              return (
                <span key={stat} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  {label}: {maxVal > 0 ? "+" : ""}
                  {Number.isInteger(maxVal) ? maxVal : maxVal.toFixed(1)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <CodexActionLinks
        reportType="mod"
        id={mod.id}
        name={mod.name}
        overrideCategory="mod"
      />
    </div>
  );
}

function ArcaneDetailPanel({
  arcane,
  display,
  coverage,
  effects,
  rank,
  onRankChange,
  compact,
}: {
  arcane: Mod;
  display: ReturnType<typeof getArcaneDisplayInfo>;
  coverage: ReturnType<typeof getArcaneCoverageInfo>;
  effects?: ArcaneEffectDef;
  rank: number;
  onRankChange: (r: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-start gap-2.5">
        <GameAssetImage
          src={getArcaneImage(arcane.name)}
          alt={arcane.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className={cn("rounded object-contain bg-muted/20", compact ? "h-12 w-12" : "h-16 w-16")}
          hideOnError
        />
        <div className="min-w-0 flex-1">
          <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{arcane.name}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">{arcane.id}</p>
          {effects && (
            <Badge variant="outline" className="mt-1 text-[10px]">
              {effects.trigger}
              {effects.stackCap != null ? ` · cap ${effects.stackCap}` : ""}
            </Badge>
          )}
        </div>
      </div>

      <label className="block text-[10px] text-muted-foreground">
        Preview rank{" "}
        <input
          type="range"
          min={0}
          max={arcane.maxRank}
          value={rank}
          onChange={(e) => onRankChange(Number(e.target.value))}
          className="ml-2 w-full"
        />
        <span className="font-mono text-foreground">
          {rank}/{arcane.maxRank}
        </span>
      </label>

      <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
        {display.description}
      </p>

      {coverage.issues.length > 0 && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5">
          <ul className="list-inside list-disc text-[11px] text-amber-200/80">
            {coverage.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {display.applied.length > 0 && (
        <div>
          <PanelHeading>Applied</PanelHeading>
          <ul className="space-y-0.5 text-xs">
            {display.applied.map((line) => (
              <li key={line.label} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{line.label}</span>
                <span className="font-mono text-emerald-400">{line.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {effects && effects.effects.length > 0 && (
        <div>
          <PanelHeading>Effect lines</PanelHeading>
          <div className={cn(compact ? "max-h-24" : "max-h-32", "overflow-y-auto")}>
            {effects.effects.map((line) => (
              <div key={line.stat} className="flex justify-between font-mono text-[10px]">
                <span className="truncate pr-2">{line.stat}</span>
                <span className="shrink-0">
                  {scaleArcaneEffectValue(line.maxValue, rank, effects.maxRank, {
                    constantAtAllRanks: line.constantAtAllRanks,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CodexActionLinks
        reportType="mod"
        id={arcane.id}
        name={arcane.name}
        overrideCategory="arcane"
        wikiUrl={getArcaneWikiUrl(arcane.name)}
      />
    </div>
  );
}

function ShardDetailPanel({ shard, compact }: { shard: ArchonShard; compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-start gap-2.5">
        <GameAssetImage
          src={getArchonShardImage(shard.color, shard.tier)}
          alt={shard.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className={cn("rounded object-contain bg-muted/20", compact ? "h-12 w-12" : "h-16 w-16")}
          hideOnError
        />
        <div>
          <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{shard.name}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">{shard.id}</p>
        </div>
      </div>
      <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
        {shard.description}
      </p>
      <div>
        <PanelHeading>Stat options</PanelHeading>
        <div className="flex flex-wrap gap-1">
          {Object.entries(shard.statBonuses).map(([stat, val]) => (
            <span key={stat} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              {stat}: +{val}
            </span>
          ))}
        </div>
      </div>
      <CodexActionLinks
        reportType="mod"
        id={shard.id}
        name={shard.name}
        overrideCategory="archon_shard"
      />
    </div>
  );
}

export default function CodexPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
            Loading codex…
          </div>
        }
      >
        <CodexPageContent />
      </Suspense>
    </PageShell>
  );
}
