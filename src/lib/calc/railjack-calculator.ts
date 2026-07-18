import { getEffectiveModsMap } from "@/lib/weapons/effective-data";
import {
  findRailjackArmament,
  findRailjackComponent,
  findRailjackEliteCrew,
  railjackBaseStats,
  type RailjackArmament,
  type RailjackComponent,
} from "@/data/railjack";
import {
  crewBonusesFromCompetency,
  RAILJACK_PLEXUS_ABILITIES,
  summarizeEquippedAbilities,
  type RailjackAbilitySummary,
} from "@/lib/codex/railjack-abilities";
import {
  applyVerifiedModStatToRailjack,
  type RailjackModAccumulators,
} from "@/lib/mods/mod-behavior-registry";
import type {
  Mod,
  ModSlot,
  RailjackAbilityComputed,
  RailjackArmamentComputed,
  RailjackCalculatedStats,
} from "@/lib/types";

type EquippedMod = Pick<ModSlot, "modId" | "rank">;

const CONDITIONAL_INTEGRATED_MODS = new Set([
  "crimson_fugue",
  "cruising_speed",
  "protective_shots",
]);

export interface RailjackSimulationInput {
  crimsonFugueStacks?: number;
  cruisingSpeedActive?: boolean;
  protectiveShotsActive?: boolean;
  activeBattleAbilityId?: string | null;
  activeTacticalAbilityId?: string | null;
}

export interface RailjackBuildInput {
  reactorId?: string;
  shieldId?: string;
  engineId?: string;
  platingId?: string;
  /** Port and starboard turret hardpoints. */
  turretIds?: (string | undefined)[];
  /** Legacy single-turret saves. */
  turretId?: string;
  ordnanceId?: string;
  integratedMods?: EquippedMod[];
  battleMods?: EquippedMod[];
  tacticalMods?: EquippedMod[];
  eliteCrewId?: string;
  simulation?: RailjackSimulationInput;
}

function modStatFraction(perRank: number, rank: number): number {
  return (perRank * (rank + 1)) / 100;
}

function resolveTurretIds(input: RailjackBuildInput): (string | undefined)[] {
  if (input.turretIds?.length) {
    return [input.turretIds[0], input.turretIds[1]];
  }
  if (input.turretId) {
    return [input.turretId, undefined];
  }
  return [undefined, undefined];
}

function reactorScaling(reactor: RailjackComponent | undefined) {
  return {
    strength: 1 + (reactor?.stats.abilityStrength ?? 0),
    range: 1 + (reactor?.stats.abilityRange ?? 0),
    duration: 1 + (reactor?.stats.abilityDuration ?? 0),
  };
}

function scaleAbilitySummary(
  summary: RailjackAbilitySummary,
  reactor: RailjackComponent | undefined,
  simulation: RailjackSimulationInput | undefined,
): RailjackAbilityComputed {
  const scale = reactorScaling(reactor);
  const isActive =
    summary.tab === "battle"
      ? simulation?.activeBattleAbilityId === summary.modId
      : simulation?.activeTacticalAbilityId === summary.modId;

  let energyCost = summary.energyCost;
  let cooldownSec = summary.cooldownSec;
  let turretDamageWhileActive = summary.turretDamageWhileActive;

  if (energyCost !== undefined && summary.scalesWith?.includes("strength")) {
    energyCost = Math.round(energyCost * scale.strength);
  }
  if (cooldownSec !== undefined && summary.scalesWith?.includes("duration")) {
    cooldownSec = Math.round(cooldownSec / scale.duration);
  }
  if (turretDamageWhileActive !== undefined) {
    if (summary.modId === "phoenix_blaze") {
      turretDamageWhileActive *= scale.strength;
    } else if (summary.modId === "battle_stations") {
      turretDamageWhileActive *= scale.duration;
    }
  }

  return {
    modId: summary.modId,
    name: summary.name,
    category: summary.category,
    description: summary.description,
    rank: summary.rank,
    energyCost,
    cooldownSec,
    turretDamageWhileActive,
    isSimulatedActive: isActive,
  };
}

function applyConditionalIntegratedMod(
  modId: string,
  rank: number,
  allMods: Map<string, Mod>,
  simulation: RailjackSimulationInput | undefined,
  acc: RailjackModAccumulators,
  panel: { modBonuses?: Record<string, number> },
): void {
  const mod = allMods.get(modId);
  if (!mod?.stats) return;

  if (modId === "crimson_fugue") {
    const stacks = Math.min(5, Math.max(0, simulation?.crimsonFugueStacks ?? 0));
    if (stacks === 0) return;
    const perStack = modStatFraction(mod.stats.damage ?? 0, rank);
    const totalBonus = perStack * stacks;
    acc.turretDamageBonus += totalBonus;
    panel.modBonuses = { ...panel.modBonuses, crimson_fugue: totalBonus };
    return;
  }

  if (modId === "cruising_speed") {
    if (!simulation?.cruisingSpeedActive) return;
    for (const [statKey, perRank] of Object.entries(mod.stats)) {
      if (statKey === "range") continue;
      applyVerifiedModStatToRailjack(panel, modId, statKey, modStatFraction(perRank, rank), acc);
    }
    return;
  }

  if (modId === "protective_shots") {
    if (!simulation?.protectiveShotsActive) return;
    for (const [statKey, perRank] of Object.entries(mod.stats)) {
      applyVerifiedModStatToRailjack(panel, modId, statKey, modStatFraction(perRank, rank), acc);
    }
  }
}

function applyIntegratedMods(
  equippedMods: EquippedMod[] | undefined,
  allMods: Map<string, Mod>,
  simulation: RailjackSimulationInput | undefined,
): { acc: RailjackModAccumulators; panel: { modBonuses?: Record<string, number> } } {
  const acc = {
    hullBonus: 0,
    armorBonus: 0,
    shieldBonus: 0,
    shieldRechargeBonus: 0,
    speedBonus: 0,
    boostSpeedBonus: 0,
    boostCostReduction: 0,
    fluxBonus: 0,
    avionicsBonus: 0,
    turretDamageBonus: 0,
    turretCritBonus: 0,
    turretCritDmgBonus: 0,
    ordnanceDamageBonus: 0,
    artilleryDamageBonus: 0,
    turretRangeBonus: 0,
    turretProjectileSpeedBonus: 0,
    ordnanceSpeedBonus: 0,
    munitionsCapacityBonus: 0,
  } satisfies RailjackModAccumulators;

  const panel: { modBonuses?: Record<string, number> } = {};

  for (const em of equippedMods ?? []) {
    const mod = allMods.get(em.modId);
    if (!mod?.stats) continue;

    const rank = Math.min(Math.max(em.rank ?? 0, 0), mod.maxRank);

    if (CONDITIONAL_INTEGRATED_MODS.has(em.modId)) {
      applyConditionalIntegratedMod(em.modId, rank, allMods, simulation, acc, panel);
      continue;
    }

    for (const [statKey, perRank] of Object.entries(mod.stats)) {
      const modValue = modStatFraction(perRank, rank);
      applyVerifiedModStatToRailjack(panel, mod.id, statKey, modValue, acc);
    }
  }

  return { acc, panel };
}

function abilityTurretDamageBonus(
  battleAbilities: RailjackAbilityComputed[],
  tacticalAbilities: RailjackAbilityComputed[],
): number {
  let bonus = 0;
  for (const ability of [...battleAbilities, ...tacticalAbilities]) {
    if (ability.isSimulatedActive && ability.turretDamageWhileActive) {
      bonus += ability.turretDamageWhileActive;
    }
  }
  return bonus;
}

export function computeRailjackArmamentStats(
  armament: RailjackArmament,
  bonuses: Pick<
    RailjackModAccumulators,
    "turretDamageBonus" | "turretCritBonus" | "turretCritDmgBonus" | "ordnanceDamageBonus"
  >,
  extraTurretDamageBonus = 0,
): RailjackArmamentComputed {
  const isTurret = armament.type === "turret";
  const damageMult =
    1 + (isTurret ? bonuses.turretDamageBonus + extraTurretDamageBonus : bonuses.ordnanceDamageBonus);
  const damage = Math.round(armament.damage * damageMult);
  const critChance = Math.min(
    1,
    armament.critChance + (isTurret ? bonuses.turretCritBonus : 0),
  );
  const critMultiplier = armament.critMultiplier * (1 + (isTurret ? bonuses.turretCritDmgBonus : 0));
  const avgHitMult = 1 + critChance * (critMultiplier - 1);
  const estimatedDps = Math.round(damage * avgHitMult * armament.fireRate);

  return {
    id: armament.id,
    name: armament.name,
    type: armament.type,
    damage,
    critChance,
    critMultiplier,
    statusChance: armament.statusChance,
    fireRate: armament.fireRate,
    estimatedDps,
  };
}

export function calculateRailjackBuild(
  input: RailjackBuildInput,
  allMods: Map<string, Mod> = getEffectiveModsMap(),
): RailjackCalculatedStats {
  const base = { ...railjackBaseStats };
  let avionicsCapacity = 0;
  let shieldRecharge = 0;

  const reactor = input.reactorId ? findRailjackComponent(input.reactorId) : undefined;
  const shield = input.shieldId ? findRailjackComponent(input.shieldId) : undefined;
  const engine = input.engineId ? findRailjackComponent(input.engineId) : undefined;
  const plating = input.platingId ? findRailjackComponent(input.platingId) : undefined;
  const eliteCrew = input.eliteCrewId ? findRailjackEliteCrew(input.eliteCrewId) : undefined;
  const crewBonuses = eliteCrew ? crewBonusesFromCompetency(eliteCrew.competency) : undefined;

  if (plating) {
    base.hull += plating.stats.hullBonus ?? 0;
    base.armor += plating.stats.armorBonus ?? 0;
  }
  if (shield) {
    base.shield += shield.stats.shieldCapacity ?? 0;
    shieldRecharge += shield.stats.shieldRecharge ?? 0;
  }
  if (engine) {
    base.speed += engine.stats.speed ?? 0;
    base.boostSpeed += engine.stats.boostSpeed ?? 0;
    base.boostCost = Math.max(0, base.boostCost - (engine.stats.boostCostReduction ?? 0));
  }
  if (reactor) {
    base.fluxCapacity += reactor.stats.fluxCapacity ?? 0;
    avionicsCapacity += reactor.stats.avionicsCapacity ?? 0;
  }

  const { acc, panel } = applyIntegratedMods(input.integratedMods, allMods, input.simulation);

  if (crewBonuses) {
    acc.turretDamageBonus += crewBonuses.turretDamageBonus;
    acc.speedBonus += crewBonuses.speedBonus;
    acc.hullBonus += crewBonuses.hullBonus;
  }

  const battleSummaries = summarizeEquippedAbilities(input.battleMods ?? [], "battle");
  const tacticalSummaries = summarizeEquippedAbilities(input.tacticalMods ?? [], "tactical");
  const battleAbilities = battleSummaries.map((s) => scaleAbilitySummary(s, reactor, input.simulation));
  const tacticalAbilities = tacticalSummaries.map((s) => scaleAbilitySummary(s, reactor, input.simulation));
  const extraTurretDamageBonus = abilityTurretDamageBonus(battleAbilities, tacticalAbilities);

  const hull = Math.round(base.hull * (1 + acc.hullBonus));
  const armor = Math.round(base.armor * (1 + acc.armorBonus));
  const shieldCap = Math.round(base.shield * (1 + acc.shieldBonus));
  const shieldRechargeRate = Math.round(shieldRecharge * (1 + acc.shieldRechargeBonus));
  const speed = Math.round(base.speed * (1 + acc.speedBonus));
  const boostSpeed = Math.round(base.boostSpeed * (1 + acc.boostSpeedBonus));
  const boostCost = Math.max(0, Math.round(base.boostCost * (1 - acc.boostCostReduction)));
  const fluxCapacity = Math.round(base.fluxCapacity * (1 + acc.fluxBonus));
  const avionics = Math.round(avionicsCapacity * (1 + acc.avionicsBonus));

  const turretIds = resolveTurretIds(input);
  const turrets = turretIds
    .map((id) => (id ? findRailjackArmament(id) : undefined))
    .filter((t): t is RailjackArmament => !!t && t.type === "turret")
    .map((t) => computeRailjackArmamentStats(t, acc, extraTurretDamageBonus));

  const ordnanceRaw = input.ordnanceId ? findRailjackArmament(input.ordnanceId) : undefined;
  const ordnance =
    ordnanceRaw && ordnanceRaw.type === "ordnance"
      ? computeRailjackArmamentStats(ordnanceRaw, acc)
      : null;

  return {
    baseHull: railjackBaseStats.hull,
    baseArmor: railjackBaseStats.armor,
    baseShield: railjackBaseStats.shield,
    baseSpeed: railjackBaseStats.speed,
    baseBoostSpeed: railjackBaseStats.boostSpeed,
    baseBoostCost: railjackBaseStats.boostCost,
    baseFluxCapacity: railjackBaseStats.fluxCapacity,
    baseAvionicsCapacity: 0,
    baseShieldRecharge: 0,
    hull,
    armor,
    shield: shieldCap,
    shieldRecharge: shieldRechargeRate,
    speed,
    boostSpeed,
    boostCost,
    fluxCapacity,
    avionicsCapacity: avionics,
    turretDamageBonus: acc.turretDamageBonus,
    turretCritBonus: acc.turretCritBonus,
    turretCritDmgBonus: acc.turretCritDmgBonus,
    ordnanceDamageBonus: acc.ordnanceDamageBonus,
    artilleryDamageBonus: acc.artilleryDamageBonus,
    turretRangeBonus: acc.turretRangeBonus,
    turretProjectileSpeedBonus: acc.turretProjectileSpeedBonus,
    ordnanceSpeedBonus: acc.ordnanceSpeedBonus,
    munitionsCapacityBonus: acc.munitionsCapacityBonus,
    turrets,
    ordnance,
    modBonuses: panel.modBonuses,
    abilityStrengthBonus: reactor?.stats.abilityStrength,
    abilityRangeBonus: reactor?.stats.abilityRange,
    abilityDurationBonus: reactor?.stats.abilityDuration,
    crewBonuses,
    battleAbilities,
    tacticalAbilities,
    abilityTurretDamageBonus: extraTurretDamageBonus,
  };
}

/** Returns true when the build has mods that use simulation toggles. */
export function railjackBuildNeedsSimulation(input: RailjackBuildInput): boolean {
  const integratedIds = new Set((input.integratedMods ?? []).map((m) => m.modId));
  const hasConditionalIntegrated = [...CONDITIONAL_INTEGRATED_MODS].some((id) => integratedIds.has(id));
  const hasAbilityBoost =
    (input.battleMods ?? []).some((m) => RAILJACK_PLEXUS_ABILITIES[m.modId]?.turretDamageWhileActive) ||
    (input.tacticalMods ?? []).some((m) => RAILJACK_PLEXUS_ABILITIES[m.modId]?.turretDamageWhileActive);
  return hasConditionalIntegrated || hasAbilityBoost;
}
