import { describe, expect, it } from "vitest";
import { calculateWeaponBuild } from "@/lib/calc/calculator";
import { computeDpsContributions } from "@/lib/calc/dps-contributions";
import { resolveWeaponExternalBuffs } from "@/lib/weapon-external-buffs";
import { allMods } from "@/data/mods";
import type { Ability, ModSlot, SimulationParams, WarframeCalculatedStats, Weapon } from "@/lib/types";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

const modsMap = new Map(allMods.map((m) => [m.id, m]));

const testRifle: Weapon = {
  id: "test_rifle",
  name: "Test Rifle",
  category: "rifle",
  damage: 100,
  impact: 100,
  puncture: 0,
  slash: 0,
  fireRate: 1,
  criticalChance: 0.25,
  criticalMultiplier: 2,
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

const testMelee: Weapon = {
  ...testRifle,
  id: "test_melee",
  name: "Test Melee",
  category: "melee",
  triggerType: "Melee",
  fireRate: 1.2,
  hasPrimaryArcaneSlot: false,
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
  slideSpeedBonus: 0,
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
    // Multiplicative with Serration (not additive base-damage pool)
    expect(buffs[0].damageMultBonus).toBeCloseTo(0.65, 5);
    expect(buffs[0].damageBonus).toBeUndefined();
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

    // 130% strength Roar = +65% → ×1.65
    expect(withRoar.burstDps).toBeCloseTo(base.burstDps * 1.65, 5);
  });

  it("multiplies Roar with Serration instead of adding", () => {
    const serration = allMods.find((m) => m.id === "serration" || m.id === "serration_r3");
    if (!serration) return;
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Roar"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "rhino",
      warframeStats: wfStats,
      warframeAbilities: [roarAbility],
    }, sim);
    const slots = [{ modId: serration.id, rank: serration.maxRank, slotIndex: 0 }];
    const withBoth = calculateWeaponBuild(testRifle, slots, modsMap, undefined, sim, { externalBuffs: buffs });
    const serBonus = (serration.stats.damage * (serration.maxRank + 1)) / 100;
    // base × (1+Serration) × (1+Roar) — not × (1+Serration+Roar)
    const expected = testRifle.damage * (1 + serBonus) * 1.65;
    expect(withBoth.totalDamage).toBeCloseTo(expected, 5);
  });

  it("applies Voltaic Strike from warframe mod bar as external elemental", () => {
    const sim = DEFAULT_SIM_PARAMS;
    const wfMods: ModSlot[] = [{ modId: "voltaic_strike", rank: 3, slotIndex: 0 }];
    const buffs = resolveWeaponExternalBuffs(testMelee, {
      warframeModSlots: wfMods,
      allMods: modsMap,
    }, sim);

    const voltaic = buffs.find((b) => b.id === "wf-mod:voltaic_strike");
    expect(voltaic).toBeDefined();
    expect(voltaic!.elemental?.some((e) => e.type === "electricity" && e.bonusFraction > 0.5)).toBe(true);

    const shocking = modsMap.get("shocking_touch_r3")!;
    const modSlots: ModSlot[] = [
      { modId: shocking.id, rank: 10, slotIndex: 0 },
    ];
    const withExternal = calculateWeaponBuild(
      testMelee,
      modSlots,
      modsMap,
      undefined,
      sim,
      { externalBuffs: buffs },
    );
    const withModOnly = calculateWeaponBuild(testMelee, modSlots, modsMap, undefined, sim);
    const withBothManual = calculateWeaponBuild(
      testMelee,
      [...modSlots, { modId: "voltaic_strike", rank: 3, slotIndex: 1 }],
      modsMap,
      undefined,
      sim,
    );

    expect(withExternal.burstDps).toBeCloseTo(withBothManual.burstDps, 0);
    expect(withExternal.burstDps).toBeGreaterThan(withModOnly.burstDps);
  });

  it("applies Tenacious Bond crit mult when companion crit exceeds 50%", () => {
    const sim: SimulationParams = { ...DEFAULT_SIM_PARAMS, applyTenaciousBondCrit: true };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      companionModSlots: [{ modId: "tenacious_bond", rank: 5, slotIndex: 0 }],
      companionWeaponCritChance: 0.6,
      allMods: modsMap,
    }, sim);

    const tenacious = buffs.find((b) => b.id === "companion:tenacious_bond");
    expect(tenacious?.critMultFlatBonus).toBe(1.2);

    const critMod = modsMap.get("point_strike_r3")!;
    const modSlots: ModSlot[] = [{ modId: critMod.id, rank: 5, slotIndex: 0 }];
    const withBond = calculateWeaponBuild(testRifle, modSlots, modsMap, undefined, sim, { externalBuffs: buffs });
    const withoutBond = calculateWeaponBuild(testRifle, modSlots, modsMap, undefined, sim);

    expect(withBond.burstDps).toBeGreaterThan(withoutBond.burstDps * 1.05);
  });

  it("skips Tenacious Bond when companion crit is below 50%", () => {
    const sim: SimulationParams = { ...DEFAULT_SIM_PARAMS, applyTenaciousBondCrit: true };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      companionModSlots: [{ modId: "tenacious_bond", rank: 5, slotIndex: 0 }],
      companionWeaponCritChance: 0.3,
      allMods: modsMap,
    }, sim);

    expect(buffs.find((b) => b.id === "companion:tenacious_bond")).toBeUndefined();
  });
});

describe("computeDpsContributions with external sources", () => {
  it("shows lower marginal efficiency for duplicate electricity when Voltaic Strike is external", () => {
    const sim = DEFAULT_SIM_PARAMS;
    const wfMods: ModSlot[] = [{ modId: "voltaic_strike", rank: 3, slotIndex: 0 }];
    const buffs = resolveWeaponExternalBuffs(testMelee, { warframeModSlots: wfMods, allMods: modsMap }, sim);
    const shocking = modsMap.get("shocking_touch_r3")!;
    const modSlots: ModSlot[] = [{ modId: shocking.id, rank: 10, slotIndex: 0 }];

    const contributions = computeDpsContributions({
      baseWeapon: testMelee,
      modSlots,
      allMods: modsMap,
      simParams: sim,
      calcOptions: { externalBuffs: buffs },
    });

    const shockingContrib = contributions.find((c) => c.label === shocking.name);
    const voltaicContrib = contributions.find((c) => c.id === "wf-mod:voltaic_strike");

    expect(voltaicContrib).toBeDefined();
    expect(shockingContrib).toBeDefined();
    expect(shockingContrib!.burstMarginalPct).toBeGreaterThan(0);
    expect(voltaicContrib!.burstMarginalPct).toBeGreaterThan(0);

    // Diminishing returns: Shocking Touch is worth less with Voltaic already present than alone.
    const shockingAlone = computeDpsContributions({
      baseWeapon: testMelee,
      modSlots,
      allMods: modsMap,
      simParams: sim,
    }).find((c) => c.label === shocking.name);
    expect(shockingAlone).toBeDefined();
    expect(shockingContrib!.burstMarginalPct).toBeLessThan(shockingAlone!.burstMarginalPct);
  });

  it("shows crit chance mod gains more marginal value with Tenacious Bond active", () => {
    const sim: SimulationParams = { ...DEFAULT_SIM_PARAMS, applyTenaciousBondCrit: true };
    const critMod = modsMap.get("point_strike_r3")!;
    const modSlots: ModSlot[] = [{ modId: critMod.id, rank: 5, slotIndex: 0 }];

    const withoutBond = computeDpsContributions({
      baseWeapon: testRifle,
      modSlots,
      allMods: modsMap,
      simParams: sim,
    });
    const bondBuffs = resolveWeaponExternalBuffs(testRifle, {
      companionModSlots: [{ modId: "tenacious_bond", rank: 5, slotIndex: 0 }],
      companionWeaponCritChance: 0.6,
      allMods: modsMap,
    }, sim);
    const withBond = computeDpsContributions({
      baseWeapon: testRifle,
      modSlots,
      allMods: modsMap,
      simParams: sim,
      calcOptions: { externalBuffs: bondBuffs },
    });

    const critWithout = withoutBond.find((c) => c.label === critMod.name)!.burstMarginalPct;
    const critWith = withBond.find((c) => c.label === critMod.name)!.burstMarginalPct;

    expect(critWith).toBeGreaterThan(critWithout);
  });
});
