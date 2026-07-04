"use client";

import { useState, type MouseEvent } from "react";
import { Mod, getRivenStatsForCategory } from "@/lib/types";
import { X, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { PolarityIcon, polarityNames } from "@/components/polarity-icon";
import { getModImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";
import { UMBRAL_MOD_IDS, getUmbralSetBonusMultiplier } from "@/lib/set-bonuses";
import {
  getPolarityCapacityEffect,
  modCapacityAtRank,
  modSlotCapacityCost,
} from "@/lib/mod-capacity";

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
  /** When set (warframe builder), Umbral set bonuses scale displayed mod stats. */
  equippedModIds?: string[];
}

function FormaPolarizeButton({
  active,
  slotPolarity,
  onClick,
}: {
  active: boolean;
  slotPolarity?: string;
  onClick: (e: MouseEvent) => void;
}) {
  const polarized = Boolean(slotPolarity);
  const polarityLabel = slotPolarity ? polarityNames[slotPolarity] || slotPolarity : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute bottom-1.5 right-1.5 z-10 flex items-center justify-center rounded-md border transition-all shadow-sm",
        polarized
          ? cn(
              "p-1 min-w-[28px] min-h-[28px]",
              active
                ? "border-primary/60 bg-primary/15 ring-1 ring-primary/40"
                : "border-border/80 bg-card/90 hover:border-primary/40 hover:bg-secondary/80"
            )
          : cn(
              "gap-1 px-1.5 py-0.5 text-[10px] font-semibold leading-none",
              active
                ? "border-yellow-400 bg-yellow-500/25 text-yellow-300 ring-1 ring-yellow-400/40"
                : "border-yellow-500/50 bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 hover:border-yellow-400/70"
            )
      )}
      title={
        polarized
          ? `Slot polarized as ${polarityLabel} — click to change`
          : "Forma — polarize this slot to match a mod and halve its drain"
      }
    >
      {polarized && slotPolarity ? (
        <PolarityIcon polarity={slotPolarity} size={18} />
      ) : (
        <>
          <span className="text-[11px] leading-none" aria-hidden>⬡</span>
          <span>Forma</span>
        </>
      )}
    </button>
  );
}

function PolarityPicker({
  slotPolarity,
  onPolarize,
  onClose,
}: {
  slotPolarity?: string;
  onPolarize: (polarity: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-yellow-500/30 rounded-lg p-2 shadow-lg shadow-black/30">
      <p className="text-[10px] font-medium text-yellow-400/90 mb-1.5 px-0.5">
        Forma — pick slot polarity
      </p>
      <div className="grid grid-cols-4 gap-1">
        {ALL_POLARITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { onPolarize(p); onClose(); }}
            className={cn(
              "flex items-center justify-center p-1.5 rounded border transition-all",
              slotPolarity === p ? "border-yellow-500/60 bg-yellow-500/15" : "border-border hover:border-yellow-500/40"
            )}
            title={polarityNames[p] || p}
          >
            <PolarityIcon polarity={p} size={14} />
          </button>
        ))}
      </div>
      {slotPolarity && (
        <button
          type="button"
          onClick={() => { onPolarize(null); onClose(); }}
          className="w-full mt-1.5 text-[10px] text-red-400 hover:text-red-300 py-1"
        >
          Remove polarity
        </button>
      )}
    </div>
  );
}

export function ModSlotCard({ mod, rank, slotIndex, label, slotPolarity, rivenStats, weaponCategory, onAdd, onRemove, onPolarize, onEditRiven, equippedModIds }: ModSlotProps) {
  const [showPolarityPicker, setShowPolarityPicker] = useState(false);

  if (!mod) {
    return (
      <div className="relative">
        <button
          onClick={onAdd}
          className="w-full min-h-24 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-solid hover:border-primary border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            <span className="text-xs">{label || `Slot ${slotIndex + 1}`}</span>
          </div>
        </button>
        {onPolarize && (
          <FormaPolarizeButton
            active={showPolarityPicker}
            slotPolarity={slotPolarity}
            onClick={(e) => { e.stopPropagation(); setShowPolarityPicker(!showPolarityPicker); }}
          />
        )}
        {showPolarityPicker && onPolarize && (
          <PolarityPicker
            slotPolarity={slotPolarity}
            onPolarize={onPolarize}
            onClose={() => setShowPolarityPicker(false)}
          />
        )}
      </div>
    );
  }

  const borderColor = rarityBorderColors[mod.rarity] || "border-border";
  const drainAtRank = modCapacityAtRank(mod.drain, rank);
  const effectiveDrain = modSlotCapacityCost(drainAtRank, slotPolarity, mod.polarity);
  const polarityEffect = getPolarityCapacityEffect(slotPolarity, mod.polarity);

  const umbralCount = equippedModIds?.filter((id) => UMBRAL_MOD_IDS.includes(id as (typeof UMBRAL_MOD_IDS)[number])).length ?? 0;
  const umbralSetMult = getUmbralSetBonusMultiplier(mod.id, umbralCount);

  // Format mod stats into readable lines at the currently equipped rank
  const statEntries = Object.entries(mod.stats).slice(0, 3);
  const formatStat = (key: string, perRankVal: number) => {
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
    const setMult = key === "tauResistance" ? 1 : umbralSetMult;
    const scaled = perRankVal * (rank + 1) * setMult;
    const sign = scaled > 0 ? "+" : "";
    const decimals = scaled % 1 !== 0 ? 1 : 0;
    return `${sign}${scaled.toFixed(decimals)}% ${label}`;
  };

  return (
    <div className={cn("group relative w-full min-h-24 border rounded-lg p-3 bg-card transition-all hover:ring-2 hover:ring-primary/20", borderColor)}>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors z-10"
      >
        <X className="h-3 w-3" />
      </button>
      {onPolarize && (
        <FormaPolarizeButton
          active={showPolarityPicker}
          slotPolarity={slotPolarity}
          onClick={(e) => { e.stopPropagation(); setShowPolarityPicker(!showPolarityPicker); }}
        />
      )}
      <div className="flex items-start gap-2.5">
        <GameAssetImage
          src={getModImage(mod.name)}
          alt=""
          width={44}
          height={44}
          className="w-11 h-11 rounded object-contain bg-muted/20 shrink-0 mt-0.5"
          hideOnError
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <PolarityIcon polarity={mod.polarity} size={14} />
            <span className="text-[13px] font-semibold truncate leading-tight">{mod.name}</span>
          </div>
          {mod.subCategory === "riven" && rivenStats && Object.keys(rivenStats).length > 0 ? (
            <div className="text-[11px] text-purple-300 mt-0.5 space-y-0 leading-snug">
              {Object.entries(rivenStats).slice(0, 3).map(([k, v]) => {
                const pool = weaponCategory ? getRivenStatsForCategory(weaponCategory) : [];
                const lbl = pool.find(s => s.key === k)?.label || k;
                return <div key={k} className="truncate">{v >= 0 ? "+" : ""}{(v * 100).toFixed(1)}% {lbl}</div>;
              })}
              {Object.keys(rivenStats).length > 3 && <div className="text-purple-400/60">+{Object.keys(rivenStats).length - 3} more</div>}
            </div>
          ) : statEntries.length > 0 ? (
            <div className="text-[11px] text-cyan-300/80 mt-0.5 space-y-0 leading-snug">
              {statEntries.map(([k, v]) => (
                <div key={k} className="truncate">{formatStat(k, v as number)}</div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
              {mod.description.replace(/<[^>]+>/g, "").substring(0, 80)}
            </div>
          )}
          <div className="flex items-center gap-2.5 mt-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">
              R{rank}/{mod.maxRank}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                polarityEffect === "match"
                  ? "text-green-400"
                  : polarityEffect === "mismatch"
                    ? "text-red-400"
                    : "text-muted-foreground",
              )}
            >
              ⚡{effectiveDrain}
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
        <PolarityPicker
          slotPolarity={slotPolarity}
          onPolarize={onPolarize}
          onClose={() => setShowPolarityPicker(false)}
        />
      )}
    </div>
  );
}
