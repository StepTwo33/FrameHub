"use client";

import { cn } from "@/lib/utils";
import { getShardColorName, SHARD_COLORS } from "@/lib/shard-display";
import type { EquippedArchonShard } from "@/lib/types";
import { Plus } from "lucide-react";

const SHARD_BORDER: Record<string, string> = {
  crimson: "border-red-500/45 hover:border-red-400/70",
  azure: "border-sky-500/45 hover:border-sky-400/70",
  amber: "border-amber-500/45 hover:border-amber-400/70",
  violet: "border-violet-500/45 hover:border-violet-400/70",
  topaz: "border-orange-500/45 hover:border-orange-400/70",
  emerald: "border-emerald-500/45 hover:border-emerald-400/70",
};

function ShardCrystal({ color, slotIndex }: { color: string; slotIndex: number }) {
  const hex = SHARD_COLORS[color] ?? "#888";
  const gradId = `shard-${color}-${slotIndex}`;
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hex} stopOpacity="0.95" />
          <stop offset="100%" stopColor={hex} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 L27 11 L22 29 L10 29 L5 11 Z"
        fill={`url(#${gradId})`}
        stroke={hex}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M16 3 L22 29 L10 29 Z"
        fill={hex}
        fillOpacity="0.18"
      />
      <path
        d="M16 3 L27 11 L16 14 L5 11 Z"
        fill="#fff"
        fillOpacity="0.22"
      />
    </svg>
  );
}

type ArchonShardSlotProps = {
  shard: EquippedArchonShard | null;
  slotIndex: number;
  onEquip: () => void;
  onRemove: () => void;
};

export function ArchonShardSlot({ shard, slotIndex, onEquip, onRemove }: ArchonShardSlotProps) {
  if (!shard) {
    return (
      <button
        type="button"
        onClick={onEquip}
        className="flex h-[4.5rem] w-[3.75rem] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/80 bg-card/30 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        title={`Empty shard slot ${slotIndex + 1}`}
      >
        <Plus className="h-4 w-4" />
        <span className="text-[9px] font-medium text-muted-foreground/80">{slotIndex + 1}</span>
      </button>
    );
  }

  const colorName = getShardColorName(shard.shardColor);
  const border = SHARD_BORDER[shard.shardColor] ?? "border-border/60";
  const isTau = shard.shardTier === 2;

  return (
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        "flex h-[4.5rem] w-[3.75rem] flex-col items-center justify-between rounded-lg border bg-card/50 px-1 py-1.5 transition-all hover:bg-card",
        border,
      )}
      title={`${colorName}${isTau ? " (Tauforged)" : ""} — click to remove`}
    >
      <ShardCrystal color={shard.shardColor} slotIndex={slotIndex} />
      <div className="flex w-full flex-col items-center gap-0.5">
        <span className="max-w-full truncate text-[10px] font-semibold capitalize leading-none text-foreground">
          {colorName}
        </span>
        {isTau && (
          <span className="rounded bg-amber-500/15 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-amber-400 ring-1 ring-amber-500/25">
            Tau
          </span>
        )}
      </div>
    </button>
  );
}
