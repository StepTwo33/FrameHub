"use client";

import type { CalculatedStats, SimulationParams, Weapon } from "@/lib/types";
import {
  weaponSupportsPrimaryStyleSets,
  weaponAcceptsSynthReloadBonus,
  weaponSupportsHunterCompanionSet,
} from "@/lib/calc/set-bonuses";
import { getModStatLabel } from "@/lib/overrides/override-stat-catalog";
import { CollapsibleSection, SimSlider } from "./stat-primitives";

export function WeaponSimControls({
  stats,
  simParams,
  onSimParamsChange,
  weapon,
  isMelee,
  hasConditionals,
  onKillBuffTotal,
  triggerBuffTotal,
}: {
  stats: CalculatedStats;
  simParams: SimulationParams;
  onSimParamsChange: (p: SimulationParams) => void;
  weapon?: Weapon | null;
  isMelee?: boolean;
  hasConditionals: boolean;
  onKillBuffTotal: number;
  triggerBuffTotal: number;
}) {
  return (
      <CollapsibleSection title="SIMULATION" defaultOpen={hasConditionals}>
        <div className="space-y-1.5 py-1 min-w-0">
          {isMelee && (
            <SimSlider
              label="Combo Hits" value={simParams.comboCount} min={0} max={260}
              onChange={(v) => onSimParamsChange({ ...simParams, comboCount: v })}
              tooltip="Consecutive melee combo counter. Blood Rush, Weeping Wounds, Gladiator, and heavy attacks share one track: 1× below 20 hits, then 2×…12× every 20 hits (220+ = 12×). Bonus = mod% × (CM−1), additive with other chance mods."
            />
          )}
          <SimSlider
            label="Kill Stacks" value={simParams.killStacks} min={0} max={5}
            onChange={(v) => onSimParamsChange({ ...simParams, killStacks: v })}
            tooltip="On-kill stacks — Galvanized Chamber/Scope (max 5), Hell/Diffusion (max 4), Aptitude/Savvy (max 2), Shot (max 3), Berserker Fury (max 2). Any stacks also activate non-stacking on-kill buffs (Bladed Rounds etc.)"
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
          {weapon && weaponSupportsHunterCompanionSet(weapon) && (
            <SimSlider
              label="Hunter vs Slash (DPS)"
              value={simParams.applyHunterSetVsSlashDamage ? 1 : 0}
              min={0}
              max={1}
              onChange={(v) => onSimParamsChange({ ...simParams, applyHunterSetVsSlashDamage: v >= 1 })}
              tooltip="When Hunter set pieces are equipped across the loadout, apply +25%/piece companion damage vs Slash-status targets (max +150%)."
            />
          )}
          <SimSlider
            label="Mecha Empowered vs marked"
            value={simParams.applyMechaEmpoweredVsMarkedDamage ? 1 : 0}
            min={0}
            max={1}
            onChange={(v) => onSimParamsChange({ ...simParams, applyMechaEmpoweredVsMarkedDamage: v >= 1 })}
            tooltip="When Mecha Empowered is equipped and ≥1 Mecha set piece marks a target, apply +150% squad damage vs that marked enemy."
          />
          <div className="pt-1 space-y-1.5">
            {weapon?.id === "onos" && (
              <label className="block text-[10px] text-muted-foreground" title="Wiki: Held Radiation beam vs full-charge Heat blast">
                Onos Incarnon attack
                <select
                  value={simParams.onosIncarnonMode ?? "held"}
                  onChange={(e) =>
                    onSimParamsChange({
                      ...simParams,
                      onosIncarnonMode: e.target.value === "charge" ? "charge" : "held",
                    })
                  }
                  className="mt-0.5 h-7 w-full rounded border border-border bg-background px-1.5 text-[11px]"
                >
                  <option value="held">Held Radiation beam</option>
                  <option value="charge">Full-charge Heat blast</option>
                </select>
              </label>
            )}
            {(simParams.activeWeaponAbilityBuffs ?? []).includes("Vex Armor") && (
              <SimSlider
                label="Vex Fury fill"
                value={Math.round((simParams.vexArmorFuryFraction ?? 1) * 100)}
                min={0}
                max={100}
                onChange={(v) =>
                  onSimParamsChange({ ...simParams, vexArmorFuryFraction: v / 100 })
                }
                tooltip="Vex Armor Fury stack progress (0–100%). Max Fury is +275% weapon damage × Ability Strength."
              />
            )}
            {(simParams.activeWeaponAbilityBuffs ?? []).includes("Toxic Lash") && (
              <>
                <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!simParams.toxicLashSporesOnTarget}
                    onChange={(e) =>
                      onSimParamsChange({
                        ...simParams,
                        toxicLashSporesOnTarget: e.target.checked,
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                  />
                  Spores on target (2× Extra Hit)
                </label>
                <SimSlider
                  label="Contagion Cloud enemies"
                  value={simParams.contagionCloudEnemies ?? 0}
                  min={0}
                  max={8}
                  onChange={(v) =>
                    onSimParamsChange({ ...simParams, contagionCloudEnemies: v })
                  }
                  tooltip="Enemies assumed in Contagion Cloud (Toxic Lash augment). 0 = off. Ability toxin DPS × Strength (×2 melee) × enemies — needs Contagion Cloud equipped."
                />
              </>
            )}
            {(simParams.activeWeaponAbilityBuffs ?? []).includes("Absorb") && (
              <SimSlider
                label="Absorb damage"
                value={Math.round((simParams.absorbAbsorbedDamage ?? 0) / 1000)}
                min={0}
                max={64}
                suffix="k"
                onChange={(v) =>
                  onSimParamsChange({ ...simParams, absorbAbsorbedDamage: v * 1000 })
                }
                tooltip="Damage absorbed before Absorb release (thousands). 0 = off. Weapon buff = √(0.025% × Strength × absorbed), capped at 400% (64k at 100% STR)."
              />
            )}
            <label className="block text-[10px] text-muted-foreground" title="Bane / Expel / Smite apply (1+bonus) on hits and squared on DoTs">
              Target faction
              <select
                value={simParams.targetFaction ?? ""}
                onChange={(e) =>
                  onSimParamsChange({
                    ...simParams,
                    targetFaction: e.target.value || undefined,
                  })
                }
                className="mt-0.5 h-7 w-full rounded border border-border bg-background px-1.5 text-[11px]"
              >
                <option value="">None (paper DPS)</option>
                <option value="Grineer">Grineer</option>
                <option value="Corpus">Corpus</option>
                <option value="Infested">Infested</option>
                <option value="Corrupted">Corrupted / Orokin</option>
                <option value="Murmur">The Murmur</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={!!simParams.applyHeadshots}
                onChange={(e) =>
                  onSimParamsChange({ ...simParams, applyHeadshots: e.target.checked })
                }
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              Headshots (2× weak point × Acuity)
            </label>
            {(Object.keys(stats.triggerStatBonuses ?? {}).length > 0) && (
              <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!simParams.applyTriggerBuffs}
                  onChange={(e) =>
                    onSimParamsChange({ ...simParams, applyTriggerBuffs: e.target.checked })
                  }
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
                Trigger buffs (aim / reload / cast / latch)
              </label>
            )}
            {isMelee && (
              <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={simParams.applyStanceMultiplier !== false}
                  onChange={(e) =>
                    onSimParamsChange({ ...simParams, applyStanceMultiplier: e.target.checked })
                  }
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
                Neutral hit avg
                {(stats.stanceDamageMultiplier ?? 1) !== 1 && (
                  <span className="text-cyan-400 font-mono">
                    ×{(stats.stanceDamageMultiplier ?? 1).toFixed(2)}
                  </span>
                )}
              </label>
            )}
          </div>
          {(stats.statusDamageBonus ?? 0) > 0 && (
            <div className="text-[10px] text-amber-400">
              Status damage: +{((stats.statusDamageBonus ?? 0) * 100).toFixed(0)}% (Elementalist)
            </div>
          )}
          {simParams.targetFaction && Object.keys(stats.factionBonuses ?? {}).length > 0 && (
            <div className="text-[10px] text-orange-400">
              Faction mods active vs {simParams.targetFaction}
            </div>
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
            {stats.galvanizedMultishotOnKill > 0 && (() => {
              const msCap = stats.galvanizedMultishotStackCap ?? 5;
              const msStacks = Math.min(stats.simParams.killStacks, msCap);
              return (
                <div className="text-[10px] text-blue-400">Galv. Multishot: +{(stats.galvanizedMultishotOnKill * msStacks * 100).toFixed(0)}% MS ({msStacks}/{msCap} stacks)</div>
              );
            })()}
            {stats.galvanizedDamagePerStatus > 0 && (() => {
              const cdCap = stats.galvanizedDamagePerStatusStackCap ?? 5;
              const cdStacks = Math.min(stats.simParams.killStacks, cdCap);
              return (
                <div className="text-[10px] text-blue-400">Galv. Condition: +{(stats.galvanizedDamagePerStatus * cdStacks * stats.simParams.statusTypesOnTarget * 100).toFixed(0)}% DMG ({cdStacks}/{cdCap} stacks × {stats.simParams.statusTypesOnTarget} status)</div>
              );
            })()}
            {onKillBuffTotal > 0 && (
              <div className={stats.simParams.killStacks > 0 ? "text-[10px] text-blue-400" : "text-[10px] text-muted-foreground/70"}>
                On-kill buffs{stats.simParams.killStacks > 0 ? ": " : " (inactive — needs kill stacks): "}
                {Object.entries(stats.onKillStatBonuses ?? {}).map(([k, v]) => `+${(v * 100).toFixed(0)}% ${getModStatLabel(k)}`).join(", ")}
              </div>
            )}
            {triggerBuffTotal > 0 && (
              <div className={stats.simParams.applyTriggerBuffs ? "text-[10px] text-blue-400" : "text-[10px] text-muted-foreground/70"}>
                Trigger buffs{stats.simParams.applyTriggerBuffs ? ": " : " (inactive — enable Trigger buffs): "}
                {Object.entries(stats.triggerStatBonuses ?? {}).map(([k, v]) => `+${(v * 100).toFixed(0)}% ${getModStatLabel(k)}`).join(", ")}
              </div>
            )}
            {(stats.galvanizedCritOnHeadshot ?? 0) > 0 && (
              stats.simParams.applyHeadshots ? (
                <div className="text-[10px] text-blue-400">Galv. Crit: +{(((stats.galvanizedCritOnHeadshot ?? 0) + (stats.galvanizedCritOnHeadshotPerStack ?? 0) * Math.min(stats.simParams.killStacks, 5)) * 100).toFixed(0)}% CC while aiming ({Math.min(stats.simParams.killStacks, 5)} headshot-kill stacks)</div>
              ) : (
                <div className="text-[10px] text-muted-foreground/70">Galv. Crit: inactive — enable Headshots to model on-headshot crit</div>
              )
            )}
            {stats.berserkerFuryBonus > 0 && (
              <div className="text-[10px] text-yellow-400">Berserker Fury: +{(stats.berserkerFuryBonus * Math.min(stats.simParams.killStacks, 2) * 100).toFixed(0)}% AS ({Math.min(stats.simParams.killStacks, 2)}/2 stacks)</div>
            )}
            {stats.vigilanteCritBonus && stats.vigilanteCritBonus > 0 && (
              <div className="text-[10px] text-orange-400" title="Primary rifles/shotguns/bows/archguns only — does not apply to secondaries or melee. Averaged into DPS as bonus crit chance.">
                Vigilante Set: {(stats.vigilanteCritBonus * 100).toFixed(0)}% crit tier enhance chance (in DPS)
              </div>
            )}
            {(stats.firstShotDamageBonus ?? 0) > 0 && (
              <div className="text-[10px] text-blue-400">
                First shot: +{((stats.firstShotDamageBonus ?? 0) * 100).toFixed(0)}% damage on first shot in magazine (averaged into DPS)
              </div>
            )}
            {(stats.slashOnImpactProcChance ?? 0) > 0 && (
              <div className="text-[10px] text-red-400">
                Internal Bleeding: {((stats.slashOnImpactProcChance ?? 0) * 100).toFixed(0)}% Slash on Impact procs{stats.fireRate < 2.5 ? " (x2 — fire rate < 2.5)" : ""}
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
  );
}

