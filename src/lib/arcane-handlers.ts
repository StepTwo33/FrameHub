import { ArcaneEffectDef, ArcaneEffectLine } from "@/data/arcane-effects";
import { getPersistenceDamageCap, scaleArcaneEffectLine } from "@/lib/arcane-utils";
import { estimateEnervateCritStacks, getArcaneProcUptime } from "@/lib/arcane-proc-model";
import { CalculatedStats, WarframeCalculatedStats, Weapon } from "@/lib/types";

export interface WarframeArcaneContext {
  totalHealth: number;
  totalShield: number;
  totalArmor: number;
}

export interface ArcaneHandlerContext {
  def: ArcaneEffectDef;
  arcaneId: string;
  rank: number;
  stacks: number;
  simStacks?: number;
  baseWeapon?: Weapon;
  warframeCtx?: WarframeArcaneContext;
}

function trackBonus(stats: { arcaneBonuses?: Record<string, number> }, stat: string, value: number): void {
  if (!stats.arcaneBonuses) stats.arcaneBonuses = {};
  stats.arcaneBonuses[stat] = (stats.arcaneBonuses[stat] ?? 0) + value;
}

function scaledLine(def: ArcaneEffectDef, line: ArcaneEffectLine | undefined, rank: number, stacks: number): number {
  if (!line) return 0;
  const rankScaled = scaleArcaneEffectLine(line, rank, def.maxRank);
  const stackMult = def.trigger === "stacks" || line.stacking ? Math.max(stacks, 1) : 1;
  return rankScaled * stackMult;
}

function findEffect(def: ArcaneEffectDef, stat: string): ArcaneEffectLine | undefined {
  return (def.effects ?? []).find((e) => e.stat === stat);
}

function applyWeaponDamageMult(stats: CalculatedStats, pct: number): void {
  const scaled = pct / 100;
  stats.totalDamage *= 1 + scaled;
  stats.impact *= 1 + scaled;
  stats.puncture *= 1 + scaled;
  stats.slash *= 1 + scaled;
  for (const e of stats.elements ?? []) e.value *= 1 + scaled;
  for (const e of stats.rawElements ?? []) e.value *= 1 + scaled;
}

/** Arcane IDs handled by applyCustomArcaneToWeapon (for coverage detection without full stats). */
export const WEAPON_CUSTOM_ARCANE_IDS = new Set([
  "arcane_primary_merciless",
  "arcane_secondary_merciless",
  "arcane_primary_deadhead",
  "arcane_secondary_deadhead",
  "arcane_primary_dexterity",
  "arcane_secondary_dexterity",
  "primary_overcharge",
  "melee_exposure",
  "secondary_enervate",
  "secondary_outburst",
  "cascadia_flare",
  "secondary_surge",
  "zid_an_uskos",
  "primary_plated_round",
  "exodia_brave",
  "exodia_force",
  "exodia_hunt",
  "exodia_might",
  "exodia_contagion",
  "exodia_epidemic",
  "exodia_triumph",
  "exodia_valor",
]);

/** Arcane IDs handled by applyCustomArcaneToWarframe (for coverage detection without full stats). */
export const WARFRAME_CUSTOM_ARCANE_IDS = new Set([
  "arcane_persistence",
  "arcane_battery",
  "arcane_bellicose",
  "arcane_expertise",
  "arcane_energize",
  "arcane_crepuscular",
  "arcane_eruption",
  "arcane_escapist",
  "arcane_steadfast",
  "arcane_truculence",
  "emergence_dissipate",
  "emergence_savior",
  "magus_destruct",
  "magus_glitch",
  "magus_repair",
  "magus_revert",
  "magus_cadence",
  "magus_cloud",
  "molt_reconstruct",
  "theorem_contagion",
  "theorem_infection",
  "zid_an_asheir",
  "zid_an_sek_eel",
  "melee_vortex",
  "primary_debilitate",
  "primary_obstruct",
]);

/** Stacking damage (+ optional reload) — Merciless, Deadhead, Dexterity, Cascadia Flare. */
function applyStackingDamageHandler(
  stats: CalculatedStats,
  ctx: ArcaneHandlerContext,
  opts?: { reload?: boolean; bonusKey?: string },
): void {
  const { def, rank, stacks } = ctx;
  const dmg = scaledLine(def, findEffect(def, "damage"), rank, stacks);
  if (dmg > 0) applyWeaponDamageMult(stats, dmg);
  if (opts?.reload) {
    const reload = scaledLine(def, findEffect(def, "reloadSpeed"), rank, stacks);
    if (reload > 0) stats.reloadTime /= 1 + reload / 100;
  }
  trackBonus(stats, opts?.bonusKey ?? "stackingDamageStacks", stacks);
  for (const line of def.effects ?? []) {
    if (line.stat === "damage" || line.stat === "reloadSpeed") continue;
    trackBonus(stats, line.stat, scaledLine(def, line, rank, stacks));
  }
}

function trackAllEffects(
  stats: { arcaneBonuses?: Record<string, number> },
  def: ArcaneEffectDef,
  rank: number,
  stacks: number,
): void {
  for (const line of def.effects ?? []) {
    trackBonus(stats, line.stat, scaledLine(def, line, rank, stacks));
  }
}

/** Per-arcane weapon handlers — Zaw/Exodia, primary, secondary, melee. */
export function applyCustomArcaneToWeapon(stats: CalculatedStats, ctx: ArcaneHandlerContext): boolean {
  const { arcaneId, def, rank, stacks } = ctx;
  if (stacks <= 0) return true;

  switch (arcaneId) {
    case "arcane_primary_merciless":
    case "arcane_secondary_merciless":
      applyStackingDamageHandler(stats, ctx, { reload: true, bonusKey: "mercilessStacks" });
      return true;

    case "arcane_primary_deadhead":
    case "arcane_secondary_deadhead":
      applyStackingDamageHandler(stats, ctx, { bonusKey: "deadheadStacks" });
      return true;

    case "arcane_primary_dexterity":
    case "arcane_secondary_dexterity":
      applyStackingDamageHandler(stats, ctx, { bonusKey: "dexterityStacks" });
      return true;

    case "primary_overcharge": {
      const ms = scaledLine(def, findEffect(def, "multishot"), rank, stacks);
      stats.multishot += ms / 100;
      trackBonus(stats, "multishot", ms);
      return true;
    }

    case "melee_exposure": {
      const bonus = scaledLine(def, findEffect(def, "meleeDamageBonus"), rank, stacks);
      if (bonus > 0) applyWeaponDamageMult(stats, bonus);
      trackBonus(stats, "meleeDamageBonus", bonus);
      const corrosive = scaledLine(def, findEffect(def, "corrosiveDamage"), rank, stacks);
      if (corrosive > 0) trackBonus(stats, "corrosiveDamage", corrosive);
      return true;
    }

    case "secondary_enervate": {
      const { def, rank, stacks, baseWeapon, simStacks = stacks } = ctx;
      const perHit = scaledLine(def, findEffect(def, "criticalChance"), rank, stacks);
      const threshold = findEffect(def, "bigCritThreshold")?.maxValue ?? 6;
      const baseCrit = baseWeapon?.criticalChance ?? stats.criticalChance;
      const hitStacks = estimateEnervateCritStacks(stats.criticalChance, perHit, threshold, simStacks);
      const bonus = baseCrit * (perHit / 100) * hitStacks;
      stats.criticalChance += bonus;
      trackBonus(stats, "criticalChance", perHit * hitStacks);
      trackBonus(stats, "bigCritThreshold", threshold);
      trackBonus(stats, "enervateStacks", hitStacks);
      return true;
    }

    case "secondary_outburst": {
      const { def, rank, stacks, baseWeapon } = ctx;
      const baseCritMult = baseWeapon?.criticalMultiplier ?? stats.criticalMultiplier;
      const multBonus = scaledLine(def, findEffect(def, "criticalMultiplier"), rank, stacks);
      const uptime = getArcaneProcUptime(def, rank, ctx.simStacks ?? stacks, stats.fireRate);
      const applied = baseCritMult * (multBonus / 100) * stacks * uptime;
      stats.criticalMultiplier += applied;
      trackBonus(stats, "criticalMultiplier", multBonus * stacks);
      return true;
    }

    case "cascadia_flare":
      applyStackingDamageHandler(stats, ctx, { bonusKey: "cascadiaFlareStacks" });
      return true;

    case "secondary_surge": {
      trackBonus(stats, "damagePerEnergy", scaledLine(def, findEffect(def, "damagePerEnergy"), rank, stacks));
      return true;
    }

    case "zid_an_uskos": {
      trackBonus(stats, "secondaryHeatDamage", scaledLine(def, findEffect(def, "secondaryHeatDamage"), rank, stacks));
      return true;
    }

    case "primary_plated_round": {
      trackBonus(stats, "reloadDamageRamp", scaledLine(def, findEffect(def, "reloadDamageRamp"), rank, stacks));
      return true;
    }

    case "exodia_brave": {
      trackBonus(stats, "energyRegen", scaledLine(def, findEffect(def, "energyRegen"), rank, stacks));
      trackBonus(stats, "exodiaBraveStacks", stacks);
      return true;
    }

    case "exodia_force":
    case "exodia_hunt":
    case "exodia_might":
    case "exodia_contagion":
    case "exodia_epidemic":
    case "exodia_triumph":
    case "exodia_valor":
      trackAllEffects(stats, def, rank, stacks);
      return true;

    default:
      return false;
  }
}

/** Per-arcane warframe handlers. */
export function applyCustomArcaneToWarframe(
  stats: WarframeCalculatedStats,
  ctx: ArcaneHandlerContext,
): boolean {
  const { arcaneId, def, rank, stacks } = ctx;
  const wfCtx = ctx.warframeCtx ?? {
    totalHealth: stats.totalHealth,
    totalShield: stats.totalShield,
    totalArmor: stats.totalArmor,
  };

  switch (arcaneId) {
    case "arcane_persistence": {
      stats.persistenceDamageCapPerSecond = getPersistenceDamageCap(rank, def.maxRank);
      stats.shieldsNullifiedByPersistence = true;
      return true;
    }

    case "arcane_battery": {
      const perArmor = scaledLine(def, findEffect(def, "energyPerArmor"), rank, stacks);
      stats.flatEnergyBonus += perArmor * wfCtx.totalArmor;
      trackBonus(stats, "energyPerArmor", perArmor);
      return true;
    }

    case "arcane_bellicose": {
      const perStep = scaledLine(def, findEffect(def, "abilityStrengthPerHealth"), rank, stacks);
      const step = findEffect(def, "abilityStrengthPerHealthStep")?.maxValue ?? 250;
      const steps = step > 0 ? Math.floor(wfCtx.totalHealth / step) : 0;
      stats.abilityStrength += (steps * perStep) / 100;
      trackBonus(stats, "abilityStrengthPerHealth", steps * perStep);
      return true;
    }

    case "arcane_expertise": {
      const ratio = scaledLine(def, findEffect(def, "abilityStrengthToShield"), rank, stacks);
      stats.abilityStrength += (wfCtx.totalShield * ratio) / 100 / 100;
      trackBonus(stats, "abilityStrengthToShield", ratio);
      return true;
    }

    case "arcane_energize": {
      trackBonus(stats, "energyPickupChance", scaledLine(def, findEffect(def, "energyPickupChance"), rank, stacks));
      trackBonus(stats, "energyOrbBonus", scaledLine(def, findEffect(def, "energyOrbBonus"), rank, stacks));
      trackBonus(stats, "allyEnergyRadius", scaledLine(def, findEffect(def, "allyEnergyRadius"), rank, stacks));
      return true;
    }

    case "arcane_crepuscular": {
      // While invisible — tracked for panel; not applied to passive totals without sim toggle.
      trackBonus(stats, "abilityStrength", scaledLine(def, findEffect(def, "abilityStrength"), rank, stacks));
      trackBonus(stats, "criticalMultiplier", scaledLine(def, findEffect(def, "criticalMultiplier"), rank, stacks));
      return true;
    }

    case "arcane_eruption":
    case "arcane_escapist":
    case "arcane_steadfast":
    case "arcane_truculence":
    case "emergence_dissipate":
    case "emergence_savior":
    case "magus_destruct":
    case "magus_glitch":
    case "magus_repair":
    case "magus_revert":
    case "magus_cadence":
    case "magus_cloud":
    case "molt_reconstruct":
    case "theorem_contagion":
    case "theorem_infection":
    case "zid_an_asheir":
    case "zid_an_sek_eel":
    case "melee_vortex":
    case "primary_debilitate":
    case "primary_obstruct":
      trackAllEffects(stats, def, rank, stacks);
      return true;

    default:
      return false;
  }
}
