"use client";

import {
  ENEMY_LEVEL_INPUT_MAX,
  ENEMY_LEVEL_MIN,
  ENEMY_LEVEL_SLIDER_MAX,
} from "@/lib/sim-limits";
import { cn } from "@/lib/utils";

/**
 * Enemy level control: convenience slider (1–200) + number input up to 9999.
 * Typed values above the slider max are preserved (number wins).
 */
export function EnemyLevelControl({
  value,
  onChange,
  className,
  label = "Level",
}: {
  value: number;
  onChange: (level: number) => void;
  className?: string;
  label?: string;
}) {
  const clamp = (v: number) =>
    Math.min(ENEMY_LEVEL_INPUT_MAX, Math.max(ENEMY_LEVEL_MIN, Math.round(v)));

  return (
    <div className={cn("w-full min-w-0 space-y-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <input
          type="number"
          min={ENEMY_LEVEL_MIN}
          max={ENEMY_LEVEL_INPUT_MAX}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onChange(clamp(v));
          }}
          className="w-14 shrink-0 text-[10px] font-mono text-right bg-background border border-border rounded px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <input
        type="range"
        min={ENEMY_LEVEL_MIN}
        max={ENEMY_LEVEL_SLIDER_MAX}
        value={Math.min(value, ENEMY_LEVEL_SLIDER_MAX)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full min-w-0 h-1 accent-primary cursor-pointer"
      />
      {value > ENEMY_LEVEL_SLIDER_MAX && (
        <p className="text-[9px] text-muted-foreground/80">
          Above slider range — using level {value}
        </p>
      )}
    </div>
  );
}
