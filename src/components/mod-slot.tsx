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
import { cleanModDescription, formatModStatValue } from "@/lib/mod-display";

const rarityBorderColors: Record<string, string> = {
  common: "border-amber-700/40 dark:border-amber-900/50",
  uncommon: "border-slate-400/60 dark:border-slate-400/50",
  rare: "border-yellow-600/50 dark:border-yellow-500/50",
  legendary: "border-violet-500/50 dark:border-white/50",
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
  /** Tighter layout for narrow sidebars — prefer full-width grids instead when possible. */
  compact?: boolean;
  /** Inline forma control in the footer row instead of overlapping the card corner. */
  inlineForma?: boolean;
}

function FormaPolarizeButton({
  active,
  slotPolarity,
  onClick,
  inline = false,
}: {
  active: boolean;
  slotPolarity?: string;
  onClick: (e: MouseEvent) => void;
  inline?: boolean;
}) {
  const polarized = Boolean(slotPolarity);
  const polarityLabel = slotPolarity ? polarityNames[slotPolarity] || slotPolarity : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border transition-all shadow-sm",
        inline ? "relative h-7" : "absolute bottom-1.5 right-1.5 z-10",
        polarized
          ? cn(
              "p-1 min-w-[28px] min-h-[28px]",
              active
                ? "border-primary/60 bg-primary/15 ring-1 ring-primary/40"
                : "border-border/80 bg-card/90 hover:border-primary/40 hover:bg-secondary/80"
            )
          : cn(
              "h-7 gap-1 px-2 text-[10px] font-semibold leading-none",
              active
                ? "border-yellow-600 bg-yellow-500/20 text-yellow-900 ring-1 ring-yellow-500/40 dark:border-yellow-400 dark:bg-yellow-500/25 dark:text-yellow-300 dark:ring-yellow-400/40"
                : "border-yellow-600/60 bg-yellow-500/10 text-yellow-800 hover:bg-yellow-500/20 hover:border-yellow-600/80 dark:border-yellow-500/50 dark:bg-yellow-500/15 dark:text-yellow-400 dark:hover:bg-yellow-500/25 dark:hover:border-yellow-400/70"
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
    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-yellow-600/30 dark:border-yellow-500/30 rounded-lg p-2 shadow-lg shadow-[var(--shadow-color)]">
      <p className="text-[10px] font-medium text-yellow-800/90 dark:text-yellow-400/90 mb-1.5 px-0.5">
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
          className="w-full mt-1.5 text-[10px] text-red-700 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 py-1"
        >
          Remove polarity
        </button>
      )}
    </div>
  );
}

export function ModSlotCard({ mod, rank, slotIndex, label, slotPolarity, rivenStats, weaponCategory, onAdd, onRemove, onPolarize, onEditRiven, equippedModIds, compact, inlineForma = true }: ModSlotProps) {
  const [showPolarityPicker, setShowPolarityPicker] = useState(false);

  if (!mod) {
    return (
      <div className="relative flex min-h-24 flex-col">
        <button
          onClick={onAdd}
          className="flex min-h-24 flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-all hover:border-solid hover:border-primary/40 hover:bg-primary/5 hover:text-primary group"
        >
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            <span className="text-xs">{label || `Slot ${slotIndex + 1}`}</span>
          </div>
        </button>
        {onPolarize && (
          <div className="mt-1.5 flex justify-end">
            <FormaPolarizeButton
              inline
              active={showPolarityPicker}
              slotPolarity={slotPolarity}
              onClick={(e) => { e.stopPropagation(); setShowPolarityPicker(!showPolarityPicker); }}
            />
          </div>
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

  const statEntries = Object.entries(mod.stats).slice(0, compact ? 2 : 3);
  const formatStat = (key: string, perRankVal: number) => {
    const setMult = key === "tauResistance" ? 1 : umbralSetMult;
    return formatModStatValue(key, perRankVal, rank, setMult);
  };

  return (
    <div className={cn(
      "group relative flex w-full flex-col rounded-lg border bg-card transition-all hover:ring-2 hover:ring-primary/20",
      compact ? "min-h-[6.5rem] p-2.5" : "min-h-[6.75rem] p-3",
      borderColor,
    )}>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex min-h-0 flex-1 items-start gap-2.5 pr-5">
        <GameAssetImage
          src={getModImage(mod.name)}
          alt=""
          width={44}
          height={44}
          className={cn(
            "mt-0.5 shrink-0 rounded bg-muted/20 object-contain",
            compact ? "h-9 w-9" : "h-11 w-11",
          )}
          hideOnError
        />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-start gap-1.5">
            <PolarityIcon polarity={mod.polarity} size={14} className="mt-0.5 shrink-0" />
            <span className={cn("font-semibold leading-snug", compact ? "text-xs line-clamp-2" : "text-[13px] line-clamp-2")}>
              {mod.name}
            </span>
          </div>
          {mod.subCategory === "riven" && rivenStats && Object.keys(rivenStats).length > 0 ? (
            <div className="mt-0.5 space-y-0 text-[11px] leading-snug text-purple-800 dark:text-purple-300">
              {Object.entries(rivenStats).slice(0, 3).map(([k, v]) => {
                const pool = weaponCategory ? getRivenStatsForCategory(weaponCategory) : [];
                const lbl = pool.find(s => s.key === k)?.label || k;
                return <div key={k} className="truncate">{v >= 0 ? "+" : ""}{(v * 100).toFixed(1)}% {lbl}</div>;
              })}
              {Object.keys(rivenStats).length > 3 && <div className="text-purple-600/70 dark:text-purple-400/60">+{Object.keys(rivenStats).length - 3} more</div>}
            </div>
          ) : statEntries.length > 0 ? (
            <div className="mt-0.5 space-y-0.5 text-[11px] leading-snug text-cyan-800/90 dark:text-cyan-300/80">
              {statEntries.map(([k, v]) => (
                <div key={k} className={compact ? "line-clamp-1" : "line-clamp-2"}>{formatStat(k, v as number)}</div>
              ))}
            </div>
          ) : (
            <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {cleanModDescription(mod.description).substring(0, compact ? 60 : 80)}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
            R{rank}/{mod.maxRank}
          </span>
          <span
            className={cn(
              "whitespace-nowrap text-[11px] font-medium",
              polarityEffect === "match"
                ? "text-green-700 dark:text-green-400"
                : polarityEffect === "mismatch"
                  ? "text-red-700 dark:text-red-400"
                  : "text-muted-foreground",
            )}
          >
            ⚡{effectiveDrain}
          </span>
          {mod.subCategory === "riven" && onEditRiven && (
            <button onClick={(e) => { e.stopPropagation(); onEditRiven(); }} className="text-purple-700 transition-colors hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300" title="Edit Riven Stats">
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
        {onPolarize && (
          <FormaPolarizeButton
            inline
            active={showPolarityPicker}
            slotPolarity={slotPolarity}
            onClick={(e) => { e.stopPropagation(); setShowPolarityPicker(!showPolarityPicker); }}
          />
        )}
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
