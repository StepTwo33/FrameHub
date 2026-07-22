"use client";

import { WarframeCalculatedStats, Warframe, Mod, EquippedMod, EquippedArchonShard } from "@/lib/types";
import { useMemo, useState } from "react";
import { formatAbilityDescription } from "@/lib/display/ability-text";
import { cleanModDescription, getModStatDisplayLines } from "@/lib/display/mod-display";
import { buildShardBonusLines } from "@/lib/display/shard-display";
import { getArcaneDisplayInfo } from "@/lib/display/arcane-display";
import {
  ADAPTATION_MAX_STACKS,
  computeAdaptationSurvivability,
} from "@/lib/calc/calculator";
import {
  computeGaussPassiveShieldRecharge,
  computeGaussPassiveRechargeDelayReduction,
  computeBaruukRestraintDr,
  computeValkyrRageMeleeBonus,
  valkyrRageDeathPreventionActive,
  computeEmberPassiveAbilityStrength,
  computeGarudaPassiveDamageBonus,
  computeFrostPassiveArmor,
  computeCyte09PracticedAimCritChance,
  computeGrendelPassiveArmor,
  computeCalibanAdaptiveArmorDr,
  computeProteaPassiveStrengthBonus,
} from "@/lib/codex/ability-misc-stats";
import { CollapsibleSection, SimSlider, StatRow } from "./stat-primitives";

function GaussPassiveBattery() {
  const [batteryPct, setBatteryPct] = useState(80);
  const batteryT = Math.min(1, Math.max(0, batteryPct / 100));
  const recharge = computeGaussPassiveShieldRecharge(batteryT);
  const delay = computeGaussPassiveRechargeDelayReduction(batteryT);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Battery %"
        value={batteryPct}
        min={0}
        max={100}
        onChange={setBatteryPct}
        tooltip="Gauss passive: shield recharge and delay reduction scale linearly with battery (wiki: 80% → 96%/64%)."
      />
      <StatRow
        label="Shield Recharge"
        value={`+${(recharge * 100).toFixed(0)}%`}
        color="text-sky-400"
        tooltip="Max +120% at full battery (not affected by Ability Strength)."
      />
      <StatRow
        label="Recharge Delay"
        value={`−${(delay * 100).toFixed(0)}%`}
        color="text-sky-400"
        tooltip="Max −80% delay at full battery (not affected by Ability Strength)."
      />
    </div>
  );
}

function BaruukRestraintPassive() {
  const [erodedPct, setErodedPct] = useState(100);
  const dr = computeBaruukRestraintDr(erodedPct / 100);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Restraint Eroded %"
        value={erodedPct}
        min={0}
        max={100}
        onChange={setErodedPct}
        tooltip="Baruuk passive: DR scales linearly with eroded Restraint (wiki: full erosion → 50% DR)."
      />
      <StatRow
        label="Restraint DR"
        value={`${(dr * 100).toFixed(0)}%`}
        color="text-amber-400"
        tooltip="Max 50% at fully eroded meter (not affected by Ability Strength)."
      />
    </div>
  );
}

function ValkyrRagePassive() {
  const [ragePct, setRagePct] = useState(150);
  const meleeBonus = computeValkyrRageMeleeBonus(ragePct);
  const deathPrev = valkyrRageDeathPreventionActive(ragePct);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Rage %"
        value={ragePct}
        min={0}
        max={300}
        onChange={setRagePct}
        tooltip="Valkyr Rage: melee damage bonus equals meter % (cap 300%). Death prevention at ≥150%."
      />
      <StatRow
        label="Melee Damage"
        value={`+${(meleeBonus * 100).toFixed(0)}%`}
        color="text-red-400"
        tooltip="Flat additive melee damage bonus from Rage (not × Ability Strength)."
      />
      <StatRow
        label="Death Prevention"
        value={deathPrev ? "Ready (≥150%)" : "Inactive"}
        color={deathPrev ? "text-green-400" : "text-muted-foreground"}
        tooltip="Fatal hit consumes Rage, grants 5s invuln and full heal (wiki)."
      />
    </div>
  );
}

function EmberHeatPassive() {
  const [heatEnemies, setHeatEnemies] = useState(5);
  const bonusStr = computeEmberPassiveAbilityStrength(heatEnemies);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Heat Enemies"
        value={heatEnemies}
        min={0}
        max={40}
        onChange={setHeatEnemies}
        tooltip="Ember passive: +5% Ability Strength per enemy with active Heat status in Affinity Range."
      />
      <StatRow
        label="Passive Strength"
        value={`+${(bonusStr * 100).toFixed(0)}%`}
        color="text-orange-400"
        tooltip="Additive Ability Strength from Heat-status enemies (not multiplied by Ability Strength)."
      />
    </div>
  );
}

function GarudaDeathsGatePassive() {
  const [kills, setKills] = useState(10);
  const dmgBonus = computeGarudaPassiveDamageBonus(kills);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Kill Stacks"
        value={kills}
        min={0}
        max={20}
        onChange={setKills}
        tooltip="Garuda Death's Gate: +5% weapon/melee damage per kill (cap 100% / 20 kills)."
      />
      <StatRow
        label="Damage Bonus"
        value={`+${(dmgBonus * 100).toFixed(0)}%`}
        color="text-red-400"
        tooltip="Multiplicative universal weapon bonus (panel-only; not wired into weapon DPS)."
      />
    </div>
  );
}

function FrostFortifyingFreezePassive({ moddedArmor }: { moddedArmor: number }) {
  const [coldEnemies, setColdEnemies] = useState(5);
  const bonusArmor = computeFrostPassiveArmor(coldEnemies);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Cold Enemies"
        value={coldEnemies}
        min={0}
        max={40}
        onChange={setColdEnemies}
        tooltip="Frost Fortifying Freeze: +50 Armor per enemy with Cold status in Affinity Range."
      />
      <StatRow
        label="Bonus Armor"
        value={`+${bonusArmor}`}
        color="text-sky-400"
        tooltip="Flat armor after mods (not × Ability Strength). Ability Cold status also lasts +100%."
      />
      <StatRow
        label="Armor w/ Passive"
        value={(moddedArmor + bonusArmor).toFixed(0)}
        color="text-sky-400"
        tooltip="Modded armor + Fortifying Freeze bonus."
      />
    </div>
  );
}

function Cyte09PracticedAimPassive() {
  const [wpKills, setWpKills] = useState(100);
  const wpCc = computeCyte09PracticedAimCritChance(wpKills);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="WP Kills"
        value={wpKills}
        min={0}
        max={300}
        onChange={setWpKills}
        tooltip="Cyte-09 Practiced Aim: +1% Weak Point Critical Chance per WP kill (mission-long, cap 300%)."
      />
      <StatRow
        label="WP Crit Chance"
        value={`+${(wpCc * 100).toFixed(0)}%`}
        color="text-amber-400"
        tooltip="Additive to weapon crit chance vs weak points (not × Ability Strength)."
      />
    </div>
  );
}

function GrendelBellyArmorPassive({ moddedArmor }: { moddedArmor: number }) {
  const [gutEnemies, setGutEnemies] = useState(3);
  const bonusArmor = computeGrendelPassiveArmor(gutEnemies);

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Enemies in Gut"
        value={gutEnemies}
        min={0}
        max={5}
        onChange={setGutEnemies}
        tooltip="Grendel passive: +250 Armor per living Feast victim (cap 5 → +1,250). Catgut not included."
      />
      <StatRow
        label="Bonus Armor"
        value={`+${bonusArmor}`}
        color="text-amber-400"
        tooltip="Flat armor after mods (not × Ability Strength)."
      />
      <StatRow
        label="Armor w/ Passive"
        value={(moddedArmor + bonusArmor).toFixed(0)}
        color="text-amber-400"
        tooltip="Modded armor + belly armor. Max +1,250 at 5 enemies (base; Catgut can raise per-enemy)."
      />
    </div>
  );
}

function CalibanAdaptiveArmorPassive({
  effectiveHealth,
  armorDrFraction,
}: {
  effectiveHealth: number;
  armorDrFraction: number;
}) {
  const [hits, setHits] = useState(10);
  const typedDr = computeCalibanAdaptiveArmorDr(hits);
  const armorMult = 1 - Math.min(Math.max(armorDrFraction, 0), 0.99);
  const combinedMult = armorMult * (1 - typedDr);
  const combinedDrPct = (1 - combinedMult) * 100;
  const adaptedEhp = typedDr < 1 ? effectiveHealth / (1 - typedDr) : effectiveHealth;

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Hits Taken"
        value={hits}
        min={0}
        max={10}
        onChange={setHits}
        tooltip="Caliban Adaptive Armor: +5% typed resistance per hit (cap 50%). Decays after 5s without damage."
      />
      <StatRow
        label="Typed Resist"
        value={`${(typedDr * 100).toFixed(0)}%`}
        color="text-violet-300"
        tooltip="Per damage type; does not stack with Adaptation (higher of the two)."
      />
      <StatRow
        label="Combined DR"
        value={`${combinedDrPct.toFixed(1)}%`}
        color="text-violet-400"
        tooltip="Armor DR × Adaptive Armor vs that type."
      />
      <StatRow
        label="Adapted EHP"
        value={adaptedEhp.toFixed(0)}
        color="text-violet-400"
        tooltip="Effective health vs fully adapted single-type damage (typed resist only on EHP row)."
      />
    </div>
  );
}

function ProteaPowerRecorderPassive({ abilityStrength }: { abilityStrength: number }) {
  const [powerBars, setPowerBars] = useState(3);
  const bonus = computeProteaPassiveStrengthBonus(powerBars);
  const nextStr = abilityStrength + bonus;

  return (
    <div className="py-1 space-y-1 border-t border-border/60 mt-1">
      <SimSlider
        label="Power Bars"
        value={powerBars}
        min={0}
        max={3}
        onChange={setPowerBars}
        tooltip="Protea: 1 bar per cast; at 3 bars the next cast gets +100% Ability Strength, then resets."
      />
      <StatRow
        label="Next Cast STR"
        value={bonus > 0 ? `+${(bonus * 100).toFixed(0)}% Ready` : "Charging"}
        color={bonus > 0 ? "text-green-400" : "text-muted-foreground"}
        tooltip="Additive +100% Ability Strength on the empowered cast only."
      />
      <StatRow
        label="Effective STR"
        value={`${(nextStr * 100).toFixed(0)}%`}
        color="text-amber-400"
        tooltip="Current Ability Strength + passive bonus if power recorder is full."
      />
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

export function WarframeStatsPanel({ stats, warframe, equippedMods, allMods, equippedShards, equippedArcanes, arcaneRanks }: {
  stats: WarframeCalculatedStats | null; warframe?: Warframe | null;
  equippedMods?: EquippedMod[]; allMods?: Map<string, Mod>;
  equippedShards?: (EquippedArchonShard | null)[];
  equippedArcanes?: (Mod | null)[];
  arcaneRanks?: number[];
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

  if (!stats) {
    return (
      <div className="border border-border rounded-xl p-4 bg-card">
        <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-3">STATS</h3>
        <p className="text-xs text-muted-foreground">Select a warframe to see stats</p>
      </div>
    );
  }

  // Detect equipped augments (with rank for display)
  const equippedAugments: { mod: Mod; rank: number }[] = [];
  if (equippedMods && allMods) {
    for (const em of equippedMods) {
      const mod = allMods.get(em.modId);
      if (mod && mod.category === "augment") {
        equippedAugments.push({ mod, rank: em.rank });
      }
    }
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-1">
      <h3 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-2">WARFRAME STATS</h3>

      {warframe?.passive && (
        <CollapsibleSection title="PASSIVE" defaultOpen>
          <p className="text-[11px] text-muted-foreground leading-relaxed py-1">{formatAbilityDescription(warframe.passive)}</p>
          {(warframe.id === "gauss" || warframe.id === "gauss_prime") && <GaussPassiveBattery />}
          {(warframe.id === "baruuk" || warframe.id === "baruuk_prime") && <BaruukRestraintPassive />}
          {(warframe.id === "valkyr" || warframe.id === "valkyr_prime") && <ValkyrRagePassive />}
          {(warframe.id === "ember" || warframe.id === "ember_prime") && <EmberHeatPassive />}
          {(warframe.id === "garuda" || warframe.id === "garuda_prime") && <GarudaDeathsGatePassive />}
          {(warframe.id === "frost" || warframe.id === "frost_prime") && (
            <FrostFortifyingFreezePassive moddedArmor={stats.totalArmor} />
          )}
          {warframe.id === "cyte_09" && <Cyte09PracticedAimPassive />}
          {(warframe.id === "grendel" || warframe.id === "grendel_prime") && (
            <GrendelBellyArmorPassive moddedArmor={stats.totalArmor} />
          )}
          {(warframe.id === "caliban" || warframe.id === "caliban_prime") && (
            <CalibanAdaptiveArmorPassive
              effectiveHealth={stats.effectiveHealth}
              armorDrFraction={stats.damageReduction / 100}
            />
          )}
          {(warframe.id === "protea" || warframe.id === "protea_prime") && (
            <ProteaPowerRecorderPassive abilityStrength={stats.abilityStrength} />
          )}
        </CollapsibleSection>
      )}

      <CollapsibleSection title="SURVIVABILITY" defaultOpen>
        <StatRow label="Health" value={stats.totalHealth.toFixed(0)} />
        <StatRow label="Shield" value={stats.totalShield.toFixed(0)} />
        <StatRow label="Armor" value={stats.totalArmor.toFixed(0)} />
        <StatRow label="Energy" value={stats.totalEnergy.toFixed(0)} />
        <StatRow label="Sprint Speed" value={stats.totalSprint.toFixed(2)} />
        {stats.slideSpeedBonus !== 0 && (
          <StatRow
            label="Slide Speed"
            value={`${stats.slideSpeedBonus > 0 ? "+" : ""}${(stats.slideSpeedBonus * 100).toFixed(0)}%`}
            color={stats.slideSpeedBonus > 0 ? "text-cyan-400" : "text-red-400"}
            tooltip="From Maglev / Cunning Drift / Streamlined Form, etc."
          />
        )}
        {stats.parkourVelocityBonus > 0 && (
          <StatRow label="Parkour Velocity" value={`+${(stats.parkourVelocityBonus * 100).toFixed(0)}%`} color="text-cyan-400" />
        )}
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

      <CollapsibleSection title="EFFECTIVE HEALTH" defaultOpen>
        <StatRow label="Effective Health" value={stats.effectiveHealth.toFixed(0)} highlighted />
        <StatRow label="Damage Reduction" value={`${stats.damageReduction.toFixed(1)}%`} highlighted />
        {stats.adaptationNoteMaxTypedDRPercent != null && (
          <AdaptationSurvivability stats={stats} />
        )}
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
                <div key={`c-${i}-${line.label}`} className="py-0.5">
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

      {/* Equipped Augments */}
      {equippedAugments.length > 0 && (
        <CollapsibleSection title="AUGMENTS" defaultOpen>
          {equippedAugments.map(({ mod, rank }) => {
            const statLines = getModStatDisplayLines(mod, rank);
            return (
              <div key={mod.id} className="py-1.5 border-b border-border/30 last:border-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-purple-300">{mod.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    R{rank}/{mod.maxRank} · ⚡{mod.drain + rank}
                  </span>
                </div>
                {mod.description && (
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    {cleanModDescription(mod.description)}
                  </p>
                )}
                {statLines.length > 0 ? (
                  <ul className="space-y-0.5">
                    {statLines.map((line) => (
                      <li key={line.statKey} className="flex justify-between gap-2 text-[10px]">
                        <span className="text-muted-foreground truncate">{line.label}</span>
                        <span className="font-mono text-purple-300/90 shrink-0 text-right">
                          {line.atRank}
                          {rank < mod.maxRank && (
                            <span className="text-muted-foreground/70"> ({line.atMax} max)</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-muted-foreground/80 italic">Ability effect — see description</p>
                )}
              </div>
            );
          })}
        </CollapsibleSection>
      )}
    </div>
  );
}

