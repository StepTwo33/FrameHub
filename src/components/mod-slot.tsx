"use client";

import { useState } from "react";
import { Mod, getRivenStatsForCategory } from "@/lib/types";
import { X, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { PolarityIcon, polarityNames } from "@/components/polarity-icon";
import { getModImage } from "@/lib/images";

const rarityBorderColors: Record<string, string> = {
  common: "border-amber-900/50",
  uncommon: "border-slate-400/50",
  rare: "border-yellow-500/50",
  legendary: "border-white/50",
};

const ALL_POLARITIES = ["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra", "universal"];

interface ModSlotProps {
  mod: Mod | null;
  rank: number;
  slotIndex: number;
  label?: string;
  slotPolarity?: string;
  rivenStats?: Record<string, number>;
  weaponCategory?: string;
  onAdd: () => void;
  onRemove: () => void;
  onPolarize?: (polarity: string | null) => void;
  onEditRiven?: () => void;
}

export function ModSlotCard({ mod, rank, slotIndex, label, slotPolarity, rivenStats, weaponCategory, onAdd, onRemove, onPolarize, onEditRiven }: ModSlotProps) {
  const [showPolarityPicker, setShowPolarityPicker] = useState(false);

  const polarityDrainMod = (modPol: string, slotPol?: string): number => {
    if (!slotPol || slotPol === "universal") return 0;
    if (modPol === slotPol) return -1; // matching = halved
    return 1; // mismatched = +25% penalty (simplified)
  };

  if (!mod) {
    return (
      <div className="relative">
        <button
          onClick={onAdd}
          className="w-full h-20 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all group"
        >
          {slotPolarity && (
            <PolarityIcon polarity={slotPolarity} size={14} />
          )}
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            <span className="text-xs">{label || `Slot ${slotIndex + 1}`}</span>
          </div>
        </button>
        {onPolarize && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowPolarityPicker(!showPolarityPicker); }}
            className="absolute bottom-1 right-1 p-0.5 rounded text-[9px] text-muted-foreground hover:text-foreground transition-colors"
            title="Set polarity"
          >
            ◆
          </button>
        )}
        {showPolarityPicker && onPolarize && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg p-2 shadow-lg">
            <div className="grid grid-cols-4 gap-1">
              {ALL_POLARITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => { onPolarize(p); setShowPolarityPicker(false); }}
                  className={cn(
                    "flex items-center justify-center p-1.5 rounded border transition-all",
                    slotPolarity === p ? "border-blue-500/50 bg-blue-500/10" : "border-border hover:border-blue-500/30"
                  )}
                  title={polarityNames[p] || p}
                >
                  <PolarityIcon polarity={p} size={14} />
                </button>
              ))}
            </div>
            {slotPolarity && (
              <button
                onClick={() => { onPolarize(null); setShowPolarityPicker(false); }}
                className="w-full mt-1 text-[10px] text-red-400 hover:text-red-300 py-1"
              >
                Remove Polarity
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const borderColor = rarityBorderColors[mod.rarity] || "border-border";
  const drainVal = mod.drain + rank;
  const polMatch = polarityDrainMod(mod.polarity, slotPolarity);
  const effectiveDrain = polMatch === -1 ? Math.ceil(drainVal / 2) : polMatch === 1 ? Math.ceil(drainVal * 1.25) : drainVal;

  return (
    <div className={cn("relative w-full h-20 border rounded-lg p-3 bg-card", borderColor)}>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
      {onPolarize && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowPolarityPicker(!showPolarityPicker); }}
          className="absolute bottom-1 right-1 p-0.5 rounded text-[9px] text-muted-foreground hover:text-foreground transition-colors"
          title="Set polarity"
        >
          ◆
        </button>
      )}
      <div className="flex items-start gap-2 h-full">
        <img
          src={getModImage(mod.name)}
          alt=""
          className="w-10 h-10 rounded object-contain bg-muted/20 shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {slotPolarity && <PolarityIcon polarity={slotPolarity} size={12} />}
            <PolarityIcon polarity={mod.polarity} size={14} />
            <span className="text-sm font-medium truncate">{mod.name}</span>
          </div>
          {mod.subCategory === "riven" && rivenStats && Object.keys(rivenStats).length > 0 ? (
            <div className="text-[10px] text-purple-300 mt-0.5 space-y-0">
              {Object.entries(rivenStats).slice(0, 2).map(([k, v]) => {
                const pool = weaponCategory ? getRivenStatsForCategory(weaponCategory) : [];
                const lbl = pool.find(s => s.key === k)?.label || k;
                return <div key={k}>{v >= 0 ? "+" : ""}{(v * 100).toFixed(1)}% {lbl}</div>;
              })}
              {Object.keys(rivenStats).length > 2 && <div>+{Object.keys(rivenStats).length - 2} more</div>}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {mod.description.replace(/<[^>]+>/g, "").substring(0, 60)}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">
              Rank {rank}/{mod.maxRank}
            </span>
            <span className={cn("text-[10px]", polMatch === -1 ? "text-green-400" : polMatch === 1 ? "text-red-400" : "text-muted-foreground")}>
              Drain: {effectiveDrain}
            </span>
            {mod.subCategory === "riven" && onEditRiven && (
              <button onClick={(e) => { e.stopPropagation(); onEditRiven(); }} className="text-purple-400 hover:text-purple-300 transition-colors" title="Edit Riven Stats">
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
      {showPolarityPicker && onPolarize && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg p-2 shadow-lg">
          <div className="grid grid-cols-4 gap-1">
            {ALL_POLARITIES.map((p) => (
              <button
                key={p}
                onClick={() => { onPolarize(p); setShowPolarityPicker(false); }}
                className={cn(
                  "flex items-center justify-center p-1.5 rounded border transition-all",
                  slotPolarity === p ? "border-blue-500/50 bg-blue-500/10" : "border-border hover:border-blue-500/30"
                )}
                title={polarityNames[p] || p}
              >
                <PolarityIcon polarity={p} size={14} />
              </button>
            ))}
          </div>
          {slotPolarity && (
            <button
              onClick={() => { onPolarize(null); setShowPolarityPicker(false); }}
              className="w-full mt-1 text-[10px] text-red-400 hover:text-red-300 py-1"
            >
              Remove Polarity
            </button>
          )}
        </div>
      )}
    </div>
  );
}
