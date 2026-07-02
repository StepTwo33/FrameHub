"use client";

import { CalculatedStats, WarframeCalculatedStats, Warframe, Weapon, Ability, Mod, EquippedMod, SimulationParams, EquippedArchonShard } from "@/lib/types";
import { weaponSupportsPrimaryStyleSets, weaponAcceptsSynthReloadBonus } from "@/lib/set-bonuses";
import { HelminthAbility } from "@/data/helminth";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ENEMY_TYPES, calculateTTK } from "@/lib/ttk";
import { IncarnonEvolution } from "@/data/incarnon";
import { formatAbilityDescription } from "@/lib/ability-text";
import { buildShardBonusLines } from "@/lib/shard-display";
import { getArcaneDisplayInfo } from "@/lib/arcane-display";
import {
  ADAPTATION_MAX_STACKS,
  computeAdaptationSurvivability,
} from "@/lib/calculator";
import { getDualFormAbilities, getDualFormConfig } from "@/lib/dual-form-warframes";
import {
  scaleAbilityMiscStats,
  scaledAbilityEnergyCost,
  scaledAbilityDamageReduction,
  scaledAbilityDamageBuff,
} from "@/lib/ability-misc-stats";

const ELEMENT_COLORS: Record<string, string> = {
  heat: "text-orange-400",
  cold: "text-cyan-300",
  toxin: "text-green-400",
  electricity: "text-blue-300",
  blast: "text-yellow-400",
  corrosive: "text-lime-400",
  gas: "text-emerald-300",
  magnetic: "text-indigo-300",
  radiation: "text-amber-300",
  viral: "text-teal-300",
  impact: "text-slate-300",
  puncture: "text-stone-300",
  slash: "text-red-300",
};

const ELEMENT_LABELS: Record<string, string> = {
  heat: "Heat", cold: "Cold", toxin: "Toxin", electricity: "Electricity",
  blast: "Blast", corrosive: "Corrosive", gas: "Gas", magnetic: "Magnetic",
  radiation: "Radiation", viral: "Viral",
};

function StatRow({ label, value, highlighted, color, tooltip }: {
  label: string; value: string; highlighted?: boolean; color?: string; tooltip?: string;
}) {
  return (
    <div className="flex justify-between items-center py-0.5 group" title={tooltip}>
      <span className={`text-xs ${color || "text-muted-foreground"}`}>{label}</span>
      <span className={highlighted ? "text-xs font-bold text-blue-400" : `text-xs font-mono ${color || ""}`}>
        {value}
      </span>
    </div>
  );
}

function CollapsibleSection({ title, defaultOpen, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full text-left py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3 inline-block" /> : <ChevronRight className="h-3 w-3 inline-block" />}
        {title}
      </button>
      {open && <div className="ml-1">{children}</div>}
    </div>
  );
}

function SimSlider({ label, value, min, max, onChange, suffix, tooltip }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; suffix?: string; tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-2" title={tooltip}>
      <span className="text-[10px] text-muted-foreground w-24 shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} value={Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 accent-primary cursor-pointer"
      />
      <input
        type="number" min={min} value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v) && v >= min) onChange(v);
        }}
        className="w-10 text-[10px] font-mono text-right bg-background border border-border rounded px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <span className="text-[10px] text-muted-foreground">{suffix}</span>}
    </div>
  );
}

export function WeaponStatsPanel({ stats, baseStats, weapon, isMelee, selectedEvolutions, allEvolutions, simParams, onSimParamsChange }: {
  stats: CalculatedStats | null; baseStats?: CalculatedStats | null; weapon?: Weapon | null; isMelee?: boolean;
  selectedEvolutions?: Record<number, number>; allEvolutions?: IncarnonEvolution[];
  simParams?: SimulationParams; onSimParamsChange?: (p: SimulationParams) => void;
}) {
  if (!stats) {
    return (
      <div className="border border-border rounded-xl p-4 bg-card">
        <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-3">STATS</h3>
        <p className="text-xs text-muted-foreground">Select a weapon to see stats</p>
      </div>
    );
  }

  const hasConditionals = stats.conditionOverloadBonus > 0 || stats.bloodRushStacks > 0
    || stats.galvanizedMultishotOnKill > 0 || stats.galvanizedDamagePerStatus > 0
    || stats.berserkerFuryBonus > 0 || stats.weepingWoundsBonus > 0;

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-1">
      <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-2">WEAPON STATS</h3>

      {weapon?.passive && (
        <CollapsibleSection title="PASSIVE" defaultOpen>
          <p className="text-[11px] text-muted-foreground leading-relaxed py-1">{weapon.passive}</p>
        </CollapsibleSection>
      )}

      {/* Simulation Controls */}
      {simParams && onSimParamsChange && (
        <CollapsibleSection title="SIMULATION" defaultOpen={hasConditionals}>
          <div className="space-y-1.5 py-1">
            {isMelee && (
              <SimSlider
                label="Combo Hits" value={simParams.comboCount} min={0} max={260}
                onChange={(v) => onSimParamsChange({ ...simParams, comboCount: v })}
                tooltip="Consecutive melee combo counter. BR/WW use scaling tiers starting at 20 hits (1.25x, then +0.25x per 20 hits to 3.75x at 220+). Heavy attacks use a separate 2x–12x tier table."
              />
            )}
            <SimSlider
              label="Kill Stacks" value={simParams.killStacks} min={0} max={5}
              onChange={(v) => onSimParamsChange({ ...simParams, killStacks: v })}
              tooltip="On-kill stacks — Galvanized mods (max 5), Berserker Fury (max 2)"
            />
            <SimSlider
              label="Status Types" value={simParams.statusTypesOnTarget} min={0} max={5}
              onChange={(v) => onSimParamsChange({ ...simParams, statusTypesOnTarget: v })}
              tooltip="Unique status types on target — Condition Overload, Galvanized Aptitude/Savvy/Shot"
            />
            <SimSlider
              label="Arcane Stacks" value={simParams.arcaneStacks} min={0} max={12}
              onChange={(v) => onSimParamsChange({ ...simParams, arcaneStacks: v })}
              tooltip="Stack count for arcanes like Primary/Secondary/Melee Merciless (max 12)"
            />
            {isMelee && (
              <SimSlider
                label="WF Gladiator" value={simParams.extraGladiatorMods} min={0} max={3}
                onChange={(v) => onSimParamsChange({ ...simParams, extraGladiatorMods: v })}
                tooltip="Gladiator mods on warframe (Aegis/Finesse/Resolve) — +10% crit per melee scaling multiplier tier each (same (CM−1) factor as Blood Rush)"
              />
            )}
            {!isMelee && weapon && weaponSupportsPrimaryStyleSets(weapon) && (
              <>
                <SimSlider
                  label="WF Vigilante (count)"
                  value={simParams.extraVigilanteModsFromWarframe ?? 0}
                  min={0}
                  max={6}
                  onChange={(v) => onSimParamsChange({ ...simParams, extraVigilanteModsFromWarframe: v })}
                  tooltip="Vigilante mods equipped on your Warframe (e.g. Pursuit on Exilus). Each counts toward primary crit-tier upgrade when not using full loadout linkage."
                />
                <SimSlider
                  label="Off-weapon Tek pieces"
                  value={simParams.extraTekSetPiecesOffWeapon ?? 0}
                  min={0}
                  max={3}
                  onChange={(v) => onSimParamsChange({ ...simParams, extraTekSetPiecesOffWeapon: v })}
                  tooltip="Tek mods on other slots (Collateral on frame, Gravity on melee, Enhance on Kavat). In-game set needs 4; data may show 3/4 until Tek Enhance exists."
                />
                <SimSlider
                  label="Tek vs marked (DPS)"
                  value={simParams.applyTekSetVsMarkedDamage ? 1 : 0}
                  min={0}
                  max={1}
                  onChange={(v) => onSimParamsChange({ ...simParams, applyTekSetVsMarkedDamage: v >= 1 })}
                  tooltip="When Tek 4-set is complete, apply +60% damage vs Kavat-marked enemies to this primary's paper DPS."
                />
              </>
            )}
            {weapon && weaponAcceptsSynthReloadBonus(weapon) && (
              <SimSlider
                label="Off-weapon Synth pieces"
                value={simParams.extraSynthSetPiecesOffWeapon ?? 0}
                min={0}
                max={3}
                onChange={(v) => onSimParamsChange({ ...simParams, extraSynthSetPiecesOffWeapon: v })}
                tooltip="Synth Fiber + Deconstruct on companion and Synth Reflex on Warframe (max 3 off this pistol). At 4 total with Synth Charge here, +15% reload speed applies."
              />
            )}
          </div>
          {/* Active conditional summary */}
          {hasConditionals && (
            <div className="border-t border-border/50 pt-1 mt-1 space-y-0.5">
              <div className="text-[9px] text-muted-foreground/60 mb-0.5">Active conditional effects:</div>
              {stats.bloodRushStacks > 0 && (
                <div className="text-[10px] text-red-400">Blood Rush: ×{(1 + stats.bloodRushStacks * Math.max(0, stats.comboMultiplier - 1)).toFixed(2)} crit (coef × (CM−1) = {(stats.bloodRushStacks * Math.max(0, stats.comboMultiplier - 1) * 100).toFixed(0)}%)</div>
              )}
              {stats.weepingWoundsBonus > 0 && (
                <div className="text-[10px] text-teal-400">Weeping Wounds: ×{(1 + stats.weepingWoundsBonus * Math.max(0, stats.comboMultiplier - 1)).toFixed(2)} status (coef × (CM−1) = {(stats.weepingWoundsBonus * Math.max(0, stats.comboMultiplier - 1) * 100).toFixed(0)}%)</div>
              )}
              {stats.conditionOverloadBonus > 0 && (
                <div className="text-[10px] text-purple-400">Condition Overload: +{(stats.conditionOverloadBonus * stats.simParams.statusTypesOnTarget * 100).toFixed(0)}% DMG ({stats.simParams.statusTypesOnTarget} types)</div>
              )}
              {stats.galvanizedMultishotOnKill > 0 && (
                <div className="text-[10px] text-blue-400">Galv. Multishot: +{(stats.galvanizedMultishotOnKill * stats.simParams.killStacks * 100).toFixed(0)}% MS ({stats.simParams.killStacks} stacks)</div>
              )}
              {stats.galvanizedDamagePerStatus > 0 && (
                <div className="text-[10px] text-blue-400">Galv. Condition: +{(stats.galvanizedDamagePerStatus * stats.simParams.killStacks * stats.simParams.statusTypesOnTarget * 100).toFixed(0)}% DMG ({stats.simParams.killStacks}×{stats.simParams.statusTypesOnTarget})</div>
              )}
              {stats.berserkerFuryBonus > 0 && (
                <div className="text-[10px] text-yellow-400">Berserker Fury: +{(stats.berserkerFuryBonus * Math.min(stats.simParams.killStacks, 2) * 100).toFixed(0)}% AS ({Math.min(stats.simParams.killStacks, 2)}/2 stacks)</div>
              )}
              {stats.vigilanteCritBonus && stats.vigilanteCritBonus > 0 && (
                <div className="text-[10px] text-orange-400" title="Primary rifles/shotguns/bows/archguns only — does not apply to secondaries or melee">
                  Vigilante Set: {(stats.vigilanteCritBonus * 100).toFixed(0)}% crit tier enhance chance
                </div>
              )}
              {stats.synthSetReloadBonusApplied != null && stats.synthSetReloadBonusApplied > 0 && (
                <div className="text-[10px] text-cyan-400">
                  Synth 4-set: +{(stats.synthSetReloadBonusApplied * 100).toFixed(0)}% reload speed
                </div>
              )}
              {stats.tekSetVsMarkedDamageMultiplier != null && stats.tekSetVsMarkedDamageMultiplier > 1 && (
                <div className="text-[10px] text-fuchsia-400">
                  Tek 4-set vs marked: ×{stats.tekSetVsMarkedDamageMultiplier.toFixed(2)} damage (optional)
                </div>
              )}
            </div>
          )}
        </CollapsibleSection>
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

      {/* Physical Damage */}
      <CollapsibleSection title="DAMAGE" defaultOpen>
        <StatRow label="Total Damage" value={stats.totalDamage.toFixed(1)} highlighted />
        {(stats.impact > 0 || (baseStats && baseStats.impact > 0)) && (
          <StatRow label="Impact" value={stats.impact.toFixed(1)} color="text-slate-400" />
        )}
        {(stats.puncture > 0 || (baseStats && baseStats.puncture > 0)) && (
          <StatRow label="Puncture" value={stats.puncture.toFixed(1)} color="text-stone-400" />
        )}
        {(stats.slash > 0 || (baseStats && baseStats.slash > 0)) && (
          <StatRow label="Slash" value={stats.slash.toFixed(1)} color="text-red-400" />
        )}

        {/* Elemental Damage */}
        {stats.elements && stats.elements.length > 0 && (
          <>
            <div className="border-t border-border/50 my-1" />
            {stats.elements.map((e, i) => (
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

      {/* Core Stats */}
      <CollapsibleSection title="CORE" defaultOpen>
        <StatRow label="Critical Chance" value={`${(stats.criticalChance * 100).toFixed(1)}%`} />
        <StatRow label="Critical Multiplier" value={`${stats.criticalMultiplier.toFixed(2)}x`} />
        <StatRow label="Status Chance" value={`${(stats.statusChancePerShot * 100).toFixed(1)}%`} />
        <StatRow
          label={isMelee ? "Attack Speed" : "Fire Rate"}
          value={stats.fireRate.toFixed(2)}
          tooltip={
            isMelee
              ? "Melee attacks per second (same field as fire rate for guns in the build engine)."
              : undefined
          }
        />
        {!isMelee && <StatRow label="Multishot" value={stats.multishot.toFixed(2)} />}
        {stats.magazine > 0 && <StatRow label="Magazine" value={stats.magazine.toString()} />}
        {stats.reloadTime > 0 && <StatRow label="Reload Time" value={`${stats.reloadTime.toFixed(2)}s`} />}
      </CollapsibleSection>

      {/* Melee-specific */}
      {isMelee && stats.heavyAttackDamage > 0 && (
        <CollapsibleSection title="MELEE" defaultOpen>
          <StatRow
            label="Combo scaling (BR/WW)"
            value={`${stats.comboMultiplier.toFixed(2)}x`}
            tooltip="Melee Damage Multiplier tier from combo counter (1.0 below 20 hits, then 1.25x at 20, +0.25x per 20 hits). Blood Rush & Weeping use (CM−1) in their formulas."
          />
          <StatRow
            label="Heavy attack mult"
            value={`${stats.heavyAttackComboMultiplier.toFixed(1)}x`}
            tooltip="Separate heavy-attack combo tier (2x from 20 hits, +1x per 20 to 12x). Heavy damage shown uses this × total damage as a simple model."
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

      {/* DPS */}
      <CollapsibleSection title="DPS" defaultOpen>
        <StatRow label="Burst DPS" value={stats.burstDps.toFixed(0)} highlighted />
        <StatRow label="Sustained DPS" value={stats.sustainedDps.toFixed(0)} highlighted />
        {stats.statusProcs && stats.statusProcs.length > 0 && (() => {
          const procsPerSec = stats.fireRate * stats.statusChance * stats.multishot;
          const dotProcs = stats.statusProcs.filter(p => p.totalDamage > 0);
          const statusDps = dotProcs.reduce((sum, p) => {
            const pps = procsPerSec * p.chance / stats.statusChance;
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
                      {Object.entries(evo.statChanges).map(([s, v]) =>
                        `${s}: ${(v as number) > 0 ? "+" : ""}${((v as number) * 100).toFixed(0)}%`
                      ).join(", ")}
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

function AdaptationSurvivability({ stats }: { stats: WarframeCalculatedStats }) {
  const [stacks, setStacks] = useState(ADAPTATION_MAX_STACKS);
  const armorDR = stats.damageReduction / 100;
  const { typedDRPercent, combinedDRPercent, adaptedEHP } = computeAdaptationSurvivability(
    stats.effectiveHealth,
    armorDR,
    stacks,
  );

  return (
    <div className="py-1 space-y-1 border-t border-violet-500/20 mt-1">
      <div className="text-[10px] font-medium text-violet-400/90">Adaptation (typed DR)</div>
      <SimSlider
        label="Stacks"
        value={stacks}
        min={0}
        max={ADAPTATION_MAX_STACKS}
        onChange={setStacks}
        tooltip="+10% resistance per stack to the damage type you're taking (20s)"
      />
      <StatRow
        label="Typed resist"
        value={`${typedDRPercent.toFixed(0)}%`}
        color="text-violet-300"
        tooltip="Resistance to the adapted damage type only"
      />
      <StatRow
        label="Combined DR"
        value={`${combinedDRPercent.toFixed(1)}%`}
        color="text-violet-400"
        tooltip="Armor DR and Adaptation stack multiplicatively vs that type"
      />
      <StatRow
        label="Adapted EHP"
        value={adaptedEHP.toFixed(0)}
        color="text-violet-400"
        tooltip="Effective health vs fully adapted single-type damage"
      />
      <p className="text-[9px] text-muted-foreground/80 leading-snug">
        Ramps when you take hits; each element tracks separately. Uses base EHP/DR above.
      </p>
    </div>
  );
}

export function WarframeStatsPanel({ stats, warframe, equippedMods, allMods, helminthSlot, helminthAbility, equippedShards, equippedArcanes, arcaneRanks, activeDualFormId }: {
  stats: WarframeCalculatedStats | null; warframe?: Warframe | null;
  equippedMods?: EquippedMod[]; allMods?: Map<string, Mod>;
  helminthSlot?: number | null; helminthAbility?: HelminthAbility | null;
  equippedShards?: (EquippedArchonShard | null)[];
  equippedArcanes?: (Mod | null)[];
  arcaneRanks?: number[];
  activeDualFormId?: string;
}) {
  const shardLines = useMemo(
    () => buildShardBonusLines(equippedShards ?? []),
    [equippedShards],
  );

  const arcaneDisplays = useMemo(() => {
    if (!equippedArcanes || !stats) return [];
    return equippedArcanes
      .map((arcane, i) => {
        if (!arcane) return null;
        const rank = arcaneRanks?.[i] ?? arcane.maxRank;
        return getArcaneDisplayInfo(arcane, rank, {
          totalArmor: stats.totalArmor,
          persistenceActive: stats.persistenceActive,
        });
      })
      .filter(Boolean);
  }, [equippedArcanes, arcaneRanks, stats]);

  const abilityPreviewEntries = useMemo(() => {
    if (!warframe?.abilities?.length) return [];
    if (activeDualFormId) {
      const entries = getDualFormAbilities(warframe.id, activeDualFormId, warframe.abilities);
      if (entries) {
        return entries.map((entry) => ({
          key: `${entry.abilityIndex}-${activeDualFormId}`,
          ability: entry.ability,
          slotIndex: entry.gameSlot - 1,
          formLabel: entry.formLabel,
        }));
      }
    }
    return warframe.abilities.map((ability, i) => ({
      key: String(i),
      ability,
      slotIndex: i,
      formLabel: undefined as string | undefined,
    }));
  }, [warframe, activeDualFormId]);

  if (!stats) {
    return (
      <div className="border border-border rounded-xl p-4 bg-card">
        <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-3">STATS</h3>
        <p className="text-xs text-muted-foreground">Select a warframe to see stats</p>
      </div>
    );
  }

  // Detect equipped augments
  const equippedAugments: Mod[] = [];
  if (equippedMods && allMods) {
    for (const em of equippedMods) {
      const mod = allMods.get(em.modId);
      if (mod && mod.category === "augment") {
        equippedAugments.push(mod);
      }
    }
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-1">
      <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-2">WARFRAME STATS</h3>

      {warframe?.passive && (
        <CollapsibleSection title="PASSIVE" defaultOpen>
          <p className="text-[11px] text-muted-foreground leading-relaxed py-1">{formatAbilityDescription(warframe.passive)}</p>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="SURVIVABILITY" defaultOpen>
        <StatRow label="Health" value={stats.totalHealth.toFixed(0)} />
        <StatRow label="Shield" value={stats.totalShield.toFixed(0)} />
        <StatRow label="Armor" value={stats.totalArmor.toFixed(0)} />
        <StatRow label="Energy" value={stats.totalEnergy.toFixed(0)} />
        <StatRow label="Sprint Speed" value={stats.totalSprint.toFixed(2)} />
        {stats.healthRegenPerSec > 0 && (
          <StatRow label="Health Regen" value={`${stats.healthRegenPerSec.toFixed(1)}/s`} color="text-green-400" />
        )}
        {stats.elementalResistance > 0 && (
          <StatRow label="Elemental Resist" value={`${stats.elementalResistance.toFixed(0)}%`} color="text-cyan-400" />
        )}
        {stats.persistenceDamageCapPerSecond != null && (
          <p
            className={`text-[10px] leading-snug pt-0.5 ${stats.persistenceActive ? "text-amber-400/90" : "text-muted-foreground"}`}
            title="Shields removed while equipped. Magnetic and nullify disable the damage cap."
          >
            Arcane Persistence: shields removed
            {stats.persistenceActive
              ? ` — damage capped at ${stats.persistenceDamageCapPerSecond}/s (armor ≥ 700)`
              : ` — needs 700+ armor for ${stats.persistenceDamageCapPerSecond}/s damage cap (currently ${stats.totalArmor.toFixed(0)} armor)`}
            {" "}(not included in EHP).
          </p>
        )}
        <div className="border-t border-border/50 my-1" />
        <StatRow label="Effective Health" value={stats.effectiveHealth.toFixed(0)} highlighted />
        <StatRow label="Damage Reduction" value={`${stats.damageReduction.toFixed(1)}%`} highlighted />
        {stats.adaptationNoteMaxTypedDRPercent != null && (
          <AdaptationSurvivability stats={stats} />
        )}
      </CollapsibleSection>

      <CollapsibleSection title="ABILITY MODS" defaultOpen>
        <StatRow label="Strength" value={`${(stats.abilityStrength * 100).toFixed(0)}%`}
          color={stats.abilityStrength > 1 ? "text-orange-400" : stats.abilityStrength < 1 ? "text-red-400" : undefined} />
        <StatRow label="Duration" value={`${(stats.abilityDuration * 100).toFixed(0)}%`}
          color={stats.abilityDuration > 1 ? "text-cyan-400" : stats.abilityDuration < 1 ? "text-red-400" : undefined} />
        <StatRow label="Efficiency" value={`${(stats.abilityEfficiency * 100).toFixed(0)}%`}
          color={stats.abilityEfficiency > 1 ? "text-blue-400" : stats.abilityEfficiency < 1 ? "text-red-400" : undefined} />
        <StatRow label="Range" value={`${(stats.abilityRange * 100).toFixed(0)}%`}
          color={stats.abilityRange > 1 ? "text-green-400" : stats.abilityRange < 1 ? "text-red-400" : undefined} />
      </CollapsibleSection>

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
            {(stats.augurEnergyToShieldsPercent ?? 0) > 0 && (
              <StatRow label="Augur (shields)" value={`${stats.augurEnergyToShieldsPercent}% of energy → shields`} color="text-sky-400" />
            )}
            {(stats.hunterCompanionVsStatusDamagePercent ?? 0) > 0 && (
              <StatRow label="Hunter (companion)" value={`+${stats.hunterCompanionVsStatusDamagePercent}% dmg vs status targets`} color="text-amber-400" />
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Shard Bonuses */}
      {shardLines.length > 0 && (
        <CollapsibleSection title="SHARD BONUSES" defaultOpen>
          {shardLines.map((line, i) => (
            <div key={i} className="py-0.5">
              <StatRow
                label={line.label}
                value={line.value}
                color={line.conditional ? "text-muted-foreground" : "text-purple-400"}
                tooltip={line.conditional ? `${line.shardName} — conditional` : line.shardName}
              />
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Arcane Bonuses */}
      {arcaneDisplays.length > 0 && (
        <CollapsibleSection title="ARCANE BONUSES" defaultOpen>
          {arcaneDisplays.map((info) => info && (
            <div key={info.name} className="py-1.5 border-b border-border/30 last:border-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-purple-300">{info.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">R{info.rank}/{info.maxRank}</span>
              </div>
              {info.applied.map((line, i) => (
                <StatRow
                  key={`a-${i}`}
                  label={line.label}
                  value={line.value}
                  color={line.active === false ? "text-muted-foreground" : "text-purple-400"}
                />
              ))}
              {info.conditional.map((line, i) => (
                <div key={`c-${i}`} className="py-0.5">
                  <StatRow
                    label={line.label}
                    value={line.value}
                    color={line.active ? "text-green-400" : "text-muted-foreground"}
                  />
                  {line.note && (
                    <p className="text-[9px] text-muted-foreground/80 pl-0.5">{line.note}</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Ability Preview */}
      {abilityPreviewEntries.length > 0 && (
        <CollapsibleSection
          title={
            activeDualFormId
              ? `ABILITIES — ${getDualFormConfig(warframe?.id ?? "")?.forms.find((f) => f.id === activeDualFormId)?.label ?? ""}`
              : "ABILITIES"
          }
          defaultOpen
        >
          {abilityPreviewEntries.map((entry) => {
            if (helminthSlot === entry.slotIndex && helminthAbility) {
              return <HelminthAbilityPreview key={entry.key} ability={helminthAbility} stats={stats} />;
            }
            return (
              <AbilityPreview
                key={entry.key}
                ability={entry.ability}
                stats={stats}
                formLabel={entry.formLabel}
                warframeId={warframe?.id}
              />
            );
          })}
        </CollapsibleSection>
      )}

      {/* Equipped Augments */}
      {equippedAugments.length > 0 && (
        <CollapsibleSection title="AUGMENTS" defaultOpen>
          {equippedAugments.map((aug) => (
            <div key={aug.id} className="py-1 border-b border-border/30 last:border-0">
              <div className="text-xs font-medium text-purple-400">{aug.name}</div>
              {aug.description && (
                <div className="text-[10px] text-muted-foreground mt-0.5">{aug.description}</div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {Object.entries(aug.stats).map(([stat, val]) => (
                  <span key={stat} className="text-[10px] text-purple-300/80 font-mono">
                    {stat}: +{String(val)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CollapsibleSection>
      )}
    </div>
  );
}

const FACTION_COLORS: Record<string, string> = {
  Grineer: "text-red-400",
  Corpus: "text-blue-300",
  Infested: "text-green-400",
  Corrupted: "text-yellow-400",
  Stalker: "text-purple-400",
};

function TTKSection({ stats }: { stats: CalculatedStats }) {
  const [level, setLevel] = useState(100);
  const [selectedFaction, setSelectedFaction] = useState("all");
  const [expandedEnemy, setExpandedEnemy] = useState<string | null>(null);

  const results = useMemo(() => {
    const enemies = selectedFaction === "all"
      ? ENEMY_TYPES
      : ENEMY_TYPES.filter((e) => e.faction === selectedFaction);
    return enemies.map((e) => calculateTTK(stats, e, level)).sort((a, b) => a.ttk - b.ttk);
  }, [stats, level, selectedFaction]);

  const factions = ["all", ...new Set(ENEMY_TYPES.map((e) => e.faction))];

  const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toFixed(0);

  return (
    <CollapsibleSection title="TIME TO KILL" defaultOpen={false}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-muted-foreground">Lv</span>
        <input
          type="range"
          min={1}
          max={200}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="flex-1 h-1 accent-primary"
        />
        <span className="text-[10px] font-mono w-8 text-right">{level}</span>
      </div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {factions.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFaction(f)}
            className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${selectedFaction === f
                ? "border-primary text-primary bg-primary/10"
                : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>
      <div className="space-y-0.5">
        {results.map((r) => (
          <div key={r.enemy.id}>
            <button
              onClick={() => setExpandedEnemy(expandedEnemy === r.enemy.id ? null : r.enemy.id)}
              className="w-full flex justify-between items-center py-0.5 hover:bg-muted/30 rounded px-1 -mx-1 transition-colors"
            >
              <span className={`text-[10px] ${FACTION_COLORS[r.enemy.faction] || "text-muted-foreground"}`}>
                {r.enemy.name}
              </span>
              <span className={`text-[10px] font-mono ${r.ttk < 1 ? "text-green-400" : r.ttk < 5 ? "text-yellow-400" : r.ttk < 15 ? "text-orange-400" : "text-red-400"
                }`}>
                {r.ttk === Infinity ? "∞" : r.ttk < 0.01 ? "<0.01s" : `${r.ttk.toFixed(2)}s`}
              </span>
            </button>
            {expandedEnemy === r.enemy.id && (
              <div className="ml-2 mb-1 pl-2 border-l border-border/50 space-y-0.5 py-0.5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Shots to Kill</span>
                  <span className="font-mono">{r.shotsToKill === Infinity ? "∞" : r.shotsToKill}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Health</span>
                  <span className="font-mono">{fmt(r.scaledHealth)}</span>
                </div>
                {r.scaledShield > 0 && (
                  <div className="flex justify-between text-[9px]">
                    <span className="text-muted-foreground">Shield</span>
                    <span className="font-mono text-cyan-300">{fmt(r.scaledShield)}</span>
                  </div>
                )}
                {r.scaledArmor > 0 && (
                  <div className="flex justify-between text-[9px]">
                    <span className="text-muted-foreground">Armor</span>
                    <span className="font-mono">{fmt(r.scaledArmor)} <span className="text-red-400">({r.armorDR.toFixed(1)}% DR)</span></span>
                  </div>
                )}
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Burst DPS</span>
                  <span className="font-mono text-amber-300">{fmt(r.burstDps)}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-muted-foreground">Sustained DPS</span>
                  <span className="font-mono text-amber-300">{fmt(r.sustainedDps)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}


function AbilityPreview({ ability, stats, formLabel, warframeId }: {
  ability: Ability; stats: WarframeCalculatedStats; formLabel?: string; warframeId?: string;
}) {
  const str = stats.abilityStrength;
  const dur = stats.abilityDuration;
  const eff = stats.abilityEfficiency;
  const rng = stats.abilityRange;
  const display = { warframeId, abilityName: ability.name };

  const modifiedCost = Math.round(scaledAbilityEnergyCost(ability.energyCost, eff));
  const scaledMisc = ability.miscStats
    ? scaleAbilityMiscStats(ability.miscStats, { strength: str, duration: dur, range: rng }, display)
    : [];

  const scaledDr = ability.damageReduction != null && ability.damageReduction > 0
    ? scaledAbilityDamageReduction(ability.damageReduction, str, display, ability.miscStats)
    : null;
  const scaledBuff = ability.damageBuff != null && ability.damageBuff > 0
    ? scaledAbilityDamageBuff(ability.damageBuff, str, display)
    : null;

  const desc = formatAbilityDescription(ability.description);
  return (
    <div className="py-1.5 border-b border-border/30 last:border-0">
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs font-medium min-w-0">
          {ability.name}
          {formLabel && (
            <span className="ml-1.5 text-[9px] font-normal text-primary/70">{formLabel}</span>
          )}
        </span>
        <span className="text-[10px] text-yellow-400 font-mono shrink-0">{modifiedCost} energy</span>
      </div>
      {desc.length > 0 && (
        <p className="text-[9px] text-muted-foreground/90 mt-1 leading-snug">{desc}</p>
      )}
      {ability.damageType != null && String(ability.damageType).length > 0 && (
        <div className="text-[10px] text-muted-foreground mt-1">
          Damage type:{" "}
          <span className="text-sky-300/90 font-medium">{ability.damageType}</span>
        </div>
      )}
      {ability.subAbilities != null && ability.subAbilities.length > 0 && (
        <ul className="list-disc list-inside text-[9px] text-muted-foreground mt-1 space-y-0.5 leading-snug">
          {ability.subAbilities.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
      <div className="mt-0.5 space-y-0">
        {ability.damage != null && ability.damage > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Damage: <span className="text-foreground font-mono">{(ability.damage * str).toFixed(0)}</span>
          </div>
        )}
        {ability.directDamage != null && ability.directDamage > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Direct Damage: <span className="text-foreground font-mono">{(ability.directDamage * str).toFixed(0)}</span>
          </div>
        )}
        {ability.aoeDamage != null && ability.aoeDamage > 0 && (
          <div className="text-[10px] text-muted-foreground">
            AoE Damage: <span className="text-foreground font-mono">{(ability.aoeDamage * str).toFixed(0)}</span>
          </div>
        )}
        {ability.damagePerSecond != null && ability.damagePerSecond > 0 && (
          <div className="text-[10px] text-muted-foreground">
            DPS: <span className="text-foreground font-mono">{(ability.damagePerSecond * str).toFixed(0)}/s</span>
          </div>
        )}
        {scaledBuff && (
          <div className="text-[10px] text-muted-foreground">
            Damage Buff:{" "}
            <span className="text-orange-400 font-mono">
              +{(scaledBuff.value * 100).toFixed(0)}%
            </span>
          </div>
        )}
        {scaledDr && (
          <div className="text-[10px] text-muted-foreground">
            DR:{" "}
            <span className="text-cyan-400 font-mono">
              {(scaledDr.value * 100).toFixed(0)}%
            </span>
          </div>
        )}
        {ability.duration != null && ability.duration > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Duration: <span className="text-foreground font-mono">{(ability.duration * dur).toFixed(1)}s</span>
          </div>
        )}
        {ability.range != null && ability.range > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Range: <span className="text-foreground font-mono">{(ability.range * rng).toFixed(1)}m</span>
          </div>
        )}
        {ability.radius != null && ability.radius > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Radius: <span className="text-foreground font-mono">{(ability.radius * rng).toFixed(1)}m</span>
          </div>
        )}
        {ability.health != null && ability.health > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Health: <span className="text-foreground font-mono">{(ability.health * str).toFixed(0)}</span>
          </div>
        )}
        {ability.armor != null && ability.armor > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Armor: <span className="text-foreground font-mono">{(ability.armor * str).toFixed(0)}</span>
          </div>
        )}
        {ability.shield != null && ability.shield > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Shield: <span className="text-foreground font-mono">{(ability.shield * str).toFixed(0)}</span>
          </div>
        )}
        {ability.statusChance != null && ability.statusChance > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Status:{" "}
            <span className="text-foreground font-mono">
              {Math.min(100, ability.statusChance * str * 100).toFixed(0)}%
            </span>
          </div>
        )}
        {ability.castTime != null && ability.castTime > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Cast: <span className="text-foreground font-mono">{ability.castTime.toFixed(1)}s</span>
          </div>
        )}
        {ability.cooldown != null && ability.cooldown > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Cooldown: <span className="text-foreground font-mono">{ability.cooldown.toFixed(1)}s</span>
          </div>
        )}
        {ability.chainRange != null && ability.chainRange > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Chain range: <span className="text-foreground font-mono">{(ability.chainRange * rng).toFixed(1)}m</span>
          </div>
        )}
        {ability.chainLinks != null && ability.chainLinks > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Chain links: <span className="text-foreground font-mono">{ability.chainLinks}</span>
          </div>
        )}
        {ability.maxTargets != null && ability.maxTargets > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Max targets: <span className="text-foreground font-mono">{ability.maxTargets}</span>
          </div>
        )}
        {scaledMisc.length > 0 && (
          <div className="pt-0.5 mt-0.5 border-t border-border/30 space-y-0.5">
            {scaledMisc.map((line) => (
              <div key={line.label} className="text-[9px] text-muted-foreground">
                <span className="text-amber-400/90">{line.label}:</span>{" "}
                <span className="text-foreground font-mono">
                  {line.modified ? line.scaled : line.base}
                </span>
                {line.modified && (
                  <span className="text-muted-foreground/60 ml-1">({line.base})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HelminthAbilityPreview({ ability, stats }: {
  ability: HelminthAbility; stats: WarframeCalculatedStats;
}) {
  const str = stats.abilityStrength;
  const dur = stats.abilityDuration;
  const eff = stats.abilityEfficiency;
  const rng = stats.abilityRange;

  const display = { warframeId: undefined, abilityName: ability.name, helminth: true as const };

  const modifiedCost = Math.round(scaledAbilityEnergyCost(ability.energyCost, eff));
  const scaledMisc = ability.miscStats
    ? scaleAbilityMiscStats(ability.miscStats, { strength: str, duration: dur, range: rng }, display)
    : [];
  const desc = formatAbilityDescription(ability.description);

  return (
    <div className="py-1.5 border-b border-green-500/20 last:border-0">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-green-400">{ability.name}</span>
        <span className="text-[10px] text-yellow-400 font-mono">{modifiedCost} energy</span>
      </div>
      <div className="text-[9px] text-green-400/60 mb-0.5">
        {ability.sourceWarframe ? `Subsumed from ${ability.sourceWarframe}` : "Helminth"}
      </div>
      {desc.length > 0 && (
        <p className="text-[9px] text-muted-foreground/90 mt-1 leading-snug">{desc}</p>
      )}
      <div className="mt-0.5 space-y-0">
        {ability.damage != null && ability.damage > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Damage: <span className="text-foreground font-mono">{(ability.damage * str).toFixed(0)}</span>
          </div>
        )}
        {ability.damageBuff != null && ability.damageBuff > 0 && (() => {
          const buff = scaledAbilityDamageBuff(ability.damageBuff, str, display);
          return (
            <div className="text-[10px] text-muted-foreground">
              Damage Buff:{" "}
              <span className="text-orange-400 font-mono">
                +{(buff.value * 100).toFixed(0)}%
              </span>
            </div>
          );
        })()}
        {ability.damageReduction != null && ability.damageReduction > 0 && (() => {
          const dr = scaledAbilityDamageReduction(ability.damageReduction, str, display, ability.miscStats);
          return (
            <div className="text-[10px] text-muted-foreground">
              DR:{" "}
              <span className="text-cyan-400 font-mono">
                {(dr.value * 100).toFixed(0)}%
              </span>
            </div>
          );
        })()}
        {ability.duration != null && ability.duration > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Duration: <span className="text-foreground font-mono">{(ability.duration * dur).toFixed(1)}s</span>
          </div>
        )}
        {ability.range != null && ability.range > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Range: <span className="text-foreground font-mono">{(ability.range * rng).toFixed(1)}m</span>
          </div>
        )}
        {ability.radius != null && ability.radius > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Radius: <span className="text-foreground font-mono">{(ability.radius * rng).toFixed(1)}m</span>
          </div>
        )}
        {ability.castTime != null && ability.castTime > 0 && (
          <div className="text-[10px] text-muted-foreground">
            Cast: <span className="text-foreground font-mono">{ability.castTime.toFixed(1)}s</span>
          </div>
        )}
        {scaledMisc.length > 0 && (
          <div className="pt-0.5 mt-0.5 border-t border-border/30 space-y-0.5">
            {scaledMisc.map((line) => (
              <div key={line.label} className="text-[9px] text-muted-foreground">
                <span className="text-green-400/90">{line.label}:</span>{" "}
                <span className="text-foreground font-mono">
                  {line.modified ? line.scaled : line.base}
                </span>
                {line.modified && (
                  <span className="text-muted-foreground/60 ml-1">({line.base})</span>
                )}
              </div>
            ))}
            {ability.miscStats?.channeled === true && (
              <div className="text-[9px] text-muted-foreground">
                <span className="text-green-400/90">Channeled</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
