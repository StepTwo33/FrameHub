import { describe, expect, it } from "vitest";
import { calculateWeaponBuild } from "@/lib/calc/calculator";
import { computeDpsContributions } from "@/lib/calc/dps-contributions";
import {
  resolveWeaponExternalBuffs,
  weaponDamageBuffAbilities,
} from "@/lib/weapons/weapon-external-buffs";
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
  it("applies Parasitic Link as Roar-style multiplicative weapon damage", () => {
    const serration = allMods.find((m) => m.id === "serration" || m.id === "serration_r3");
    if (!serration) return;
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Parasitic Link"],
    };
    // Wiki: 200% STR → +50% weapon damage; multiplicative with Serration.
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "nidus",
      warframeStats: { ...wfStats, abilityStrength: 2 },
      warframeAbilities: [
        { name: "Parasitic Link", energyCost: 25, description: "", damageBuff: 0.25 },
      ],
    }, sim);
    expect(buffs[0]!.damageMultBonus).toBeCloseTo(0.5, 5);
    expect(buffs[0]!.damageBonus).toBeUndefined();

    const slots = [{ modId: serration.id, rank: serration.maxRank, slotIndex: 0 }];
    const withBoth = calculateWeaponBuild(testRifle, slots, modsMap, undefined, sim, {
      externalBuffs: buffs,
    });
    const serBonus = (serration.stats.damage * (serration.maxRank + 1)) / 100;
    expect(withBoth.totalDamage).toBeCloseTo(100 * (1 + serBonus) * 1.5, 5);
  });

  it("uses Helminth Roar 30% base (not Rhino 50%)", () => {
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Roar"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "excalibur",
      warframeStats: wfStats,
      warframeAbilities: [{ name: "Roar", energyCost: 50, description: "", damageBuff: 0.3 }],
    }, sim);
    expect(buffs[0]!.damageMultBonus).toBeCloseTo(0.3 * 1.3, 5);
  });

  it("applies Shooting Gallery additively with Serration (not Roar mult)", () => {
    const serration = allMods.find((m) => m.id === "serration" || m.id === "serration_r3");
    if (!serration) return;
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Shooting Gallery"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "mesa",
      warframeStats: wfStats,
      warframeAbilities: [{ name: "Shooting Gallery", energyCost: 50, description: "", damageBuff: 0.25 }],
    }, sim);
    expect(buffs[0]!.damageBonus).toBeCloseTo(0.25 * 1.3, 5);
    expect(buffs[0]!.damageMultBonus).toBeUndefined();

    const slots = [{ modId: serration.id, rank: serration.maxRank, slotIndex: 0 }];
    const withBoth = calculateWeaponBuild(testRifle, slots, modsMap, undefined, sim, {
      externalBuffs: buffs,
    });
    const serBonus = (serration.stats.damage * (serration.maxRank + 1)) / 100;
    // Wiki: base × (1 + Serration + SG×STR)
    expect(withBoth.totalDamage).toBeCloseTo(100 * (1 + serBonus + 0.25 * 1.3), 5);
  });

  it("applies Symphony of Mercy Deathbringer additively (like Shooting Gallery)", () => {
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Symphony Of Mercy"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "jade",
      warframeStats: wfStats,
      warframeAbilities: [{ name: "Symphony Of Mercy", energyCost: 50, description: "", damageBuff: 1 }],
    }, sim);
    expect(buffs[0]!.damageBonus).toBeCloseTo(1 * 1.3, 5);
    expect(buffs[0]!.damageMultBonus).toBeUndefined();
  });

  it("does not list Empower as a weapon damage buff toggle", () => {
    expect(
      weaponDamageBuffAbilities([
        { name: "Empower", energyCost: 25, description: "", miscStats: { strengthBonus: 0.5 } },
        { name: "Roar", energyCost: 75, description: "", damageBuff: 0.5 },
      ]).map((a) => a.name),
    ).toEqual(["Roar"]);
  });

  it("applies Nourish as Viral elemental scaled by Strength", () => {
    const nourish: Ability = {
      name: "Nourish",
      energyCost: 50,
      description: "viral",
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Nourish"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "grendel",
      warframeStats: wfStats,
      warframeAbilities: [nourish],
    }, sim);
    expect(buffs[0]!.elemental).toEqual([{ type: "viral", bonusFraction: 0.75 * 1.3 }]);

    const helminthBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "excalibur",
      warframeStats: wfStats,
      warframeAbilities: [{ ...nourish, miscStats: { viralDamageBonus: 0.45 } }],
    }, sim);
    expect(helminthBuffs[0]!.elemental![0]!.bonusFraction).toBeCloseTo(0.45 * 1.3, 5);
  });

  it("applies Toxic Lash as Extra Hit (melee doubled) and scales DPS", () => {
    const lash: Ability = {
      name: "Toxic Lash",
      energyCost: 50,
      description: "toxin",
      miscStats: { gunDamage: 0.3, meleeDamage: 0.6 },
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Toxic Lash"],
    };
    const gunBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "saryn",
      warframeStats: wfStats,
      warframeAbilities: [lash],
    }, sim);
    expect(gunBuffs[0]!.extraHitDamageFraction).toBeCloseTo(0.3 * 1.3, 5);
    expect(gunBuffs[0]!.extraHitGuaranteedToxin).toBe(true);

    const meleeBuffs = resolveWeaponExternalBuffs(testMelee, {
      warframeId: "saryn",
      warframeStats: wfStats,
      warframeAbilities: [lash],
    }, sim);
    expect(meleeBuffs[0]!.extraHitDamageFraction).toBeCloseTo(0.6 * 1.3, 5);

    const bare = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim);
    const withLash = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim, {
      externalBuffs: gunBuffs,
    });
    expect(withLash.burstDps / bare.burstDps).toBeCloseTo(1 + 0.3 * 1.3, 4);
  });

  it("Toxic Lash Extra Hit double-dips elemental mods (wiki)", () => {
    const lash: Ability = {
      name: "Toxic Lash",
      energyCost: 50,
      description: "toxin",
      miscStats: { gunDamage: 0.3, meleeDamage: 0.6 },
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Toxic Lash"],
    };
    const gunBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "saryn",
      warframeStats: wfStats,
      warframeAbilities: [lash],
    }, sim);
    const toxinSlots: ModSlot[] = [{ modId: "infected_clip_r3", slotIndex: 0, rank: 5 }];
    // Infected Clip R5 = +90% toxin; Extra Hit fraction × (1 + 0.9)
    const frac = 0.3 * 1.3;
    const withDip = calculateWeaponBuild(testRifle, toxinSlots, modsMap, undefined, sim, {
      externalBuffs: gunBuffs,
    });
    expect(withDip.extraHitDamageFraction).toBeCloseTo(frac * (1 + 0.9), 5);
    const bareModded = calculateWeaponBuild(testRifle, toxinSlots, modsMap, undefined, sim);
    expect(withDip.burstDps / bareModded.burstDps).toBeCloseTo(1 + frac * (1 + 0.9), 4);
  });

  it("Toxic Lash + Spores doubles Extra Hit damage but not Toxin DoT stacks", () => {
    const lash: Ability = {
      name: "Toxic Lash",
      energyCost: 50,
      description: "toxin",
      miscStats: { gunDamage: 0.3, meleeDamage: 0.6 },
    };
    const baseSim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Toxic Lash"],
    };
    const sporeSim: SimulationParams = { ...baseSim, toxicLashSporesOnTarget: true };
    const gunBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "saryn",
      warframeStats: wfStats,
      warframeAbilities: [lash],
    }, baseSim);
    const frac = 0.3 * 1.3;
    const bare = calculateWeaponBuild(testRifle, [], new Map(), undefined, baseSim);
    const without = calculateWeaponBuild(testRifle, [], new Map(), undefined, baseSim, {
      externalBuffs: gunBuffs,
    });
    const withSpores = calculateWeaponBuild(testRifle, [], new Map(), undefined, sporeSim, {
      externalBuffs: gunBuffs,
    });
    expect(without.extraHitInstances).toBe(1);
    expect(withSpores.extraHitInstances).toBe(2);
    expect(without.burstDps / bare.burstDps).toBeCloseTo(1 + frac, 4);
    expect(withSpores.burstDps / bare.burstDps).toBeCloseTo(1 + frac * 2, 4);
    // One guaranteed Toxin DoT either way (wiki: not two status stacks)
    const dpt1 = without.statusProcs.find((p) => p.description.includes("Toxic Lash"))!.damagePerTick;
    const dpt2 = withSpores.statusProcs.find((p) => p.description.includes("Toxic Lash"))!.damagePerTick;
    expect(dpt2).toBeCloseTo(dpt1, 5);
  });

  it("Toxic Lash adds guaranteed Toxin DoT and faction-triple-dips Extra Hit ticks", () => {
    const lash: Ability = {
      name: "Toxic Lash",
      energyCost: 50,
      description: "toxin",
      miscStats: { gunDamage: 0.3, meleeDamage: 0.6 },
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Toxic Lash"],
      targetFaction: "grineer",
    };
    const gunBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "saryn",
      warframeStats: wfStats,
      warframeAbilities: [lash],
    }, sim);
    const baneSlots: ModSlot[] = [{ modId: "bane_of_grineer", slotIndex: 0, rank: 5 }];
    const withTl = calculateWeaponBuild(testRifle, baneSlots, modsMap, undefined, sim, {
      externalBuffs: gunBuffs,
    });
    const frac = 0.3 * 1.3;
    const bane = withTl.factionBonuses?.grineer ?? 0;
    expect(bane).toBeCloseTo(0.3, 5);
    const f = 1 + bane;
    // Extra Hit second faction dip: DPS mult = 1 + frac × f
    const bare = calculateWeaponBuild(testRifle, baneSlots, modsMap, undefined, sim);
    expect(withTl.burstDps / bare.burstDps).toBeCloseTo(1 + frac * f, 4);

    const tlProc = withTl.statusProcs.find((p) =>
      p.description.includes("Toxic Lash"),
    );
    expect(tlProc).toBeDefined();
    expect(tlProc!.type).toBe("toxin");
    expect(tlProc!.chance).toBe(1);
    // tick = 0.5 × total × frac × avgCrit × f³ (no toxin mods / Elementalist / headshots)
    const avgCrit = 1 + withTl.criticalChance * (withTl.criticalMultiplier - 1);
    expect(tlProc!.damagePerTick).toBeCloseTo(
      0.5 * withTl.totalDamage * frac * avgCrit * f * f * f,
      3,
    );
  });

  it("applies Xata's Whisper as Void Extra Hit and Vex Armor max Fury as Serration-style", () => {
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Xata's Whisper", "Vex Armor"],
    };
    const xataBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "xaku",
      warframeStats: wfStats,
      warframeAbilities: [{ name: "Xata's Whisper", energyCost: 25, description: "" }],
    }, sim);
    expect(xataBuffs[0]!.extraHitDamageFraction).toBeCloseTo(0.26 * 1.3, 5);

    const vexBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "chroma",
      warframeStats: wfStats,
      warframeAbilities: [{ name: "Vex Armor", energyCost: 75, description: "" }],
    }, sim);
    // Max Fury 275% × 130% STR → +357.5% additive damage
    expect(vexBuffs[0]!.damageBonus).toBeCloseTo(2.75 * 1.3, 5);

    const withVex = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim, {
      externalBuffs: vexBuffs,
    });
    expect(withVex.totalDamage).toBeCloseTo(100 * (1 + 2.75 * 1.3), 5);
  });

  it("scales Vex Armor Fury by vexArmorFuryFraction", () => {
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Vex Armor"],
      vexArmorFuryFraction: 0.5,
    };
    const vexBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "chroma",
      warframeStats: wfStats,
      warframeAbilities: [{ name: "Vex Armor", energyCost: 75, description: "" }],
    }, sim);
    expect(vexBuffs[0]!.damageBonus).toBeCloseTo(2.75 * 1.3 * 0.5, 5);
  });

  it("applies Electric Shield as fixed Electricity + crit mult (guns only)", () => {
    const shield: Ability = {
      name: "Electric Shield",
      energyCost: 50,
      description: "shield",
      miscStats: { electricDamageBonus: 0.5, critDamageBonus: 1.0 },
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Electric Shield"],
    };
    const gunBuffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "volt",
      warframeStats: wfStats,
      warframeAbilities: [shield],
    }, sim);
    expect(gunBuffs).toHaveLength(1);
    expect(gunBuffs[0]!.elemental).toEqual([{ type: "electricity", bonusFraction: 0.5 }]);
    expect(gunBuffs[0]!.critMultBonus).toBe(1);
    // 100% STR or 130% STR — same fixed values
    expect(gunBuffs[0]!.damageMultBonus).toBeUndefined();

    const meleeBuffs = resolveWeaponExternalBuffs(testMelee, {
      warframeId: "volt",
      warframeStats: wfStats,
      warframeAbilities: [shield],
    }, sim);
    expect(meleeBuffs.filter((b) => b.label === "Electric Shield")).toHaveLength(0);

    const withShield = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim, {
      externalBuffs: gunBuffs,
    });
    // Wiki: 100 base → 150 total with +50% Electricity; CM ≈ 2 × (1+1) after quantize
    expect(withShield.totalDamage).toBeCloseTo(150, 5);
    expect(withShield.criticalMultiplier).toBeCloseTo(4, 2);
  });

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

  it("scales Helminth Eclipse via helminth:: registry when host is not Mirage", () => {
    const eclipse: Ability = {
      name: "Eclipse",
      energyCost: 25,
      description: "Subsumed",
      damageBuff: 0.3, // wiki subsumed max bonus fraction
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Eclipse"],
    };
    const buffs = resolveWeaponExternalBuffs(testRifle, {
      warframeId: "excalibur",
      warframeStats: wfStats,
      warframeAbilities: [eclipse],
    }, sim);
    expect(buffs).toHaveLength(1);
    // 130% STR × 30% base = 39%
    expect(buffs[0]!.damageMultBonus).toBeCloseTo(0.3 * 1.3, 5);
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

  it("applies Redline full-battery fire rate × Duration (melee uses attack speed)", () => {
    const redline: Ability = {
      name: "Redline",
      energyCost: 100,
      description: "",
      miscStats: { fireRateBuff: 0.75, attackSpeedBuff: 0.4 },
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Redline"],
    };
    const stats = { ...wfStats, abilityDuration: 1.5 };
    const gunBuffs = resolveWeaponExternalBuffs(
      testRifle,
      { warframeId: "gauss", warframeStats: stats, warframeAbilities: [redline] },
      sim,
    );
    expect(gunBuffs[0]!.fireRateBonus).toBeCloseTo(0.75 * 1.5, 5);
    expect(weaponDamageBuffAbilities([redline]).map((a) => a.name)).toContain("Redline");

    const meleeBuffs = resolveWeaponExternalBuffs(
      testMelee,
      { warframeId: "gauss", warframeStats: stats, warframeAbilities: [redline] },
      sim,
    );
    expect(meleeBuffs[0]!.fireRateBonus).toBeCloseTo(0.4 * 1.5, 5);
  });

  it("applies Cathode Grace weapon crit chance additively × Strength", () => {
    const grace: Ability = {
      name: "Cathode Grace",
      energyCost: 75,
      description: "",
      miscStats: { criticalChanceBonus: 0.5 },
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Cathode Grace"],
    };
    const buffs = resolveWeaponExternalBuffs(
      testRifle,
      { warframeId: "gyre", warframeStats: wfStats, warframeAbilities: [grace] },
      sim,
    );
    expect(buffs[0]!.critChanceBonus).toBeCloseTo(0.5 * 1.3, 5);
    expect(weaponDamageBuffAbilities([grace]).map((a) => a.name)).toContain("Cathode Grace");

    const withBuff = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim, {
      externalBuffs: buffs,
    });
    const bare = calculateWeaponBuild(testRifle, [], new Map(), undefined, sim);
    expect(withBuff.criticalChance).toBeCloseTo(bare.criticalChance * (1 + 0.5 * 1.3), 5);
  });

  it("applies Wrathful Advance as flat final melee crit chance × Strength (guns ignore)", () => {
    const wrath: Ability = {
      name: "Wrathful Advance",
      energyCost: 25,
      description: "",
      miscStats: { criticalChanceBonus: 2 },
    };
    const sim: SimulationParams = {
      ...DEFAULT_SIM_PARAMS,
      activeWeaponAbilityBuffs: ["Wrathful Advance"],
    };
    const gunBuffs = resolveWeaponExternalBuffs(
      testRifle,
      { warframeId: "kullervo", warframeStats: wfStats, warframeAbilities: [wrath] },
      sim,
    );
    expect(gunBuffs).toHaveLength(0);

    const meleeBuffs = resolveWeaponExternalBuffs(
      testMelee,
      { warframeId: "kullervo", warframeStats: wfStats, warframeAbilities: [wrath] },
      sim,
    );
    expect(meleeBuffs[0]!.critChanceFlatBonus).toBeCloseTo(2 * 1.3, 5);
    expect(weaponDamageBuffAbilities([wrath]).map((a) => a.name)).toContain("Wrathful Advance");

    const withBuff = calculateWeaponBuild(testMelee, [], new Map(), undefined, sim, {
      externalBuffs: meleeBuffs,
    });
    const bare = calculateWeaponBuild(testMelee, [], new Map(), undefined, sim);
    expect(withBuff.criticalChance).toBeCloseTo(bare.criticalChance + 2 * 1.3, 5);
  });
});
