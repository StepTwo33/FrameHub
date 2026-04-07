"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { allMods } from "@/data/mods";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Primary", "Secondary", "Melee", "Warframe", "Augment", "Companion", "Archwing"];
const POLARITIES = ["All", "madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra"];
const RARITIES = ["All", "Common", "Uncommon", "Rare", "Legendary"];

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

export default function ModBrowserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPolarity, setSelectedPolarity] = useState("All");
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [expandedMod, setExpandedMod] = useState<string | null>(null);

  const filteredMods = useMemo(() => {
    let mods = [...allMods];

    if (selectedCategory !== "All") {
      mods = mods.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedPolarity !== "All") {
      mods = mods.filter((m) => m.polarity === selectedPolarity);
    }
    if (selectedRarity !== "All") {
      mods = mods.filter((m) => m.rarity.toLowerCase() === selectedRarity.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mods = mods.filter(
        (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      );
    }

    return mods.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory, selectedPolarity, selectedRarity]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Mod Browser</h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mods by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground py-1.5 w-16 hidden sm:inline">Category</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg border transition-colors",
                    selectedCategory === cat
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground py-1.5 w-16 hidden sm:inline">Polarity</span>
              {POLARITIES.map((pol) => (
                <button
                  key={pol}
                  onClick={() => setSelectedPolarity(pol)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg border capitalize transition-colors",
                    selectedPolarity === pol
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                  style={selectedPolarity === pol && pol !== "All" ? { backgroundColor: POLARITY_COLORS[pol], borderColor: POLARITY_COLORS[pol] } : undefined}
                >
                  {pol}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground py-1.5 w-16 hidden sm:inline">Rarity</span>
              {RARITIES.map((rar) => (
                <button
                  key={rar}
                  onClick={() => setSelectedRarity(rar)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg border transition-colors",
                    selectedRarity === rar
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {rar}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3">{filteredMods.length} mods found</p>

          {/* Mod List */}
          <ScrollArea className="h-[60vh]">
            <div className="space-y-1 pr-4">
              {filteredMods.map((mod) => (
                <div key={mod.id}>
                  <button
                    onClick={() => setExpandedMod(expandedMod === mod.id ? null : mod.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      expandedMod === mod.id
                        ? "border-blue-500/50 bg-blue-500/5"
                        : "border-border hover:border-blue-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: RARITY_COLORS[mod.rarity] ?? "#9CA3AF" }}
                      />
                      <span className="font-medium text-sm flex-1">{mod.name}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                        style={{ backgroundColor: (POLARITY_COLORS[mod.polarity] ?? "#6B7280") + "20", color: POLARITY_COLORS[mod.polarity] ?? "#6B7280" }}
                      >
                        {mod.polarity}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize hidden sm:inline">{mod.category || "—"}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {mod.drain}/{mod.maxRank}
                      </span>
                    </div>
                  </button>
                  {expandedMod === mod.id && (
                    <div className="ml-4 mt-1 mb-2 p-3 border border-border rounded-lg bg-card">
                      {mod.description && <p className="text-sm text-muted-foreground mb-2">{mod.description}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span><strong>Drain:</strong> {mod.drain}</span>
                        <span><strong>Max Rank:</strong> {mod.maxRank}</span>
                        <span className="capitalize"><strong>Rarity:</strong> {mod.rarity}</span>
                        <span className="capitalize"><strong>Polarity:</strong> {mod.polarity}</span>
                        {mod.subCategory && <span className="capitalize"><strong>Sub:</strong> {mod.subCategory}</span>}
                      </div>
                      {Object.keys(mod.stats).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(mod.stats).map(([stat, value]) => {
                            const maxVal = value * (mod.maxRank + 1);
                            const label = stat.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
                            const decimals = maxVal % 1 !== 0 ? 1 : 0;
                            return (
                              <span key={stat} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                                {label}: {maxVal > 0 ? "+" : ""}{maxVal.toFixed(decimals)}%
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-border">
                        <a
                          href={`/report-issue?type=mod&name=${encodeURIComponent(mod.name)}&id=${encodeURIComponent(mod.id)}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-amber-500/30 text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/5 transition-colors"
                        >
                          <Flag className="h-2.5 w-2.5" /> Report Issue
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}
