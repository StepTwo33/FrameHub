"use client";

import { useMemo } from "react";
import { WeaponStatsPanel } from "@/components/stats-panel";
import { resolvePublicBuildWeaponPreview } from "@/lib/build-stats";
import { useWeapons } from "@/lib/use-data";

export function BuildPreviewStats({ type, data }: { type: string; data: unknown }) {
  const allWeapons = useWeapons();
  const preview = useMemo(
    () => resolvePublicBuildWeaponPreview(type, data, allWeapons),
    [type, data, allWeapons],
  );

  if (!preview) return null;

  return (
    <>
      <div className="w-full h-px bg-border my-8" />
      <section className="space-y-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {preview.label} — calculated stats
      </h2>
      <WeaponStatsPanel
        stats={preview.stats}
        baseStats={preview.baseStats}
        weapon={preview.weapon}
        isMelee={preview.isMelee}
      />
      </section>
    </>
  );
}
