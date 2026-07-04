"use client";

import { useMemo, useState } from "react";
import { allArcanes } from "@/data/arcanes";
import { ARCANE_EFFECTS } from "@/data/arcane-effects";
import { GameAssetImage } from "@/components/game-asset-image";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  PageShell,
  PageMain,
  PageHero,
  FilterChip,
  ContentPanel,
  PanelHeading,
} from "@/components/page-shell";
import { getArcaneDisplayInfo } from "@/lib/arcane-display";
import {
  ARCANE_SLOT_FILTERS,
  ARCANE_TRIGGER_FILTERS,
  getArcaneCoverageInfo,
  getArcaneSlotCategory,
  getArcaneWikiUrl,
} from "@/lib/arcane-browser-meta";
import { getArcaneImage } from "@/lib/images";
import { scaleArcaneEffectValue } from "@/lib/arcane-utils";
import { cn } from "@/lib/utils";
import { ExternalLink, Flag, Search, Sparkles, AlertTriangle } from "lucide-react";

const RARITIES = ["All", "Common", "Uncommon", "Rare", "Legendary"] as const;

const RARITY_COLORS: Record<string, string> = {
  common: "#C0C0C0",
  uncommon: "#3498DB",
  rare: "#FFD700",
  legendary: "#E91E63",
};

type CoverageFilter = "all" | "issues" | "missing" | "custom";

export default function ArcaneBrowserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [slotFilter, setSlotFilter] = useState<(typeof ARCANE_SLOT_FILTERS)[number]["id"]>("all");
  const [triggerFilter, setTriggerFilter] = useState<(typeof ARCANE_TRIGGER_FILTERS)[number]["id"]>("all");
  const [rarityFilter, setRarityFilter] = useState<(typeof RARITIES)[number]>("All");
  const [coverageFilter, setCoverageFilter] = useState<CoverageFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewRank, setPreviewRank] = useState<number | null>(null);

  const coverageById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getArcaneCoverageInfo>>();
    for (const arcane of allArcanes) {
      map.set(arcane.id, getArcaneCoverageInfo(arcane));
    }
    return map;
  }, []);

  const summary = useMemo(() => {
    let withIssues = 0;
    let missing = 0;
    let custom = 0;
    for (const info of coverageById.values()) {
      if (info.issues.length > 0) withIssues++;
      if (!info.hasEffectDef || info.effectCount === 0) missing++;
      if (info.customHandler) custom++;
    }
    return { total: allArcanes.length, withIssues, missing, custom };
  }, [coverageById]);

  const filteredArcanes = useMemo(() => {
    let list = [...allArcanes];

    if (slotFilter !== "all") {
      list = list.filter((a) => getArcaneSlotCategory(a) === slotFilter);
    }
    if (triggerFilter !== "all") {
      list = list.filter((a) => ARCANE_EFFECTS[a.id]?.trigger === triggerFilter);
    }
    if (rarityFilter !== "All") {
      list = list.filter((a) => a.rarity.toLowerCase() === rarityFilter.toLowerCase());
    }
    if (coverageFilter === "issues") {
      list = list.filter((a) => (coverageById.get(a.id)?.issues.length ?? 0) > 0);
    } else if (coverageFilter === "missing") {
      list = list.filter((a) => {
        const info = coverageById.get(a.id);
        return !info?.hasEffectDef || info.effectCount === 0;
      });
    } else if (coverageFilter === "custom") {
      list = list.filter((a) => !!coverageById.get(a.id)?.customHandler);
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
  }, [searchQuery, slotFilter, triggerFilter, rarityFilter, coverageFilter, coverageById]);

  const expandedArcane = expandedId ? allArcanes.find((a) => a.id === expandedId) : null;
  const expandedRank = expandedArcane
    ? (previewRank ?? expandedArcane.maxRank)
    : 0;

  return (
    <PageShell>
      <PageMain maxWidth="xl">
        <PageHero
          icon={Sparkles}
          accent="purple"
          title="Arcane Browser"
          description="Browse all arcanes with effect definitions, apply handlers, and wiki descriptions. Use this to verify data coverage and calculator wiring."
        />

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ContentPanel className="py-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">{summary.total}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
          </ContentPanel>
          <ContentPanel className="py-3 text-center">
            <p className="text-2xl font-semibold tabular-nums text-emerald-400">{summary.custom}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Custom handlers</p>
          </ContentPanel>
          <ContentPanel className="py-3 text-center">
            <p className="text-2xl font-semibold tabular-nums text-amber-400">{summary.withIssues}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Flagged</p>
          </ContentPanel>
          <ContentPanel className="py-3 text-center">
            <p className="text-2xl font-semibold tabular-nums text-red-400">{summary.missing}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Missing effects</p>
          </ContentPanel>
        </div>

        <ContentPanel className="mb-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, id, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/60 bg-background/50 pl-9"
            />
          </div>

          <div className="space-y-3">
            <div>
              <PanelHeading>Slot type</PanelHeading>
              <div className="flex flex-wrap gap-2">
                {ARCANE_SLOT_FILTERS.map((f) => (
                  <FilterChip
                    key={f.id}
                    active={slotFilter === f.id}
                    onClick={() => setSlotFilter(f.id)}
                  >
                    {f.label}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div>
              <PanelHeading>Trigger</PanelHeading>
              <div className="flex flex-wrap gap-2">
                {ARCANE_TRIGGER_FILTERS.map((f) => (
                  <FilterChip
                    key={f.id}
                    active={triggerFilter === f.id}
                    onClick={() => setTriggerFilter(f.id)}
                  >
                    {f.label}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <PanelHeading>Rarity</PanelHeading>
                <div className="flex flex-wrap gap-2">
                  {RARITIES.map((rar) => (
                    <FilterChip
                      key={rar}
                      active={rarityFilter === rar}
                      onClick={() => setRarityFilter(rar)}
                    >
                      {rar}
                    </FilterChip>
                  ))}
                </div>
              </div>
              <div>
                <PanelHeading>Coverage</PanelHeading>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "issues", label: "Has issues" },
                      { id: "missing", label: "Missing effects" },
                      { id: "custom", label: "Custom handler" },
                    ] as const
                  ).map((f) => (
                    <FilterChip
                      key={f.id}
                      active={coverageFilter === f.id}
                      onClick={() => setCoverageFilter(f.id)}
                    >
                      {f.label}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ContentPanel>

        <p className="mb-3 text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{filteredArcanes.length}</span> arcanes
        </p>

        <ContentPanel padding={false}>
          <ScrollArea className="h-[62vh]">
            <div className="space-y-1 p-2 pr-4">
              {filteredArcanes.map((arcane) => {
                const coverage = coverageById.get(arcane.id)!;
                const def = ARCANE_EFFECTS[arcane.id];
                const isExpanded = expandedId === arcane.id;
                const display = isExpanded
                  ? getArcaneDisplayInfo(arcane, expandedRank, { totalArmor: 750, persistenceActive: true })
                  : null;

                return (
                  <div key={arcane.id}>
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedId(null);
                          setPreviewRank(null);
                        } else {
                          setExpandedId(arcane.id);
                          setPreviewRank(arcane.maxRank);
                        }
                      }}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-all",
                        isExpanded
                          ? "border-purple-500/50 bg-purple-500/5"
                          : "border-border hover:border-purple-500/30",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GameAssetImage
                          src={getArcaneImage(arcane.name)}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 rounded object-contain bg-muted/20"
                          hideOnError
                        />
                        <span className="flex-1 text-sm font-medium">{arcane.name}</span>
                        {coverage.issues.length > 0 && (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-label="Has issues" />
                        )}
                        {coverage.customHandler && (
                          <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-300">
                            {coverage.customHandler} handler
                          </Badge>
                        )}
                        <span
                          className="hidden text-[10px] capitalize text-muted-foreground sm:inline"
                        >
                          {def?.trigger ?? "—"}
                        </span>
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: RARITY_COLORS[arcane.rarity] ?? "#9CA3AF" }}
                        />
                      </div>
                    </button>

                    {isExpanded && display && (
                      <div className="mb-2 ml-2 mt-1 rounded-lg border border-border bg-card p-4">
                        <div className="flex flex-wrap items-start gap-4">
                          <GameAssetImage
                            src={getArcaneImage(arcane.name)}
                            alt={arcane.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded object-contain bg-muted/20"
                            hideOnError
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{arcane.name}</h3>
                            <p className="font-mono text-[10px] text-muted-foreground">{arcane.id}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {getArcaneSlotCategory(arcane)}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {arcane.rarity}
                              </Badge>
                              {def && (
                                <Badge variant="outline" className="text-[10px]">
                                  {def.trigger}
                                  {def.stackCap != null ? ` · cap ${def.stackCap}` : ""}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px]">
                                {coverage.effectCount} effect lines
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground">
                              Preview rank{" "}
                              <span className="font-mono text-foreground">{expandedRank}</span>
                              /{arcane.maxRank}
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={arcane.maxRank}
                              value={expandedRank}
                              onChange={(e) => setPreviewRank(Number(e.target.value))}
                              className="w-36"
                            />
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground">{display.description}</p>

                        {coverage.issues.length > 0 && (
                          <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                              Coverage flags
                            </p>
                            <ul className="mt-1 list-inside list-disc text-xs text-amber-200/80">
                              {coverage.issues.map((issue) => (
                                <li key={issue}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div>
                            <PanelHeading>Applied to build</PanelHeading>
                            {display.applied.length > 0 ? (
                              <ul className="space-y-1 text-xs">
                                {display.applied.map((line) => (
                                  <li key={line.label} className="flex justify-between gap-2">
                                    <span className="text-muted-foreground">{line.label}</span>
                                    <span className="font-mono text-emerald-400">{line.value}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground">None at this rank</p>
                            )}
                          </div>
                          <div>
                            <PanelHeading>Conditional / proc</PanelHeading>
                            {display.conditional.length > 0 ? (
                              <ul className="space-y-1 text-xs">
                                {display.conditional.map((line) => (
                                  <li key={`${line.label}-${line.note}`}>
                                    <div className="flex justify-between gap-2">
                                      <span className="text-muted-foreground">{line.label}</span>
                                      <span className="font-mono text-amber-300">{line.value}</span>
                                    </div>
                                    {line.note && (
                                      <p className="text-[10px] text-muted-foreground/80">{line.note}</p>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground">None</p>
                            )}
                          </div>
                        </div>

                        {def && def.effects.length > 0 && (
                          <div className="mt-4">
                            <PanelHeading>Raw effect definition (max rank)</PanelHeading>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[11px]">
                                <thead>
                                  <tr className="border-b border-border text-muted-foreground">
                                    <th className="py-1 pr-3 font-medium">Stat</th>
                                    <th className="py-1 pr-3 font-medium">Max @ R{arcane.maxRank}</th>
                                    <th className="py-1 pr-3 font-medium">@ R{expandedRank}</th>
                                    <th className="py-1 font-medium">Flags</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {def.effects.map((line) => {
                                    const atMax = scaleArcaneEffectValue(line.maxValue, arcane.maxRank, def.maxRank);
                                    const atRank = scaleArcaneEffectValue(line.maxValue, expandedRank, def.maxRank);
                                    return (
                                      <tr key={line.stat} className="border-b border-border/50">
                                        <td className="py-1 pr-3 font-mono">{line.stat}</td>
                                        <td className="py-1 pr-3 font-mono">
                                          {line.flat ? atMax : `${atMax}%`}
                                        </td>
                                        <td className="py-1 pr-3 font-mono text-purple-300">
                                          {line.flat ? atRank : `${atRank}%`}
                                        </td>
                                        <td className="py-1 text-muted-foreground">
                                          {[line.flat && "flat", line.stacking && "stacking"].filter(Boolean).join(", ") || "—"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {coverage.hasLegacyStats && (
                          <div className="mt-4">
                            <PanelHeading>Legacy mod.stats</PanelHeading>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(arcane.stats).map(([stat, value]) => (
                                <span key={stat} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                  {stat}: {value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                          <a
                            href={getArcaneWikiUrl(arcane.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-purple-500/40 hover:text-purple-300"
                          >
                            <ExternalLink className="h-2.5 w-2.5" /> Wiki
                          </a>
                          <a
                            href={`/report-issue?type=mod&name=${encodeURIComponent(arcane.name)}&id=${encodeURIComponent(arcane.id)}`}
                            className="inline-flex items-center gap-1 rounded border border-amber-500/30 px-2 py-1 text-[10px] text-amber-400/70 transition-colors hover:bg-amber-500/5 hover:text-amber-400"
                          >
                            <Flag className="h-2.5 w-2.5" /> Report Issue
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </ContentPanel>
      </PageMain>
    </PageShell>
  );
}
