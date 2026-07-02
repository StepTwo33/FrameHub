"use client";

import { useState, useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { modsMap } from "@/data/mods";
import { cn } from "@/lib/utils";
import { modSlotCapacityCost } from "@/lib/mod-capacity";
import { Zap, RotateCcw } from "lucide-react";

const POLARITIES = [
  { id: "", name: "None", abbr: "—", color: "#6B7280" },
  { id: "madurai", name: "Madurai", abbr: "V", color: "#FF6B35" },
  { id: "vazarin", name: "Vazarin", abbr: "D", color: "#2ECC71" },
  { id: "naramon", name: "Naramon", abbr: "—", color: "#00B4D8" },
  { id: "zenurik", name: "Zenurik", abbr: "⚡", color: "#9B59B6" },
  { id: "unairu", name: "Unairu", abbr: "⚊", color: "#95A5A6" },
  { id: "penjaga", name: "Penjaga", abbr: "Y", color: "#1ABC9C" },
  { id: "umbra", name: "Umbra", abbr: "U", color: "#E74C3C" },
];

function calculateModCost(modDrain: number, modRank: number, modPolarity: string, slotPolarity: string): number {
  const baseCost = modDrain + modRank;
  return modSlotCapacityCost(baseCost, slotPolarity || undefined, modPolarity);
}

interface SlotState {
  polarity: string;
  modId: string | null;
  modRank: number;
}

export default function FormaPlannerPage() {
  const [itemType, setItemType] = useState<"weapon" | "warframe">("weapon");
  const [hasOrokin, setHasOrokin] = useState(false);
  const [slots, setSlots] = useState<SlotState[]>(
    Array.from({ length: 8 }, () => ({ polarity: "", modId: null, modRank: 0 }))
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const slotCount = itemType === "warframe" ? 10 : 8;
  const baseCapacity = hasOrokin ? 60 : 30;

  const handleTypeChange = (type: "weapon" | "warframe") => {
    setItemType(type);
    setSlots(Array.from({ length: type === "warframe" ? 10 : 8 }, () => ({ polarity: "", modId: null, modRank: 0 })));
    setSelectedSlot(null);
  };

  const handleSetPolarity = (slotIndex: number, polarity: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = { ...next[slotIndex], polarity };
      return next;
    });
  };

  const formaCount = slots.filter((s) => s.polarity !== "").length;

  const totalCost = useMemo(() => {
    return slots.reduce((sum, slot) => {
      if (!slot.modId) return sum;
      const mod = modsMap.get(slot.modId);
      if (!mod) return sum;
      return sum + calculateModCost(mod.drain, slot.modRank, mod.polarity, slot.polarity);
    }, 0);
  }, [slots]);

  const suggestions = useMemo(() => {
    const results: { slotIndex: number; suggestedPolarity: string; savings: number; modName: string }[] = [];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.modId) continue;
      const mod = modsMap.get(slot.modId);
      if (!mod) continue;
      if (slot.polarity === mod.polarity) continue;

      const currentCost = calculateModCost(mod.drain, slot.modRank, mod.polarity, slot.polarity);
      const potentialCost = calculateModCost(mod.drain, slot.modRank, mod.polarity, mod.polarity);
      const savings = currentCost - potentialCost;
      if (savings > 0) {
        results.push({ slotIndex: i, suggestedPolarity: mod.polarity, savings, modName: mod.name });
      }
    }
    return results.sort((a, b) => b.savings - a.savings).slice(0, 5);
  }, [slots]);

  return (
    <PageShell>
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Forma Planner</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-1">
              {(["weapon", "warframe"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg border capitalize transition-colors",
                    itemType === t ? "bg-amber-600 border-amber-600 text-white" : "border-border text-muted-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => setHasOrokin(!hasOrokin)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all",
                hasOrokin ? "bg-blue-500/10 border-blue-500/50 text-blue-400" : "border-border text-muted-foreground"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              {hasOrokin ? (itemType === "weapon" ? "Catalyst Installed" : "Reactor Installed") : `Orokin ${itemType === "weapon" ? "Catalyst" : "Reactor"}`}
            </button>
            <button
              onClick={() => setSlots(Array.from({ length: slotCount }, () => ({ polarity: "", modId: null, modRank: 0 })))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          {/* Capacity Overview */}
          <div className="border border-border rounded-xl p-4 bg-card mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Capacity</span>
              <span className={cn("text-sm font-mono font-bold", totalCost > baseCapacity ? "text-red-400" : "text-foreground")}>
                {totalCost} / {baseCapacity}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", totalCost > baseCapacity ? "bg-red-500" : "bg-amber-500")}
                style={{ width: `${Math.min(100, (totalCost / baseCapacity) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Forma Used: {formaCount}</span>
              <span>Remaining: {baseCapacity - totalCost}</span>
            </div>
          </div>

          {/* Polarity Grid */}
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-3">SLOT POLARITIES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {slots.slice(0, slotCount).map((slot, i) => {
              const mod = slot.modId ? modsMap.get(slot.modId) : null;
              const pol = POLARITIES.find((p) => p.id === slot.polarity) ?? POLARITIES[0];
              return (
                <div
                  key={i}
                  className={cn(
                    "border rounded-xl p-3 bg-card cursor-pointer transition-all",
                    selectedSlot === i ? "border-amber-500 ring-1 ring-amber-500/30" : "border-border hover:border-amber-500/30"
                  )}
                  onClick={() => setSelectedSlot(selectedSlot === i ? null : i)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground">Slot {i + 1}</span>
                    <span className="text-xs font-bold" style={{ color: pol.color }}>{pol.name !== "None" ? pol.abbr : "—"}</span>
                  </div>
                  {slot.polarity ? (
                    <div className="text-xs font-medium" style={{ color: pol.color }}>{pol.name}</div>
                  ) : (
                    <div className="text-xs text-muted-foreground/50">No polarity</div>
                  )}
                  {mod && (
                    <div className="text-[10px] text-muted-foreground mt-1 truncate">
                      {mod.name} ({calculateModCost(mod.drain, slot.modRank, mod.polarity, slot.polarity)})
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Polarity Picker for Selected Slot */}
          {selectedSlot !== null && (
            <div className="border border-amber-500/30 rounded-xl p-4 bg-card mb-6">
              <h3 className="text-sm font-semibold mb-3">Set Polarity for Slot {selectedSlot + 1}</h3>
              <div className="flex gap-2 flex-wrap">
                {POLARITIES.map((pol) => (
                  <button
                    key={pol.id}
                    onClick={() => handleSetPolarity(selectedSlot, pol.id)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg border transition-all",
                      slots[selectedSlot]?.polarity === pol.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-border hover:border-foreground/30"
                    )}
                    style={slots[selectedSlot]?.polarity === pol.id ? { color: pol.color } : undefined}
                  >
                    {pol.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border border-border rounded-xl p-4 bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">FORMA SUGGESTIONS</h3>
              <div className="space-y-2">
                {suggestions.map((s, i) => {
                  const pol = POLARITIES.find((p) => p.id === s.suggestedPolarity);
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background">
                      <div>
                        <span className="text-sm">{s.modName}</span>
                        <span className="text-xs text-muted-foreground ml-2">Slot {s.slotIndex + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: pol?.color }}>→ {pol?.name}</span>
                        <span className="text-xs font-mono text-green-400">-{s.savings} drain</span>
                        <button
                          onClick={() => handleSetPolarity(s.slotIndex, s.suggestedPolarity)}
                          className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}
