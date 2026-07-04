import { ArcaneEffectDef } from "@/data/arcane-effects";
import { getPersistenceDamageCap, scaleArcaneEffectValue } from "@/lib/arcane-utils";
import { CalculatedStats, WarframeCalculatedStats, Weapon } from "@/lib/types";

export interface ArcaneHandlerContext {
  def: ArcaneEffectDef;
  arcaneId: string;
  rank: number;
  stacks: number;
  baseWeapon?: Weapon;
  warframeCtx?: WarframeArcaneContext;
}

function trackBonus(stats: { arcaneBonuses?: Record<string, number> }, stat: string, value: number): void {
  if (!stats.arcaneBonuses) stats.arcaneBonuses = {};
  stats.arcaneBonuses[stat] = (stats.arcaneBonuses[stat] ?? 0) + value;
}

function applyWeaponDamageMult(stats: CalculatedStats, pct: number): void {
  const scaled = pct / 100;
  stats.totalDamage *= 1 + scaled;
  stats.impact *= 1 + scaled;
  stats.puncture *= 1 + scaled;
  stats.slash *= 1 + scaled;
  for (const e of stats.elements) e.value *= 1 + scaled;
  for (const e of stats.rawElements) e.value *= 1 + scaled;
}

/** Per-arcane handlers — each models that arcane's actual in-game behavior. */
export function applyCustomArcaneToWeapon(stats: CalculatedStats, ctx: ArcaneHandlerContext): boolean {
  const { arcaneId, def, rank, stacks, baseWeapon } = ctx;
  if (stacks <= 0) return true;

  switch (arcaneId) {
    case "arcane_primary_merciless":
    case "arcane_secondary_merciless": {
      // +damage and +reload per stack, capped at stackCap.
      const dmg = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "damage")?.maxValue ?? 30,
        rank,
        def.maxRank,
      );
      const reload = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "reloadSpeed")?.maxValue ?? 30,
        rank,
        def.maxRank,
      );
      applyWeaponDamageMult(stats, dmg * stacks);
      if (reload > 0) stats.reloadTime /= 1 + (reload * stacks) / 100;
      trackBonus(stats, "mercilessStacks", stacks);
      return true;
    }
    case "primary_overcharge": {
      const ms = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "multishot")?.maxValue ?? 350,
        rank,
        def.maxRank,
      );
      stats.multishot += ms / 100;
      return true;
    }
    case "melee_exposure": {
      const bonus = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "meleeDamageBonus")?.maxValue ?? 240,
        rank,
        def.maxRank,
      );
      // Melee-only damage vs status-affected; tracked separately, not primary weapon DPS.
      trackBonus(stats, "meleeDamageBonus", bonus * stacks);
      return true;
    }
    case "cascadia_flare": {
      const dmg = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "damage")?.maxValue ?? 480,
        rank,
        def.maxRank,
      );
      applyWeaponDamageMult(stats, dmg * stacks);
      trackBonus(stats, "cascadiaFlareStacks", stacks);
      return true;
    }
    case "secondary_surge": {
      // Scales with current energy — cannot know without loadout link; display only.
      const pct = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "damagePerEnergy")?.maxValue ?? 800,
        rank,
        def.maxRank,
      );
      trackBonus(stats, "damagePerEnergy", pct);
      return true;
    }
    case "zid_an_uskos": {
      const heat = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "secondaryHeatDamage")?.maxValue ?? 2.4,
        rank,
        def.maxRank,
      );
      trackBonus(stats, "secondaryHeatDamage", heat * stacks);
      return true;
    }
    default:
      return false;
  }
}

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
      const perArmor = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "energyPerArmor")?.maxValue ?? 0.3,
        rank,
        def.maxRank,
      );
      stats.flatEnergyBonus += perArmor * wfCtx.totalArmor;
      trackBonus(stats, "energyPerArmor", perArmor);
      return true;
    }
    case "arcane_bellicose": {
      const perStep = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "abilityStrengthPerHealth")?.maxValue ?? 6,
        rank,
        def.maxRank,
      );
      const step =
        def.effects.find((e) => e.stat === "abilityStrengthPerHealthStep")?.maxValue ?? 250;
      const steps = step > 0 ? Math.floor(wfCtx.totalHealth / step) : 0;
      stats.abilityStrength += (steps * perStep) / 100;
      trackBonus(stats, "abilityStrengthPerHealth", steps * perStep);
      return true;
    }
    case "arcane_expertise": {
      const ratio = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "abilityStrengthToShield")?.maxValue ?? 100,
        rank,
        def.maxRank,
      );
      stats.abilityStrength += (wfCtx.totalShield * ratio) / 100 / 100;
      trackBonus(stats, "abilityStrengthToShield", ratio);
      return true;
    }
    case "arcane_energize": {
      // On orb pickup burst — does not increase max energy pool.
      const energy = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "energyOrbBonus")?.maxValue ?? 150,
        rank,
        def.maxRank,
      );
      const ally = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "allyEnergy")?.maxValue ?? 30,
        rank,
        def.maxRank,
      );
      trackBonus(stats, "energyOrbBonus", energy);
      trackBonus(stats, "allyEnergy", ally);
      return true;
    }
    case "exodia_brave": {
      const regen = scaleArcaneEffectValue(
        def.effects.find((e) => e.stat === "energyRegen")?.maxValue ?? 5,
        rank,
        def.maxRank,
      );
      trackBonus(stats, "energyRegen", regen * stacks);
      return true;
    }
    default:
      return false;
  }
}
