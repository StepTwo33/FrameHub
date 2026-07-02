"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PublicBuildRow } from "@/components/public-build-row";
import { Search, Loader2, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

function resolveItemName(type: string, itemId: string): string | null {
  if (!itemId) return null;
  if (type === "weapon") return allWeapons.find((w) => w.id === itemId)?.name ?? null;
  if (type === "warframe") return allWarframes.find((w) => w.id === itemId)?.name ?? null;
  if (type === "companion") return allCompanions.find((c) => c.id === itemId)?.name ?? null;
  return null;
}

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Discover Builds</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Browse community builds shared by other Tenno. Search by name or filter to a specific weapon or warframe.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {(["recent", "popular"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={cn(
                "px-4 py-1.5 text-xs rounded-full border transition-colors font-medium",
                sort === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "recent" ? "Most Recent" : "Top Rated"}
            </button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search build names and descriptions…"
            className="pl-9"
          />
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={itemFilter ? itemFilter.name : itemSearch}
            onChange={(e) => {
              setItemSearch(e.target.value);
              setItemFilter(null);
              setShowItemSuggestions(true);
            }}
            onFocus={() => setShowItemSuggestions(true)}
            placeholder="Filter by weapon or warframe…"
            className="pl-9 pr-9"
          />
          {(itemFilter || itemSearch) && (
            <button
              type="button"
              onClick={() => {
                setItemFilter(null);
                setItemSearch("");
                setShowItemSuggestions(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showItemSuggestions && itemSuggestions.length > 0 && !itemFilter && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              {itemSuggestions.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => {
                    setItemFilter(item);
                    setItemSearch("");
                    setShowItemSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/70 transition-colors flex justify-between"
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {BUILD_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg border transition-all",
                typeFilter === t.id
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-24 rounded-xl border border-dashed border-border bg-card/30">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No community builds yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Save a build in any builder and check &quot;List in Community Builds&quot; to share it here.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[calc(100vh-22rem)]">
              <div className="space-y-2 pr-3">
                {builds.map((build) => {
                  const itemName = resolveItemName(build.type, build.itemId);
                  return (
                    <div key={build.id}>
                      {itemName && (
                        <div className="text-[10px] text-muted-foreground mb-1 px-1">{itemName}</div>
                      )}
                      <PublicBuildRow build={build} />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            {nextCursor && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => fetchBuilds(nextCursor, true)}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:border-primary/40 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
