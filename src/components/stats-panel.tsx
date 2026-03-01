"use client";

import { CalculatedStats, WarframeCalculatedStats, Warframe, Ability, Mod, EquippedMod, SimulationParams } from "@/lib/types";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Flame, Snowflake, Zap, Skull, Wind, Atom, CloudRain, Sun, Biohazard, Magnet, RadioTower, Bug } from "lucide-react";
import { ENEMY_TYPES, calculateTTK } from "@/lib/ttk";
import { IncarnonEvolution } from "@/data/incarnon";

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

export function WeaponStatsPanel({ stats, baseStats, isMelee, selectedEvolutions, allEvolutions, simParams, onSimParamsChange }: {
  stats: CalculatedStats | null; baseStats?: CalculatedStats | null; isMelee?: boolean;
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

      {/* Simulation Controls */}
      {simParams && onSimParamsChange && (
        <CollapsibleSection title="SIMULATION" defaultOpen={hasConditionals}>
          <div className="space-y-1.5 py-1">
            {isMelee && (
              <SimSlider
                label="Combo Hits" value={simParams.comboCount} min={0} max={245}
                onChange={(v) => onSimParamsChange({ ...simParams, comboCount: v })}
                tooltip="Melee combo hit count — affects Blood Rush, Weeping Wounds, heavy attacks"
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
              label="Arcane Stacks" value={simParams.arcaneStacks} min={0} max={5}
              onChange={(v) => onSimParamsChange({ ...simParams, arcaneStacks: v })}
              tooltip="Arcane activation stacks"
            />
            {isMelee && (
              <SimSlider
                label="WF Gladiator" value={simParams.extraGladiatorMods} min={0} max={3}
                onChange={(v) => onSimParamsChange({ ...simParams, extraGladiatorMods: v })}
                tooltip="Gladiator mods on warframe (Aegis/Finesse/Resolve) — adds +10% CC per combo tier each"
              />
            )}
          </div>
          {/* Active conditional summary */}
          {hasConditionals && (
            <div className="border-t border-border/50 pt-1 mt-1 space-y-0.5">
              <div className="text-[9px] text-muted-foreground/60 mb-0.5">Active conditional effects:</div>
              {stats.bloodRushStacks > 0 && (
                <div className="text-[10px] text-red-400">Blood Rush: +{(stats.bloodRushStacks * (stats.simParams.comboCount > 0 ? stats.comboMultiplier - 1 : 0) * 100).toFixed(0)}% CC</div>
              )}
              {stats.weepingWoundsBonus > 0 && (
                <div className="text-[10px] text-teal-400">Weeping Wounds: +{(stats.weepingWoundsBonus * (stats.simParams.comboCount > 0 ? stats.comboMultiplier - 1 : 0) * 100).toFixed(0)}% SC</div>
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
                <div className="text-[10px] text-orange-400">Vigilante Set: {(stats.vigilanteCritBonus * 100).toFixed(0)}% crit tier enhance chance</div>
              )}
            </div>
          )}
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
        <StatRow label="Critical Multiplier" value={`${stats.criticalMultiplier.toFixed(1)}x`} />
        <StatRow label="Status Chance" value={`${(stats.statusChance * 100).toFixed(1)}%`} />
        <StatRow label="Fire Rate" value={stats.fireRate.toFixed(2)} />
        <StatRow label="Multishot" value={stats.multishot.toFixed(2)} />
        {stats.magazine > 0 && <StatRow label="Magazine" value={stats.magazine.toString()} />}
        {stats.reloadTime > 0 && <StatRow label="Reload Time" value={`${stats.reloadTime.toFixed(2)}s`} />}
      </CollapsibleSection>

      {/* Melee-specific */}
      {isMelee && stats.heavyAttackDamage > 0 && (
        <CollapsibleSection title="MELEE" defaultOpen>
          <StatRow label="Combo Multiplier" value={`${stats.comboMultiplier.toFixed(1)}x`} />
          <StatRow label="Combo Duration" value={`${stats.comboDuration.toFixed(0)}s`} />
          <StatRow label="Heavy Attack" value={stats.heavyAttackDamage.toFixed(0)} highlighted />
          {stats.bloodRushStacks > 0 && (
            <StatRow
              label="Blood Rush"
              value={`+${(stats.bloodRushStacks * 100).toFixed(0)}%/combo`}
              color="text-red-400"
              tooltip="Critical chance bonus per combo multiplier tier"
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

export function WarframeStatsPanel({ stats, warframe, equippedMods, allMods }: {
  stats: WarframeCalculatedStats | null; warframe?: Warframe | null;
  equippedMods?: EquippedMod[]; allMods?: Map<string, Mod>;
}) {
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

      <CollapsibleSection title="SURVIVABILITY" defaultOpen>
        <StatRow label="Health" value={stats.totalHealth.toFixed(0)} />
        <StatRow label="Shield" value={stats.totalShield.toFixed(0)} />
        <StatRow label="Armor" value={stats.totalArmor.toFixed(0)} />
        <StatRow label="Energy" value={stats.totalEnergy.toFixed(0)} />
        <StatRow label="Sprint Speed" value={stats.totalSprint.toFixed(2)} />
        <div className="border-t border-border/50 my-1" />
        <StatRow label="Effective Health" value={stats.effectiveHealth.toFixed(0)} highlighted />
        <StatRow label="Damage Reduction" value={`${stats.damageReduction.toFixed(1)}%`} highlighted />
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

      {/* Ability Preview */}
      {warframe && warframe.abilities && warframe.abilities.length > 0 && (
        <CollapsibleSection title="ABILITIES" defaultOpen={false}>
          {warframe.abilities.map((ability, i) => (
            <AbilityPreview key={i} ability={ability} stats={stats} index={i} />
          ))}
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

function AbilityPreview({ ability, stats, index }: {
  ability: Ability; stats: WarframeCalculatedStats; index: number;
}) {
  const str = stats.abilityStrength;
  const dur = stats.abilityDuration;
  const eff = Math.max(0.25, stats.abilityEfficiency); // efficiency cap at 175%
  const rng = stats.abilityRange;

  const modifiedCost = Math.max(1, Math.round(ability.energyCost * (2 - eff)));

  return (
    <div className="py-1.5 border-b border-border/30 last:border-0">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium">{ability.name}</span>
        <span className="text-[10px] text-yellow-400 font-mono">{modifiedCost} energy</span>
      </div>
      <div className="mt-0.5 space-y-0">
        {ability.damage && (
          <div className="text-[10px] text-muted-foreground">
            Damage: <span className="text-foreground font-mono">{(ability.damage * str).toFixed(0)}</span>
          </div>
        )}
        {ability.directDamage && (
          <div className="text-[10px] text-muted-foreground">
            Direct Damage: <span className="text-foreground font-mono">{(ability.directDamage * str).toFixed(0)}</span>
          </div>
        )}
        {ability.damagePerSecond && (
          <div className="text-[10px] text-muted-foreground">
            DPS: <span className="text-foreground font-mono">{(ability.damagePerSecond * str).toFixed(0)}/s</span>
          </div>
        )}
        {ability.damageBuff && (
          <div className="text-[10px] text-muted-foreground">
            Damage Buff: <span className="text-orange-400 font-mono">+{(ability.damageBuff * str * 100).toFixed(0)}%</span>
          </div>
        )}
        {ability.damageReduction && (
          <div className="text-[10px] text-muted-foreground">
            DR: <span className="text-cyan-400 font-mono">{(ability.damageReduction * str * 100).toFixed(0)}%</span>
          </div>
        )}
        {ability.duration && (
          <div className="text-[10px] text-muted-foreground">
            Duration: <span className="text-foreground font-mono">{(ability.duration * dur).toFixed(1)}s</span>
          </div>
        )}
        {ability.range && (
          <div className="text-[10px] text-muted-foreground">
            Range: <span className="text-foreground font-mono">{(ability.range * rng).toFixed(1)}m</span>
          </div>
        )}
        {ability.radius && (
          <div className="text-[10px] text-muted-foreground">
            Radius: <span className="text-foreground font-mono">{(ability.radius * rng).toFixed(1)}m</span>
          </div>
        )}
        {ability.health && (
          <div className="text-[10px] text-muted-foreground">
            Health: <span className="text-foreground font-mono">{(ability.health * str).toFixed(0)}</span>
          </div>
        )}
        {ability.armor && (
          <div className="text-[10px] text-muted-foreground">
            Armor: <span className="text-foreground font-mono">{(ability.armor * str).toFixed(0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
