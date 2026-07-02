"use client";

import { cn } from "@/lib/utils";
import { GameAssetImage } from "@/components/game-asset-image";
import { getArchonShardImage, getShardShortLabel } from "@/lib/shard-display";
import type { EquippedArchonShard } from "@/lib/types";
import { Plus } from "lucide-react";

const SHARD_GLOW: Record<string, string> = {
  crimson: "#E74C3C",
  azure: "#3498DB",
  amber: "#F39C12",
  violet: "#9B59B6",
  topaz: "#E67E22",
  emerald: "#2ECC71",
};

const SHARD_BORDER: Record<string, string> = {
  crimson: "border-red-500/50 hover:border-red-400/70",
  azure: "border-sky-500/50 hover:border-sky-400/70",
  amber: "border-amber-500/50 hover:border-amber-400/70",
  violet: "border-violet-500/50 hover:border-violet-400/70",
  topaz: "border-orange-500/50 hover:border-orange-400/70",
  emerald: "border-emerald-500/50 hover:border-emerald-400/70",
};

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
        className="flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-border/80 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        title={`Shard slot ${slotIndex + 1}`}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="text-[8px] font-medium">{slotIndex + 1}</span>
      </button>
    );
  }

  const label = getShardShortLabel(shard.shardColor, shard.shardTier);
  const border = SHARD_BORDER[shard.shardColor] ?? "border-border/60";

  return (
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        "group flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-lg border bg-card/60 p-1 transition-all hover:bg-card",
        border,
      )}
      title={`${label} — click to remove`}
    >
      <div
        className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/40"
        style={{ boxShadow: `inset 0 0 8px ${SHARD_GLOW[shard.shardColor] ?? "#888"}33` }}
      >
        <GameAssetImage
          src={getArchonShardImage(shard.shardColor, shard.shardTier)}
          alt={label}
          width={28}
          height={28}
          className="h-7 w-7 object-contain drop-shadow-sm"
          hideOnError
        />
      </div>
      <span className="max-w-full truncate text-[8px] font-semibold leading-none text-foreground/90">
        {label}
      </span>
    </button>
  );
}
