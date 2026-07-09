import { describe, expect, it } from "vitest";
import { calculateWeaponBuild } from "@/lib/calculator";
import { resolveWeaponExternalBuffs } from "@/lib/weapon-external-buffs";
import type { Ability, SimulationParams, WarframeCalculatedStats, Weapon } from "@/lib/types";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const testRifle: Weapon = {
  id: "test_rifle",
  name: "Test Rifle",
  category: "rifle",
  damage: 100,
  impact: 100,
  puncture: 0,
  slash: 0,
  fireRate: 1,
  criticalChance: 0,
  criticalMultiplier: 1.5,
  statusChance: 0,
  magazine: 30,
  reloadTime: 2,
  multishot: 1,
  triggerType: "Auto",
  modSlots: 8,
  hasPrimaryArcaneSlot: true,
  hasSecondaryArcaneSlot: false,
  isIncarnon: false,
  hasRivenSlot: true,
};

const roarAbility: Ability = {
  name: "Roar",
  energyCost: 75,
  description: "Damage buff",
  damageBuff: 0.5,
};

const wfStats: WarframeCalculatedStats = {
  baseHealth: 100,
  baseShield: 100,
  baseArmor: 100,
  baseEnergy: 100,
  baseSprint: 1,
  healthBonus: 0,
  shieldBonus: 0,
  armorBonus: 0,
  energyBonus: 0,
  sprintSpeedBonus: 0,
  flowBonus: 0,
  flatHealthBonus: 0,
  flatShieldBonus: 0,
  flatArmorBonus: 0,
  flatEnergyBonus: 0,
  abilityStrength: 1.3,
  abilityDuration: 1,
  abilityEfficiency: 1,
  abilityRange: 1,
  totalHealth: 100,
  totalShield: 100,
  totalArmor: 100,
  totalEnergy: 100,
  totalSprint: 1,
  effectiveHealth: 100,
  damageReduction: 0,
  castingSpeedBonus: 0,
  parkourVelocityBonus: 0,
  healthRegenPerSec: 0,
  elementalResistance: 0,
  primaryShardBonus: 0,
  secondaryShardBonus: 0,
  meleeCritDamageBonus: 0,
  healingBonus: 0,
  statusDurationBonus: 0,
  energyCostReduction: 0,
};

describe("resolveWeaponExternalBuffs", () => {
  it("scales Roar with ability strength", () => {
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Roar"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "rhino",
      warframeStats: wfStats,
      warframeAbilities: [roarAbility],
    }, sim);

    expect(buffs).toHaveLength(1);
    expect(buffs[0].label).toBe("Roar");
    expect(buffs[0].damageBonus).toBeCloseTo(0.65, 5);
  });

  it("increases weapon DPS when applied via calc options", () => {
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Roar"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "rhino",
      warframeStats: wfStats,
      warframeAbilities: [roarAbility],
    }, sim);

    const base = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim);
    const withRoar = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim, { externalBuffs: buffs });

    expect(withRoar.burstDps).toBeGreaterThan(base.burstDps * 1.6);
  });
});
