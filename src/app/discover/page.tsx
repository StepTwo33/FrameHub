"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PublicBuildRow } from "@/components/public-build-row";
import {
  PageShell,
  PageMain,
  PageHero,
  FilterChip,
  ContentPanel,
  EmptyState,
} from "@/components/page-shell";
import { Search, Loader2, Users, X } from "lucide-react";
import type { PublicBuildSummary } from "@/lib/build-types";
import { allWeapons } from "@/data/weapons";
import { allWarframes } from "@/data/warframes";
import { allCompanions } from "@/data/companions";

const BUILD_TYPES = [
  { id: "all", label: "All" },
  { id: "weapon", label: "Weapons" },
  { id: "warframe", label: "Warframes" },
  { id: "companion", label: "Companions" },
  { id: "modular", label: "Modular" },
  { id: "archwing", label: "Archwing" },
  { id: "railjack", label: "Railjack" },
] as const;

interface ItemSuggestion {
  id: string;
  name: string;
  type: string;
}

export default function DiscoverPage() {
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemFilter, setItemFilter] = useState<ItemSuggestion | null>(null);
  const [itemSearch, setItemSearch] = useState("");
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [builds, setBuilds] = useState<(PublicBuildSummary & { voted?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const itemSuggestions = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (q.length < 2) return [];
    const results: ItemSuggestion[] = [];
    const limit = 8;
    for (const w of allWeapons) {
      if (w.name.toLowerCase().includes(q)) {
        results.push({ id: w.id, name: w.name, type: "weapon" });
        if (results.length >= limit) break;
      }
    }
    if (results.length < limit) {
      for (const wf of allWarframes) {
        if (wf.name.toLowerCase().includes(q)) {
          results.push({ id: wf.id, name: wf.name, type: "warframe" });
          if (results.length >= limit) break;
        }
      }
    }
    return results;
  }, [itemSearch]);

  const fetchBuilds = useCallback(
    async (cursor?: string | null, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          sort: sort === "popular" ? "popular" : "recent",
          limit: "24",
        });
        if (typeFilter !== "all") params.set("type", typeFilter);
        if (itemFilter) {
          params.set("itemId", itemFilter.id);
          if (typeFilter === "all") params.set("type", itemFilter.type);
        }
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/builds/public?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        setBuilds((prev) => (append ? [...prev, ...(data.builds ?? [])] : data.builds ?? []));
        setNextCursor(data.nextCursor ?? null);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sort, typeFilter, itemFilter, searchQuery]
  );

  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);

  return (
    <PageShell>
      <PageMain maxWidth="md">
        <PageHero
          icon={Users}
          accent="primary"
          title="Discover Builds"
          description="Browse community builds shared by other Tenno. Search by name or filter to a specific weapon or warframe."
        />

        <ContentPanel className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["recent", "popular"] as const).map((s) => (
              <FilterChip key={s} active={sort === s} onClick={() => setSort(s)}>
                {s === "recent" ? "Most Recent" : "Top Rated"}
              </FilterChip>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search build names and descriptions…"
              className="border-border/60 bg-background/50 pl-9"
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={itemFilter ? itemFilter.name : itemSearch}
              onChange={(e) => {
                setItemSearch(e.target.value);
                setItemFilter(null);
                setShowItemSuggestions(true);
              }}
              onFocus={() => setShowItemSuggestions(true)}
              placeholder="Filter by weapon or warframe…"
              className="border-border/60 bg-background/50 pl-9 pr-9"
            />
            {(itemFilter || itemSearch) && (
              <button
                type="button"
                onClick={() => {
                  setItemFilter(null);
                  setItemSearch("");
                  setShowItemSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showItemSuggestions && itemSuggestions.length > 0 && !itemFilter && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border/70 bg-card/95 shadow-xl backdrop-blur-md">
                {itemSuggestions.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => {
                      setItemFilter(item);
                      setItemSearch("");
                      setShowItemSuggestions(false);
                    }}
                    className="flex w-full justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/5"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs capitalize text-muted-foreground">{item.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {BUILD_TYPES.map((t) => (
              <FilterChip key={t.id} active={typeFilter === t.id} onClick={() => setTypeFilter(t.id)}>
                {t.label}
              </FilterChip>
            ))}
          </div>
        </ContentPanel>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : builds.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No community builds yet"
            description='Save a build in any builder and check "List in Community Builds" to share it here.'
          />
        ) : (
          <>
            <ScrollArea className="max-h-[calc(100vh-22rem)]">
              <div className="space-y-3 pr-3">
                {builds.map((build) => (
                  <PublicBuildRow key={build.id} build={build} />
                ))}
              </div>
            </ScrollArea>
            {nextCursor && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => fetchBuilds(nextCursor, true)}
                  className="rounded-lg border border-border/70 bg-card/50 px-5 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </PageMain>
    </PageShell>
  );
}
