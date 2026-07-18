"use client";

import { CalculatedStats, Weapon, SimulationParams } from "@/lib/types";
import { weaponSupportsPrimaryStyleSets, weaponAcceptsSynthReloadBonus } from "@/lib/calc/set-bonuses";
import { useMemo } from "react";
import { IncarnonEvolution } from "@/data/incarnon";
import { cleanModDescription, getModStatDisplayLines } from "@/lib/display/mod-display";
import { getModStatLabel } from "@/lib/overrides/override-stat-catalog";
import { getArcaneDisplayInfo } from "@/lib/display/arcane-display";
import {
  computeDpsContributions,
  formatMarginalPct,
  type DpsContributionCategory,
  type WeaponDpsCalcContext,
} from "@/lib/calc/dps-contributions";
import { avgCritMultiplier, critTierDamage } from "@/lib/calc/crit-utils";
import { CollapsibleSection, SimSlider, StatRow } from "./stat-primitives";
import { TTKSection } from "./ttk-section";
import { WeaponSimControls } from "./weapon-sim-controls";

const ELEMENT_COLORS: Record<string, string> = {
  heat: "text-orange-700 dark:text-orange-400",
  cold: "text-cyan-800 dark:text-cyan-300",
  toxin: "text-green-700 dark:text-green-400",
  electricity: "text-blue-800 dark:text-blue-300",
  blast: "text-yellow-700 dark:text-yellow-400",
  corrosive: "text-lime-700 dark:text-lime-400",
  gas: "text-emerald-800 dark:text-emerald-300",
  magnetic: "text-indigo-800 dark:text-indigo-300",
  radiation: "text-amber-800 dark:text-amber-300",
  viral: "text-teal-800 dark:text-teal-300",
  tau: "text-violet-800 dark:text-violet-300",
  impact: "text-slate-700 dark:text-slate-300",
  puncture: "text-stone-700 dark:text-stone-300",
  slash: "text-red-700 dark:text-red-300",
};

const RADIAL_DAMAGE_KEYS = [
  "impact", "puncture", "slash", "heat", "cold", "toxin", "electricity",
  "radiation", "viral", "corrosive", "blast", "gas", "magnetic", "tau",
] as const;

const ELEMENT_LABELS: Record<string, string> = {
  heat: "Heat", cold: "Cold", toxin: "Toxin", electricity: "Electricity",
  blast: "Blast", corrosive: "Corrosive", gas: "Gas", magnetic: "Magnetic",
  radiation: "Radiation", viral: "Viral", tau: "Tau",
};

const CONTRIBUTION_CATEGORY_COLORS: Record<DpsContributionCategory, string> = {
  damage: "text-orange-400",
  crit: "text-red-400",
  rate: "text-yellow-400",
  multishot: "text-blue-400",
  elemental: "text-teal-400",
  conditional: "text-purple-400",
  arcane: "text-amber-400",
  external: "text-cyan-400",
  set: "text-lime-400",
  other: "text-muted-foreground",
};

export function WeaponStatsPanel({ stats, baseStats, weapon, isMelee, selectedEvolutions, allEvolutions, simParams, onSimParamsChange, contributionContext }: {
  stats: CalculatedStats | null; baseStats?: CalculatedStats | null; weapon?: Weapon | null; isMelee?: boolean;
  selectedEvolutions?: Record<number, number>; allEvolutions?: IncarnonEvolution[];
  simParams?: SimulationParams; onSimParamsChange?: (p: SimulationParams) => void;
  contributionContext?: WeaponDpsCalcContext | null;
}) {
  const dpsContributions = useMemo(
    () => (contributionContext ? computeDpsContributions(contributionContext) : []),
    [contributionContext],
  );

  if (!stats) {
    return (
      <div className="border border-border rounded-xl p-4 bg-card">
        <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-3">STATS</h3>
        <p className="text-xs text-muted-foreground">Select a weapon to see stats</p>
      </div>
    );
  }

  const onKillBuffTotal = Object.values(stats.onKillStatBonuses ?? {}).reduce((s, v) => s + v, 0);
  const triggerBuffTotal = Object.values(stats.triggerStatBonuses ?? {}).reduce((s, v) => s + v, 0);
  const hasConditionals = stats.conditionOverloadBonus > 0 || stats.bloodRushStacks > 0
    || stats.galvanizedMultishotOnKill > 0 || stats.galvanizedDamagePerStatus > 0
    || (stats.galvanizedCritOnHeadshot ?? 0) > 0
    || onKillBuffTotal > 0 || triggerBuffTotal > 0
    || stats.berserkerFuryBonus > 0 || stats.weepingWoundsBonus > 0
    || (stats.firstShotDamageBonus ?? 0) > 0
    || (stats.slashOnImpactProcChance ?? 0) > 0
    || (stats.vigilanteCritBonus ?? 0) > 0;

  const showSustainedColumn = dpsContributions.some(
    (c) => Math.abs(c.sustainedMarginalPct - c.burstMarginalPct) > 0.5,
  );

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-1 min-w-0 overflow-x-hidden">
      <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-2">WEAPON STATS</h3>

      {weapon?.passive && (
        <CollapsibleSection title="PASSIVE" defaultOpen>
          <p className="text-[11px] text-muted-foreground leading-relaxed py-1">{weapon.passive}</p>
        </CollapsibleSection>
      )}

      {simParams && onSimParamsChange && (
        <WeaponSimControls
          stats={stats}
          simParams={simParams}
          onSimParamsChange={onSimParamsChange}
          weapon={weapon}
          isMelee={isMelee}
          hasConditionals={hasConditionals}
          onKillBuffTotal={onKillBuffTotal}
          triggerBuffTotal={triggerBuffTotal}
        />
      )}
      {stats.setBonusSummary && stats.setBonusSummary.length > 0 && (
        <CollapsibleSection title="SET BONUSES" defaultOpen={false}>
          <div className="space-y-1 py-1">
            {stats.setBonusSummary.map((row) => (
              <div key={row.setId} className="text-[10px] leading-snug">
                <span className={row.active ? "text-green-400 font-medium" : "text-muted-foreground"}>
                  {row.label}: {row.pieces}/{row.required}
                  {row.active ? " ✓" : ""}
                </span>
                <div className="text-[9px] text-muted-foreground/80 pl-0.5">{row.description}</div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Physical Damage — arsenal-style: unquantized, total × multishot like in-game */}
      {(() => {
        const dmg = stats.arsenalDamage ?? stats;
        const arsenalTotal = dmg.totalDamage * Math.max(1, stats.multishot);
        return (
          <CollapsibleSection title="DIRECT DAMAGE" defaultOpen>
            <StatRow label="Total Damage" value={arsenalTotal.toFixed(1)} highlighted />
            {stats.multishot > 1 && (
              <div className="text-[9px] text-muted-foreground/60 -mt-0.5 mb-0.5">
                {dmg.totalDamage.toFixed(1)} per pellet × {stats.multishot.toFixed(2)} multishot (projectile / hit)
              </div>
            )}
            {stats.multishot <= 1 && (
              <div className="text-[9px] text-muted-foreground/60 -mt-0.5 mb-0.5">
                Projectile / hit damage (excludes radial explosions)
              </div>
            )}
            {(dmg.impact > 0 || (baseStats && baseStats.impact > 0)) && (
              <StatRow label="Impact" value={dmg.impact.toFixed(1)} color="text-slate-400" />
            )}
            {(dmg.puncture > 0 || (baseStats && baseStats.puncture > 0)) && (
              <StatRow label="Puncture" value={dmg.puncture.toFixed(1)} color="text-stone-400" />
            )}
            {(dmg.slash > 0 || (baseStats && baseStats.slash > 0)) && (
              <StatRow label="Slash" value={dmg.slash.toFixed(1)} color="text-red-400" />
            )}

            {/* Elemental Damage */}
            {dmg.elements && dmg.elements.length > 0 && (
              <>
                <div className="border-t border-border/50 my-1" />
                {dmg.elements.map((e, i) => (
                  <StatRow
                    key={i}
                    label={ELEMENT_LABELS[e.type] || e.type}
                    value={e.value.toFixed(1)}
                    color={ELEMENT_COLORS[e.type]}
                  />
                ))}
              </>
            )}
          </CollapsibleSection>
        );
      })()}

      {/* Per-hit damage — no multishot, fire rate, or DPS averaging */}
      {(() => {
        const hitBase = (stats.arsenalDamage ?? stats).totalDamage;
        const cm = stats.criticalMultiplier;
        const cc = stats.criticalChance;
        const yellow = hitBase * critTierDamage(1, cm);
        const orange = hitBase * critTierDamage(2, cm);
        const red = hitBase * critTierDamage(3, cm);
        const avgHit = hitBase * avgCritMultiplier(cc, cm);
        return (
          <CollapsibleSection title="HIT DAMAGE" defaultOpen>
            <p className="text-[9px] text-muted-foreground/70 mb-1 leading-snug">
              Per pellet / swing — not DPS (no multishot or fire rate).
            </p>
            <StatRow
              label="Non-crit hit"
              value={hitBase.toFixed(1)}
              highlighted
              tooltip="Raw hit damage before crit averaging, multishot, and fire rate."
            />
            <StatRow
              label="Yellow crit"
              value={yellow.toFixed(1)}
              color="text-yellow-400"
              tooltip={`Non-crit × ${cm.toFixed(2)} crit multiplier`}
            />
            {cc >= 1 && (
              <StatRow
                label="Orange crit"
                value={orange.toFixed(1)}
                color="text-orange-400"
                tooltip="Tier-2 crit (crit chance ≥ 100%)"
              />
            )}
            {cc >= 2 && (
              <StatRow
                label="Red crit"
                value={red.toFixed(1)}
                color="text-red-400"
                tooltip="Tier-3 crit (crit chance ≥ 200%)"
              />
            )}
            <StatRow
              label="Avg hit"
              value={avgHit.toFixed(1)}
              tooltip="Non-crit hit × average crit multiplier (still without multishot / fire rate)."
            />
          </CollapsibleSection>
        );
      })()}

      {/* Core Stats — arsenal-like order before radial */}
      <CollapsibleSection title="CORE" defaultOpen>
        <StatRow
          label={isMelee ? "Attack Speed" : "Fire Rate"}
          value={(stats.effectiveFireRate ?? stats.fireRate).toFixed(2)}
          tooltip={
            isMelee
              ? "Melee attacks per second (same field as fire rate for guns in the build engine)."
              : stats.effectiveFireRate != null &&
                  Math.abs(stats.effectiveFireRate - stats.fireRate) > 0.01
                ? `Effective shots/sec (charge/bow/burst timing). Arsenal FR component: ${stats.fireRate.toFixed(2)}`
                : "Shots per second used for DPS."
          }
        />
        <StatRow label="Critical Chance" value={`${(stats.criticalChance * 100).toFixed(1)}%`} />
        <StatRow label="Critical Multiplier" value={`${stats.criticalMultiplier.toFixed(2)}x`} />
        <StatRow label="Status Chance" value={`${(stats.statusChancePerShot * 100).toFixed(1)}%`} />
        {!isMelee && <StatRow label="Multishot" value={stats.multishot.toFixed(2)} />}
        {stats.magazine > 0 && <StatRow label="Magazine" value={stats.magazine.toString()} />}
        {stats.reloadTime > 0 && <StatRow label="Reload Time" value={`${stats.reloadTime.toFixed(2)}s`} />}
        {(stats.sprintSpeedBonus ?? 0) !== 0 && (
          <StatRow
            label="Sprint Speed"
            value={`${(stats.sprintSpeedBonus ?? 0) > 0 ? "+" : ""}${((stats.sprintSpeedBonus ?? 0) * 100).toFixed(0)}%`}
            color="text-cyan-400"
            tooltip="Warframe sprint speed while this weapon is equipped (Amalgam Serration, etc.)."
          />
        )}
        {(stats.slideSpeedBonus ?? 0) !== 0 && (
          <StatRow
            label="Slide Speed"
            value={`${(stats.slideSpeedBonus ?? 0) > 0 ? "+" : ""}${((stats.slideSpeedBonus ?? 0) * 100).toFixed(0)}%`}
            color="text-cyan-400"
            tooltip="Warframe slide speed while this weapon is equipped."
          />
        )}
      </CollapsibleSection>

      {stats.radialAttacks && stats.radialAttacks.length > 0 && (
        <CollapsibleSection title="RADIAL ATTACK" defaultOpen>
          {stats.radialAttacks.map((attack, idx) => (
            <div key={`${attack.name}-${idx}`} className={idx > 0 ? "mt-2 pt-2 border-t border-border/50" : ""}>
              {stats.radialAttacks!.length > 1 && (
                <div className="text-[10px] font-medium text-muted-foreground mb-1">{attack.name}</div>
              )}
              <StatRow label="Total Damage" value={attack.totalDamage.toFixed(1)} highlighted />
              {RADIAL_DAMAGE_KEYS.map((key) => {
                const val = attack[key];
                if (val == null || val <= 0) return null;
                const label = ELEMENT_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <StatRow
                    key={key}
                    label={label}
                    value={val.toFixed(1)}
                    color={ELEMENT_COLORS[key]}
                  />
                );
              })}
              <StatRow label="Radius" value={`${attack.radius.toFixed(1)}m`} />
              {attack.explosionDelay != null && attack.explosionDelay > 0 && (
                <StatRow label="Delay" value={`${attack.explosionDelay.toFixed(1)}s`} />
              )}
              {attack.falloffReduction != null && attack.falloffReduction > 0 && (
                <StatRow
                  label="Falloff"
                  value={`${(attack.falloffReduction * 100).toFixed(0)}%`}
                  tooltip="Damage reduction at the edge of the blast radius (center = full damage)."
                />
              )}
              {"burstDps" in attack && typeof attack.burstDps === "number" && attack.burstDps > 0 && (
                <StatRow
                  label="Burst DPS"
                  value={attack.burstDps.toFixed(0)}
                  highlighted
                  tooltip="Estimated DPS from this radial when it procs at the inferred rate (innate explosions scale with fire rate and multishot)."
                />
              )}
              {"burstDps" in attack && typeof attack.burstDps === "number" && attack.burstDps === 0 && /slam/i.test(attack.name) && (
                <StatRow
                  label="Burst DPS"
                  value="Manual"
                  tooltip="Slam radials are player-triggered; not included in weapon burst/sustained DPS totals."
                />
              )}
              {"includedInDirect" in attack && attack.includedInDirect === true && (
                <StatRow
                  label="Burst DPS"
                  value="In weapon DPS"
                  tooltip="This explosion is already part of the weapon's listed damage, so it's counted in the main DPS instead of added again."
                />
              )}
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Melee-specific */}
      {isMelee && stats.heavyAttackDamage > 0 && (
        <CollapsibleSection title="MELEE" defaultOpen>
          {stats.comboCount !== simParams?.comboCount && (
            <StatRow
              label="Effective combo hits"
              value={String(stats.comboCount)}
              tooltip="Sim slider + innate weapon combo + Corrupt Charge initial combo (and arcane bonuses when equipped)."
            />
          )}
          <StatRow
            label="Combo mult (BR/WW)"
            value={`${stats.comboMultiplier.toFixed(1)}x`}
            tooltip="Combo counter multiplier used by Blood Rush, Weeping Wounds, and Gladiator (1× below first tier, then 2×…12×). Bonus = mod% × (CM−1), additive with other chance mods."
          />
          <StatRow
            label="Heavy attack mult"
            value={`${stats.heavyAttackComboMultiplier.toFixed(1)}x`}
            tooltip="Heavy Attack Multiplier (same track as combo mult: 2× at first tier, +1× per tier to 12× at 220+ hits on standard weapons)."
          />
          <StatRow label="Combo Duration" value={`${stats.comboDuration.toFixed(0)}s`} />
          <StatRow label="Heavy Attack" value={stats.heavyAttackDamage.toFixed(0)} highlighted />
          {stats.bloodRushStacks > 0 && (
            <StatRow
              label="Blood Rush"
              value={`+${(stats.bloodRushStacks * 100).toFixed(0)}% × (CM−1)`}
              color="text-red-400"
              tooltip="Multiplies modded crit chance by (1 + this × (melee scaling multiplier − 1))"
            />
          )}
          {stats.conditionOverloadBonus > 0 && (
            <StatRow
              label="Condition Overload"
              value={`+${(stats.conditionOverloadBonus * 100).toFixed(0)}%/status`}
              color="text-purple-400"
              tooltip="Damage bonus per unique status type on target"
            />
          )}
        </CollapsibleSection>
      )}

      {/* DPS — direct hit vs radial shown separately; totals include both when radial applies */}
      <CollapsibleSection title="DPS" defaultOpen>
        {(() => {
          const radialBurst = stats.radialBurstDps ?? 0;
          const radialSustained = stats.radialSustainedDps ?? 0;
          const directBurst = Math.max(0, stats.burstDps - radialBurst);
          const directSustained = Math.max(0, stats.sustainedDps - radialSustained);
          return (
            <>
              <StatRow
                label="Direct Burst DPS"
                value={directBurst.toFixed(0)}
                highlighted
                tooltip="Projectile / hit DPS only (no radial). dmg × multishot × fire rate × avg crit × (faction × headshot × stance when enabled)."
              />
              <StatRow
                label="Direct Sustained DPS"
                value={directSustained.toFixed(0)}
                highlighted
                tooltip="Direct burst × (mag time / mag+reload cycle). Melee uses burst (no reload)."
              />
              {radialBurst > 0 && (
                <>
                  <StatRow
                    label="Radial Burst DPS"
                    value={radialBurst.toFixed(0)}
                    color="text-orange-300"
                    tooltip="Innate explosion / AoE DPS (not slam radials)."
                  />
                  <StatRow
                    label="Radial Sustained DPS"
                    value={radialSustained.toFixed(0)}
                    color="text-orange-300"
                    tooltip="Radial DPS adjusted for magazine and reload cycle."
                  />
                  <div className="border-t border-border/50 my-1" />
                  <StatRow
                    label="Total Burst DPS"
                    value={stats.burstDps.toFixed(0)}
                    tooltip="Direct + radial burst DPS combined."
                  />
                  <StatRow
                    label="Total Sustained DPS"
                    value={stats.sustainedDps.toFixed(0)}
                    tooltip="Direct + radial sustained DPS combined."
                  />
                </>
              )}
            </>
          );
        })()}
        {stats.statusProcs && stats.statusProcs.length > 0 && (() => {
          const efr = stats.effectiveFireRate ?? stats.fireRate;
          const procsPerSec = stats.statusProcs.reduce(
            (sum, p) => sum + efr * stats.multishot * p.chance,
            0,
          );
          const dotProcs = stats.statusProcs.filter(p => p.totalDamage > 0);
          const statusDps = dotProcs.reduce((sum, p) => {
            const pps = efr * stats.multishot * p.chance;
            return sum + pps * p.totalDamage / p.duration;
          }, 0);
          return (
            <>
              <div className="border-t border-border/50 my-1" />
              <StatRow label="Procs / Sec" value={procsPerSec.toFixed(1)} color="text-teal-400" />
              {statusDps > 0 && (
                <StatRow label="Status DPS" value={statusDps.toFixed(0)} color="text-teal-400"
                  tooltip="Estimated DPS from DoT status effects (Slash, Heat, Toxin, Gas)" />
              )}
            </>
          );
        })()}
      </CollapsibleSection>

      {dpsContributions.length > 0 && (
        <CollapsibleSection title="DPS CONTRIBUTIONS" defaultOpen={false}>
          <p className="text-[9px] text-muted-foreground/70 pb-1.5 leading-relaxed">
            Effective DPS gain from each source with everything else equipped. Additive stats show diminishing returns when stacked.
          </p>
          <div className="space-y-0.5">
            {dpsContributions.map((row) => {
              const color = CONTRIBUTION_CATEGORY_COLORS[row.category];
              const tooltip = [
                row.nominal ? `Nominal: ${row.nominal}` : null,
                row.tooltip,
                `Burst: ${formatMarginalPct(row.burstMarginalPct)} DPS`,
                showSustainedColumn ? `Sustained: ${formatMarginalPct(row.sustainedMarginalPct)} DPS` : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <div key={row.id} className="flex items-start justify-between gap-2 py-0.5" title={tooltip}>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs truncate ${color}`}>{row.label}</div>
                    {row.nominal && (
                      <div className="text-[9px] text-muted-foreground/60 truncate">{row.nominal}</div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-mono text-blue-400">{formatMarginalPct(row.burstMarginalPct)}</div>
                    {showSustainedColumn && (
                      <div className="text-[9px] font-mono text-muted-foreground">
                        sus {formatMarginalPct(row.sustainedMarginalPct)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Status Procs */}
      {stats.statusProcs && stats.statusProcs.length > 0 && (
        <CollapsibleSection title="STATUS EFFECTS" defaultOpen={false}>
          {stats.statusProcs.map((proc, i) => (
            <div key={i} className="py-0.5">
              <div className="flex justify-between items-center">
                <span className={`text-xs ${ELEMENT_COLORS[proc.type] || "text-muted-foreground"}`}>
                  {proc.type.charAt(0).toUpperCase() + proc.type.slice(1)}
                </span>
                <span className="text-xs font-mono">
                  {(proc.chance * 100).toFixed(1)}%
                </span>
              </div>
              {proc.totalDamage > 0 && (
                <div className="text-[10px] text-muted-foreground ml-2">
                  {proc.damagePerTick.toFixed(0)}/tick × {proc.ticks} = {proc.totalDamage.toFixed(0)} over {proc.duration}s
                </div>
              )}
              <div className="text-[10px] text-muted-foreground/60 ml-2">{proc.description}</div>
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Incarnon Evolutions Summary */}
      {selectedEvolutions && allEvolutions && Object.keys(selectedEvolutions).length > 0 && (
        <CollapsibleSection title="INCARNON EVOLUTIONS" defaultOpen>
          {Object.entries(selectedEvolutions).map(([tierStr, slot]) => {
            const tier = Number(tierStr);
            const evo = allEvolutions.find((e) => e.tier === tier && e.slot === slot);
            if (!evo) return null;
            const hasStats = Object.keys(evo.statChanges).length > 0;
            return (
              <div key={tier} className="py-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-orange-400 font-medium">T{tier}: {evo.name}</span>
                  {hasStats && (
                    <span className="text-[9px] font-mono text-orange-300/80">
                      {Object.entries(evo.statChanges).map(([s, v]) => {
                        const n = v as number;
                        if (s === "flatBaseDamage") return `baseDamage: +${n}`;
                        if (s === "criticalMultiplier") return `critMult: ${n > 0 ? "+" : ""}${n}x`;
                        if (s === "devouringAttrition") return `nonCritDmg: +${(n * 100).toFixed(0)}% (50%)`;
                        return `${s}: ${n > 0 ? "+" : ""}${(n * 100).toFixed(0)}%`;
                      }).join(", ")}
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-muted-foreground/70">{evo.description}</div>
              </div>
            );
          })}
        </CollapsibleSection>
      )}

      {/* TTK */}
      <TTKSection stats={stats} />
    </div>
  );
}


