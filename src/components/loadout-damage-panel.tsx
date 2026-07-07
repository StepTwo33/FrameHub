"use client";

import { useMemo, useState } from "react";
import {
  calcLoadoutStats,
  bestSustainedDps,
  fmtDamageNum,
  scenarioSimParams,
  ENEMY_TYPES,
  type DamageScenario,
} from "@/lib/loadout-stats";
import type { Loadout } from "@/lib/types";
import type { LoadoutStatsResult, LoadoutWeaponSlotStats } from "@/lib/loadout-stats";
import { useWeapons } from "@/lib/use-data";
import { ChevronDown, ChevronRight, Crosshair, Dog, Shield, Swords, Sparkles, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const SCENARIO_LABELS: Record<DamageScenario, string> = {
  paper: "Paper",
  midFight: "Mid-fight",
  fullRamp: "Full ramp",
  vsEnemy: "vs Enemy",
};

function WeaponRow({
  label,
  icon,
  color,
  entry,
  showTtk,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  entry: LoadoutWeaponSlotStats | null;
  showTtk: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!entry) return null;
  const { stats, ttk, isMelee } = entry;
  const burst = ttk?.burstDps ?? stats.burstDps;
  const sustained = ttk?.sustainedDps ?? stats.sustainedDps;

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden bg-card/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <span className={color}>{icon}</span>
        <span className="text-xs font-medium truncate flex-1">{label}</span>
        <span className="text-[10px] text-muted-foreground truncate max-w-[40%] hidden sm:inline">{entry.name}</span>
        <span className="text-xs font-mono text-amber-400 tabular-nums shrink-0">{fmtDamageNum(sustained)}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0 space-y-1 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground pt-2 truncate">{entry.name}</p>
          <StatLine label="Burst DPS" value={fmtDamageNum(burst)} highlight />
          <StatLine label="Sustained DPS" value={fmtDamageNum(sustained)} highlight />
          {showTtk && ttk && (
            <>
              <StatLine label="TTK" value={ttk.ttk === Infinity ? "∞" : `${ttk.ttk.toFixed(2)}s`} />
              <StatLine label="Shots to kill" value={ttk.shotsToKill === Infinity ? "∞" : String(ttk.shotsToKill)} />
            </>
          )}
          <StatLine label="Total damage" value={stats.totalDamage.toFixed(1)} />
          <StatLine label="Crit" value={`${(stats.criticalChance * 100).toFixed(1)}% / ${stats.criticalMultiplier.toFixed(1)}x`} />
          <StatLine label="Status" value={`${(stats.statusChance * 100).toFixed(1)}%`} />
          {isMelee && stats.heavyAttackDamage > 0 && (
            <StatLine label="Heavy attack" value={fmtDamageNum(stats.heavyAttackDamage)} />
          )}
          {!isMelee && (
            <StatLine label="Fire rate" value={stats.fireRate.toFixed(2)} />
          )}
        </div>
      )}
    </div>
  );
}

function StatLine({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn("text-[10px] font-mono tabular-nums", highlight && "text-amber-800 font-medium dark:text-amber-300")}>{value}</span>
    </div>
  );
}

export function LoadoutDamagePanel({ loadout }: { loadout: Loadout }) {
  const allWeapons = useWeapons();
  const [scenario, setScenario] = useState<DamageScenario>("midFight");
  const [enemyId, setEnemyId] = useState<string>("heavy_gunner");
  const [enemyLevel, setEnemyLevel] = useState(100);

  const enemy = useMemo(
    () => ENEMY_TYPES.find((e) => e.id === enemyId) ?? ENEMY_TYPES[0],
    [enemyId],
  );

  const stats = useMemo((): LoadoutStatsResult => {
    const simParams = scenarioSimParams(scenario);
    return calcLoadoutStats(loadout, {
      simParams,
      allWeapons,
      enemy: scenario === "vsEnemy" ? enemy : null,
      enemyLevel: scenario === "vsEnemy" ? enemyLevel : undefined,
    });
  }, [loadout, scenario, enemy, enemyLevel, allWeapons]);

  const best = useMemo(() => bestSustainedDps(stats), [stats]);
  const showTtk = scenario === "vsEnemy";

  const hasAnyWeapon = stats.primary || stats.secondary || stats.melee || stats.exalted;

  if (!stats.warframe && !hasAnyWeapon && !stats.companion) {
    return null;
  }

  return (
    <div className="mt-4 border border-amber-500/20 rounded-xl bg-amber-500/[0.04] overflow-hidden">
      <div className="px-4 py-3 border-b border-amber-500/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold">Damage estimate</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(SCENARIO_LABELS) as DamageScenario[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScenario(key)}
              className={cn(
                "px-2.5 py-1 text-[10px] rounded-md border transition-colors",
                scenario === key
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {SCENARIO_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {scenario === "vsEnemy" && (
        <div className="px-4 py-2 border-b border-border/40 flex flex-wrap gap-2 items-end bg-card/30">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] text-muted-foreground block mb-0.5">Enemy</label>
            <select
              value={enemyId}
              onChange={(e) => setEnemyId(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs"
            >
              {ENEMY_TYPES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.faction} — {e.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-20">
            <label className="text-[10px] text-muted-foreground block mb-0.5">Level</label>
            <input
              type="number"
              min={1}
              max={9999}
              value={enemyLevel}
              onChange={(e) => setEnemyLevel(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {best && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/30 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-amber-400/80" />
          Best sustained: <span className="text-foreground font-medium">{best.slot}</span> ({best.name}) —{" "}
          <span className="font-mono text-amber-800 dark:text-amber-300">{fmtDamageNum(best.sustainedDps)}</span>
          {showTtk && scenario === "vsEnemy" && (
            <span className="text-[10px] ml-1">vs {enemy.name} L{enemyLevel}</span>
          )}
        </div>
      )}

      <div className="p-3 space-y-2">
        {stats.warframe && (
          <div className="border border-purple-500/25 rounded-lg px-3 py-2 bg-purple-500/[0.06]">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium">{stats.warframe.name}</span>
            </div>
            {stats.warframe.forms ? (
              <div className="space-y-2">
                {stats.warframe.forms.map((form) => (
                  <div key={form.id} className="rounded-md border border-purple-500/15 bg-background/30 px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-purple-800/90 mb-1 dark:text-purple-300/90">{form.label}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1">
                      <MiniStat label="EHP" value={fmtDamageNum(form.stats.effectiveHealth)} />
                      <MiniStat label="Strength" value={`${(form.stats.abilityStrength * 100).toFixed(0)}%`} />
                      <MiniStat label="Duration" value={`${(form.stats.abilityDuration * 100).toFixed(0)}%`} />
                      <MiniStat label="Efficiency" value={`${(form.stats.abilityEfficiency * 100).toFixed(0)}%`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1">
                <MiniStat label="EHP" value={fmtDamageNum(stats.warframe.stats.effectiveHealth)} />
                <MiniStat label="Strength" value={`${(stats.warframe.stats.abilityStrength * 100).toFixed(0)}%`} />
                <MiniStat label="Duration" value={`${(stats.warframe.stats.abilityDuration * 100).toFixed(0)}%`} />
                <MiniStat label="Efficiency" value={`${(stats.warframe.stats.abilityEfficiency * 100).toFixed(0)}%`} />
              </div>
            )}
          </div>
        )}

        <WeaponRow label="Primary" icon={<Crosshair className="h-3.5 w-3.5" />} color="text-blue-400" entry={stats.primary} showTtk={showTtk} />
        <WeaponRow label="Secondary" icon={<Crosshair className="h-3.5 w-3.5" />} color="text-cyan-400" entry={stats.secondary} showTtk={showTtk} />
        <WeaponRow label="Melee" icon={<Swords className="h-3.5 w-3.5" />} color="text-orange-400" entry={stats.melee} showTtk={showTtk} />
        <WeaponRow label="Exalted" icon={<Sparkles className="h-3.5 w-3.5" />} color="text-violet-400" entry={stats.exalted} showTtk={showTtk} />

        {stats.companion && (
          <div className="border border-green-500/25 rounded-lg overflow-hidden bg-green-500/[0.04]">
            <div className="px-3 py-2 flex items-center gap-2">
              <Dog className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-medium">{stats.companion.name}</span>
            </div>
            <div className="px-3 pb-2 grid grid-cols-3 gap-2">
              <MiniStat label="HP" value={fmtDamageNum(stats.companion.bodyStats.totalHealth)} />
              <MiniStat label="Shield" value={fmtDamageNum(stats.companion.bodyStats.totalShield)} />
              <MiniStat label="EHP" value={fmtDamageNum(stats.companion.bodyStats.effectiveHealth)} />
            </div>
            {stats.companion.weapon && (
              <div className="border-t border-border/40 px-3 py-2 space-y-1">
                <p className="text-[10px] text-muted-foreground">
                  Weapon: <span className="text-foreground">{stats.companion.weapon.name}</span>
                </p>
                <StatLine
                  label="Sustained DPS"
                  value={fmtDamageNum(
                    stats.companion.weapon.ttk?.sustainedDps ?? stats.companion.weapon.stats.sustainedDps,
                  )}
                  highlight
                />
                {showTtk && stats.companion.weapon.ttk && (
                  <StatLine
                    label="TTK"
                    value={
                      stats.companion.weapon.ttk.ttk === Infinity
                        ? "∞"
                        : `${stats.companion.weapon.ttk.ttk.toFixed(2)}s`
                    }
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="px-4 pb-3 text-[10px] text-muted-foreground/70 leading-relaxed">
        Estimates use modded stats with scenario assumptions ({SCENARIO_LABELS[scenario].toLowerCase()}).
        {scenario !== "vsEnemy" && " Switch to vs Enemy for TTK against a specific target."}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs font-mono tabular-nums">{value}</div>
    </div>
  );
}
