/**
 * Phases 5–9 foundation goldens: stance mult, arcanes, incarnon/radial smoke,
 * ability scaling registry, satellite calculators.
 */
import { describe, expect, it } from "vitest";
import { allArcanes } from "@/data/arcanes";
import { allCompanions } from "@/data/companions";
import { allHelminthAbilities } from "@/data/helminth";
import { allMods } from "@/data/mods";
import { STANCE_WEAPON_TYPE } from "@/data/stances";
import { allWarframes } from "@/data/warframes";
import { allWeapons } from "@/data/weapons";
import {
  DEFAULT_STANCE_AVG_MULTIPLIER,
  STANCE_AVG_DAMAGE_MULTIPLIER,
  STANCE_TYPE_AVG_MULTIPLIER,
  resolveStanceDamageMultiplier,
} from "@/lib/calc/combat-multipliers";
import {
  calculateWarframeBuild,
  calculateWeaponBuild,
  calculateWeaponBuildWithArcanes,
} from "@/lib/calc/calculator";
import { calculateCompanionBuild } from "@/lib/calc/companion-calculator";
import { calculateRailjackBuild } from "@/lib/calc/railjack-calculator";
import { effectiveArcaneStacks } from "@/lib/calc/arcane-calculator";
import {
  getVerifiedFieldScaling,
  getVerifiedMiscScaling,
} from "@/lib/codex/ability-scaling-registry";
import { getArcaneEffectDef } from "@/lib/overrides/arcane-effect-overrides";
import { DEFAULT_SIM_PARAMS } from "@/lib/types";

describe("Phase 5 — stance damage multipliers", () => {
  it("Cleaving Whirlwind uses per-stance table (not bare default)", () => {
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_cleaving_whirlwind).toBeCloseTo(3.3, 8);
    expect(
      resolveStanceDamageMultiplier([{ modId: "stance_cleaving_whirlwind" }]),
    ).toBeCloseTo(3.3, 8);
  });

  it("unknown stance id for a known type uses type average", () => {
    const type = STANCE_WEAPON_TYPE.rending_crane;
    expect(type).toBe("heavy_blade");
    const mult = resolveStanceDamageMultiplier([{ modId: "rending_crane" }]);
    expect(mult).toBe(
      STANCE_AVG_DAMAGE_MULTIPLIER.rending_crane ??
        STANCE_TYPE_AVG_MULTIPLIER.heavy_blade ??
        DEFAULT_STANCE_AVG_MULTIPLIER,
    );
  });

  it("locks high-use per-stance multipliers (wiki Avg Dmg Multi/s approximations)", () => {
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_decisive_judgement).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_crossing_snakes).toBeCloseTo(1.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.crushing_ruin).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.gaias_tragedy).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_wise_razor).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.gemini_cross).toBeCloseTo(1.2, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_swirling_tiger).toBeCloseTo(1.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_carving_mantis).toBeCloseTo(2.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_crimson_dervish).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_bleeding_willow).toBeCloseTo(1.3, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.sovereign_outcast).toBeCloseTo(1.5, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_seismic_palm).toBeCloseTo(2.6, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.four_riders).toBeCloseTo(2.6, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_clashing_forest).toBeCloseTo(1.7, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.blind_justice).toBeCloseTo(2.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_swooping_falcon).toBeCloseTo(2.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_stalking_fan).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_reaping_spiral).toBeCloseTo(3.2, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_vermillion_storm).toBeCloseTo(2.2, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_defiled_snapdragon).toBeCloseTo(2.3, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_shimmering_blight).toBeCloseTo(1.3, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_twirling_spire).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_vengeful_revenant).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.brutal_tide).toBeCloseTo(1.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.tranquil_cleave).toBeCloseTo(2.2, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.shattering_storm).toBeCloseTo(3.5, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.fateful_truth).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.crashing_havoc).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.slicing_feathers).toBeCloseTo(2.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.galeforce_dawn).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.mountains_edge).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.votive_onslaught).toBeCloseTo(2.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_grim_fury_sparring).toBeCloseTo(2.6, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.rending_crane).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.noble_cadence).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_temporal_royale).toBeCloseTo(2.3, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_high_noon).toBeCloseTo(1.6, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_bullet_dance).toBeCloseTo(1.7, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_coiling_viper).toBeCloseTo(2.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_burning_wasp).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_spinning_needle).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_gnashing_payara).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_sinking_talon).toBeCloseTo(1.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.atlantis_vulcan).toBeCloseTo(0.7, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.butchers_revelry).toBeCloseTo(2.8, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_vulpine_mask).toBeCloseTo(2.3, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_sundering_weave).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.cyclone_kraken).toBeCloseTo(2.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.final_harbinger).toBeCloseTo(1.9, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_stinging_thorn).toBeCloseTo(2.2, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_aurora_rush).toBeCloseTo(2.2, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.gleaming_talon).toBeCloseTo(2.6, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_homing_fang).toBeCloseTo(2.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_pointed_wind).toBeCloseTo(2.4, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_iron_phoenix).toBeCloseTo(2.3, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.stance_flailing_branch).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.fracturing_wind).toBeCloseTo(3.0, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.eleventh_storm).toBeCloseTo(2.7, 8);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.rising_steel).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.celestial_nightfall).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.lashing_coil).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.piercing_fury).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.last_herald).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.biting_piranha).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.tainted_hydra).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.argent_scourge).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.quaking_hand).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.rending_wind).toBe(1);
    expect(resolveStanceDamageMultiplier([{ modId: "argent_scourge" }])).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.amars_contempt).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.boreals_contempt).toBe(1);
    expect(STANCE_AVG_DAMAGE_MULTIPLIER.niras_contempt).toBe(1);
    expect(resolveStanceDamageMultiplier([{ modId: "stance_decisive_judgement" }])).toBeCloseTo(
      2.8,
      8,
    );
    expect(resolveStanceDamageMultiplier([{ modId: "gaias_tragedy" }])).toBeCloseTo(3.0, 8);
  });

  it("applies stance mult to Skana paper burst DPS when stance equipped", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const bare = calculateWeaponBuild(skana, [], modsMap, undefined, {
      ...DEFAULT_SIM_PARAMS,
      applyStanceMultiplier: true,
    });
    const withStance = calculateWeaponBuild(
      skana,
      [{ modId: "stance_iron_phoenix", rank: 3, slotIndex: 0 }],
      modsMap,
      undefined,
      { ...DEFAULT_SIM_PARAMS, applyStanceMultiplier: true },
    );
    const expectedMult = resolveStanceDamageMultiplier([
      { modId: "stance_iron_phoenix" },
    ]);
    expect(withStance.burstDps / bare.burstDps).toBeCloseTo(expectedMult, 4);
  });
});

describe("Phase 6 — arcane passives on paper DPS", () => {
  it("passive weapon arcanes are active at arcaneStacks=0", () => {
    const def = getArcaneEffectDef("cascadia_overcharge")!;
    expect(def.trigger).toBe("passive");
    expect(effectiveArcaneStacks(def, 0, true)).toBe(1);
  });

  it("Cascadia Overcharge R5: +300% crit chance on Lex (overshields assumed)", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const arcane = allArcanes.find((a) => a.id === "cascadia_overcharge")!;
    const bare = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    const withArc = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [arcane],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(withArc.criticalChance).toBeCloseTo(lex.criticalChance * 4, 5);
    expect(withArc.burstDps).toBeGreaterThan(bare.burstDps);
  });

  it("Primary Merciless still scales with sim stacks", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const merciless = allArcanes.find((a) => a.id === "arcane_primary_merciless")!;
    const bare = calculateWeaponBuild(braton, [], new Map());
    const zero = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [merciless],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [merciless],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 12 },
    );
    expect(full.totalDamage).toBeGreaterThan(zero.totalDamage);
    // wiki R5: +30% damage × 12 = +360%; reload is flat +30% (not × stacks)
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 4.6, 4);
    expect(full.reloadTime).toBeCloseTo(bare.reloadTime / 1.3, 4);
  });

  it("Secondary Kinship: paper 0 buffs = no CC; 3 buffs = +60% CC (wiki)", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const kinship = allArcanes.find((a) => a.id === "secondary_kinship")!;
    const def = getArcaneEffectDef("secondary_kinship")!;
    expect(def.trigger).toBe("stacks");
    expect(effectiveArcaneStacks(def, 0, true)).toBe(0);

    const paper = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [kinship],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    const three = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [kinship],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 3 },
    );
    expect(paper.criticalChance).toBeCloseTo(lex.criticalChance, 5);
    // wiki example pattern: base × (1 + 3×0.20)
    expect(three.criticalChance).toBeCloseTo(lex.criticalChance * (1 + 0.6), 4);
  });

  it("Arcane Hot Shot: 50 Heat stacks → +300% weapon CC at R5", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const hot = allArcanes.find((a) => a.id === "arcane_hot_shot")!;
    const def = getArcaneEffectDef("arcane_hot_shot")!;
    expect(def.stackCap).toBe(50);

    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [hot],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 50 },
    );
    expect(full.criticalChance).toBeCloseTo(braton.criticalChance * (1 + 3.0), 4);
  });

  it("Conjunction Voltage: 0 stacks = no buff; 40 stacks R5 → +120% MS / +60% reload", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const cv = allArcanes.find((a) => a.id === "conjunction_voltage")!;
    const def = getArcaneEffectDef("conjunction_voltage")!;
    expect(def.trigger).toBe("stacks");
    expect(def.stackCap).toBe(40);

    const zero = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [cv],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(zero.multishot).toBeCloseTo(lex.multishot, 5);
    expect(zero.reloadTime).toBeCloseTo(lex.reloadTime, 5);

    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [cv],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 40 },
    );
    // wiki R5: +3% MS × 40 = +120%; +1.5% reload × 40 = +60%
    expect(full.multishot).toBeCloseTo(lex.multishot * 2.2, 4);
    expect(full.reloadTime).toBeCloseTo(lex.reloadTime / 1.6, 4);
    expect(full.burstDps).toBeGreaterThan(zero.burstDps);
  });

  it("Primary Crux: 0 stacks = no buff; 10 stacks R5 → +300% SC / +60% AE", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const crux = allArcanes.find((a) => a.id === "primary_crux")!;
    const def = getArcaneEffectDef("primary_crux")!;
    expect(def.trigger).toBe("stacks");
    expect(def.stackCap).toBe(10);

    const zero = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [crux],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(zero.statusChance).toBeCloseTo(braton.statusChance, 5);
    expect(zero.ammoEfficiency ?? 0).toBeCloseTo(0, 5);

    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [crux],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 10 },
    );
    // wiki R5: +30% SC × 10 = +300%; +6% AE × 10 = +60%
    expect(full.statusChance).toBeCloseTo(braton.statusChance * 4, 4);
    expect(full.ammoEfficiency).toBeCloseTo(0.6, 4);
  });

  it("Primary Blight: 0 stacks = no buff; 40 stacks R5 → +72% MS / +144% CD", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const blight = allArcanes.find((a) => a.id === "primary_blight")!;
    const def = getArcaneEffectDef("primary_blight")!;
    expect(def.stackCap).toBe(40);

    const bare = calculateWeaponBuild(braton, [], new Map());
    const zero = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [blight],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(zero.multishot).toBeCloseTo(bare.multishot, 5);
    expect(zero.criticalMultiplier).toBeCloseTo(bare.criticalMultiplier, 5);

    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [blight],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 40 },
    );
    // wiki R5: +1.8% MS × 40 = +72%; +3.6% CD × 40 = +144% (of weapon base CM)
    expect(full.multishot).toBeCloseTo(bare.multishot + braton.multishot * 0.72, 4);
    expect(full.criticalMultiplier).toBeCloseTo(
      bare.criticalMultiplier + braton.criticalMultiplier * 1.44,
      4,
    );
    expect(full.burstDps).toBeGreaterThan(zero.burstDps);
  });

  it("Cascadia Flare: 0 stacks = no buff; 40 stacks R5 → +480% damage", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const flare = allArcanes.find((a) => a.id === "cascadia_flare")!;
    const def = getArcaneEffectDef("cascadia_flare")!;
    expect(def.stackCap).toBe(40);

    const bare = calculateWeaponBuild(lex, [], new Map());
    const zero = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [flare],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(zero.totalDamage).toBeCloseTo(bare.totalDamage, 4);

    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [flare],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 40 },
    );
    // wiki R5: +12% damage × 40 = +480%
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 5.8, 4);
    expect(full.burstDps).toBeGreaterThan(zero.burstDps);
  });

  it("Primary Frostbite: 0 stacks = no buff; 40 stacks R5 → +90% MS / +120% CD", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const frostbite = allArcanes.find((a) => a.id === "primary_frostbite")!;
    const def = getArcaneEffectDef("primary_frostbite")!;
    expect(def.stackCap).toBe(40);

    const bare = calculateWeaponBuild(braton, [], new Map());
    const zero = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [frostbite],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(zero.multishot).toBeCloseTo(bare.multishot, 5);
    expect(zero.criticalMultiplier).toBeCloseTo(bare.criticalMultiplier, 5);

    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [frostbite],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 40 },
    );
    // wiki R5: +2.25% MS × 40 = +90%; +3% CD × 40 = +120%
    expect(full.multishot).toBeCloseTo(bare.multishot + braton.multishot * 0.9, 4);
    expect(full.criticalMultiplier).toBeCloseTo(
      bare.criticalMultiplier + braton.criticalMultiplier * 1.2,
      4,
    );
    expect(full.burstDps).toBeGreaterThan(zero.burstDps);
  });

  it("Akimbo Slip Shot R5: +65% ammo efficiency (paper assumes slide/aim glide)", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const slip = allArcanes.find((a) => a.id === "akimbo_slip_shot")!;
    const def = getArcaneEffectDef("akimbo_slip_shot")!;
    expect(def.trigger).toBe("passive");

    const withArc = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [slip],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(withArc.ammoEfficiency).toBeCloseTo(0.65, 4);
  });

  it("Primary Overcharge R5: +350% multishot (paper assumes Energy >90% at cap)", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const over = allArcanes.find((a) => a.id === "primary_overcharge")!;
    const def = getArcaneEffectDef("primary_overcharge")!;
    expect(def.trigger).toBe("passive");

    const bare = calculateWeaponBuild(braton, [], new Map());
    const withArc = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [over],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    // wiki R5 cap +350% MS
    expect(withArc.multishot).toBeCloseTo(bare.multishot + braton.multishot * 3.5, 4);
    expect(withArc.burstDps).toBeGreaterThan(bare.burstDps);
  });

  it("Primary Deadhead: 3 stacks R5 → +360% damage and +30% headshot mult (passive)", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const deadhead = allArcanes.find((a) => a.id === "arcane_primary_deadhead")!;
    const def = getArcaneEffectDef("arcane_primary_deadhead")!;
    expect(def.stackCap).toBe(3);

    const bare = calculateWeaponBuild(braton, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [deadhead],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 3 },
    );
    // wiki R5: +120% damage × 3 = +360%; +30% headshot mult passive
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 4.6, 4);
    expect(full.headshotDamageBonus).toBeCloseTo((bare.headshotDamageBonus ?? 0) + 0.3, 4);
    expect(full.arcaneBonuses?.headshotMultiplier).toBeCloseTo(30, 4);
    expect(full.arcaneBonuses?.recoilReduction).toBeCloseTo(50, 4);
  });

  it("Primary Dexterity: 6 stacks R5 → +360% damage; combo duration stays +7.5s (not × stacks)", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const dex = allArcanes.find((a) => a.id === "arcane_primary_dexterity")!;
    const def = getArcaneEffectDef("arcane_primary_dexterity")!;
    expect(def.stackCap).toBe(6);

    const bare = calculateWeaponBuild(braton, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [dex],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 6 },
    );
    // wiki R5: +60% damage × 6 = +360%; +7.5s combo duration passive
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 4.6, 4);
    expect(full.arcaneBonuses?.comboDuration).toBeCloseTo(7.5, 4);
  });

  it("Cascadia Accuracy: +300% CC only with roll stacks + applyHeadshots (weakpoint)", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const acc = allArcanes.find((a) => a.id === "cascadia_accuracy")!;
    const def = getArcaneEffectDef("cascadia_accuracy")!;
    expect(def.trigger).toBe("onMovement");

    const bare = calculateWeaponBuild(lex, [], new Map());
    const body = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [acc],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1, applyHeadshots: false },
    );
    expect(body.criticalChance).toBeCloseTo(bare.criticalChance, 5);

    const head = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [acc],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1, applyHeadshots: true },
    );
    // wiki R5: +300% Weakpoint CC after roll
    expect(head.criticalChance).toBeCloseTo(lex.criticalChance * 4, 4);
    expect(head.burstDps).toBeGreaterThan(body.burstDps);
  });

  it("Melee Exposure: 4 ability casts R5 → +240% Corrosive (cap); 5th cast does not exceed", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const exposure = allArcanes.find((a) => a.id === "melee_exposure")!;

    const bare = calculateWeaponBuild(skana, [], new Map());
    const four = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [exposure],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 4 },
    );
    // wiki R5: +60% Corrosive × 4 = +240% of base damage
    const corrosive = four.elements.find((e) => e.type === "corrosive")?.value ?? 0;
    expect(corrosive).toBeCloseTo(skana.damage * 2.4, 4);
    expect(four.totalDamage).toBeCloseTo(bare.totalDamage + skana.damage * 2.4, 4);

    const five = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [exposure],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 5 },
    );
    expect(five.totalDamage).toBeCloseTo(four.totalDamage, 4);
  });

  it("Primary Compression stays panel-only (needs radial meters lost, not flat +100%)", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const compression = allArcanes.find((a) => a.id === "primary_compression")!;
    const bare = calculateWeaponBuild(braton, [], new Map());
    const withArc = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [compression],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(withArc.totalDamage).toBeCloseTo(bare.totalDamage, 4);
    expect(withArc.ammoEfficiency ?? 0).toBeCloseTo(bare.ammoEfficiency ?? 0, 4);
  });

  it("Secondary Enervate: 7 hit stacks → +70% absolute CC on Lex", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const enervate = allArcanes.find((a) => a.id === "secondary_enervate")!;
    const bare = calculateWeaponBuild(lex, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [enervate],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 7 },
    );
    // wiki: absolute +10% CC per hit stack (not % of base)
    expect(full.criticalChance).toBeCloseTo(bare.criticalChance + 0.7, 4);
    expect(full.arcaneBonuses?.enervateStacks).toBe(7);
  });

  it("Melee Doughty R5: flat CM from puncture status chance (Skana)", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const doughty = allArcanes.find((a) => a.id === "melee_doughty")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const withArc = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [doughty],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    // puncture SC% = statusChance × (puncture/total) × 100; bonus = round1(psc% × 0.1 × 1.0)
    const punctureFrac = bare.puncture / bare.totalDamage;
    const pscPct = bare.statusChance * punctureFrac * 100;
    const expectedBonus = Math.min(50, Math.round(pscPct * 0.1 * 10) / 10);
    expect(withArc.criticalMultiplier).toBeCloseTo(bare.criticalMultiplier + expectedBonus, 4);
  });

  it("Melee Retaliation: 14 shield-steps R5 → +420% damage (cap)", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const retaliation = allArcanes.find((a) => a.id === "melee_retaliation")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const zero = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [retaliation],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 0 },
    );
    expect(zero.totalDamage).toBeCloseTo(bare.totalDamage, 4);

    const full = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [retaliation],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 14 },
    );
    // wiki R5: +30% × 14 = +420% (cap)
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 5.2, 4);
  });

  it("Primary Plated Round: Braton mag 45 → 15×√(5×45) damage when buff up", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const plated = allArcanes.find((a) => a.id === "primary_plated_round")!;
    const bare = calculateWeaponBuild(braton, [], new Map());
    const expectedPct = 15 * Math.sqrt(5 * braton.magazine);
    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [plated],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * (1 + expectedPct / 100), 4);
    expect(full.arcaneBonuses?.reloadDamageRamp).toBeCloseTo(expectedPct, 4);
  });

  it("Secondary Outburst: 12× combo R5 → +240% CC and CD", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const outburst = allArcanes.find((a) => a.id === "secondary_outburst")!;
    const bare = calculateWeaponBuild(lex, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [outburst],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 12 },
    );
    // wiki R5: +20% × 12 = +240% to CC and CD
    expect(full.criticalChance).toBeCloseTo(lex.criticalChance * 3.4, 4);
    expect(full.criticalMultiplier).toBeCloseTo(
      bare.criticalMultiplier + lex.criticalMultiplier * 2.4,
      4,
    );
  });

  it("Melee Crescendo: 10 finishers R5 → +60 initial combo (6 each)", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const crescendo = allArcanes.find((a) => a.id === "melee_crescendo")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [crescendo],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 10 },
    );
    expect(full.comboCount).toBeCloseTo(bare.comboCount + 60, 4);
    expect(full.arcaneBonuses?.meleeComboInitial).toBeCloseTo(60, 4);
  });

  it("Melee Assimilation: stacks>0 → +150% heavy attack damage at R5", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const assimilation = allArcanes.find((a) => a.id === "melee_assimilation")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [assimilation],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.heavyAttackDamage).toBeCloseTo(bare.heavyAttackDamage * 2.5, 4);
  });

  it("Shotgun Vendetta: stacks>0 → +180% MS / +75% reload at R5", () => {
    const hek = allWeapons.find((w) => w.id === "hek")!;
    const vendetta = allArcanes.find((a) => a.id === "shotgun_vendetta")!;
    const bare = calculateWeaponBuild(hek, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      hek,
      [],
      new Map(),
      [vendetta],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.multishot).toBeCloseTo(bare.multishot + hek.multishot * 1.8, 4);
    expect(full.reloadTime).toBeCloseTo(bare.reloadTime / 1.75, 4);
  });

  it("Secondary Surge: stacks>0 → +700% damage at R5 cap (×8)", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const surge = allArcanes.find((a) => a.id === "secondary_surge")!;
    const bare = calculateWeaponBuild(lex, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [surge],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 8, 4);
  });

  it("Arcane Pistoleer: stacks>0 → +102% ammo efficiency at R5", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const pistoleer = allArcanes.find((a) => a.id === "arcane_pistoleer")!;
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [pistoleer],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.ammoEfficiency).toBeCloseTo(1.02, 4);
  });

  it("Arcane Acceleration: stacks>0 → +90% FR on Braton; no FR on Hek (shotgun)", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const hek = allWeapons.find((w) => w.id === "hek")!;
    const accel = allArcanes.find((a) => a.id === "arcane_acceleration")!;
    const bareB = calculateWeaponBuild(braton, [], new Map());
    const fullB = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [accel],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(fullB.fireRate).toBeCloseTo(bareB.fireRate * 1.9, 4);

    const bareH = calculateWeaponBuild(hek, [], new Map());
    const fullH = calculateWeaponBuildWithArcanes(
      hek,
      [],
      new Map(),
      [accel],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(fullH.fireRate).toBeCloseTo(bareH.fireRate, 4);
  });

  it("Arcane Tempo: stacks>0 → +90% shotgun FR at R5", () => {
    const hek = allWeapons.find((w) => w.id === "hek")!;
    const tempo = allArcanes.find((a) => a.id === "arcane_tempo")!;
    const bare = calculateWeaponBuild(hek, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      hek,
      [],
      new Map(),
      [tempo],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.fireRate).toBeCloseTo(bare.fireRate * 1.9, 4);
  });

  it("Arcane Velocity: stacks>0 → +120% secondary FR at R5", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const velocity = allArcanes.find((a) => a.id === "arcane_velocity")!;
    const bare = calculateWeaponBuild(lex, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [velocity],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.fireRate).toBeCloseTo(bare.fireRate * 2.2, 4);
  });

  it("Arcane Strike: stacks>0 → +60% melee attack speed at R5", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const strike = allArcanes.find((a) => a.id === "arcane_strike")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [strike],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.fireRate).toBeCloseTo(bare.fireRate * 1.6, 4);
  });

  it("Arcane Primary Charger: stacks>0 → +300% damage at R5", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const charger = allArcanes.find((a) => a.id === "arcane_primary_charger")!;
    const bare = calculateWeaponBuild(braton, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [charger],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 4, 4);
  });

  it("Melee Careen: stacks>0 → ×2.5 damage vs frozen at R5", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const careen = allArcanes.find((a) => a.id === "melee_careen")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [careen],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 2.5, 4);
  });

  it("Arcane Avenger: stacks>0 → absolute +45% CC (not % of base)", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const avenger = allArcanes.find((a) => a.id === "arcane_avenger")!;
    const bare = calculateWeaponBuild(lex, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [avenger],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.criticalChance).toBeCloseTo(bare.criticalChance + 0.45, 4);
  });

  it("Arcane Awakening: stacks>0 → +150% secondary damage at R5", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const awakening = allArcanes.find((a) => a.id === "arcane_awakening")!;
    const bare = calculateWeaponBuild(lex, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [awakening],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 2.5, 4);
  });

  it("Arcane Rage: stacks>0 → +180% primary damage at R5", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const rage = allArcanes.find((a) => a.id === "arcane_rage")!;
    const bare = calculateWeaponBuild(braton, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [rage],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 2.8, 4);
  });

  it("Arcane Precision: stacks>0 → +300% secondary damage at R5", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const precision = allArcanes.find((a) => a.id === "arcane_precision")!;
    const bare = calculateWeaponBuild(lex, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      lex,
      [],
      new Map(),
      [precision],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 4, 4);
  });

  it("Arcane Fury: stacks>0 → +180% melee damage at R5", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const fury = allArcanes.find((a) => a.id === "arcane_fury")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [fury],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 2.8, 4);
  });

  it("Arcane Blade Charger: stacks>0 → +300% melee damage at R5", () => {
    const skana = allWeapons.find((w) => w.id === "skana")!;
    const blade = allArcanes.find((a) => a.id === "arcane_blade_charger")!;
    const bare = calculateWeaponBuild(skana, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      skana,
      [],
      new Map(),
      [blade],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 4, 4);
  });

  it("Arcane Arachne: stacks>0 → +150% damage while wall-latched at R5", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const arachne = allArcanes.find((a) => a.id === "arcane_arachne")!;
    const bare = calculateWeaponBuild(braton, [], new Map());
    const full = calculateWeaponBuildWithArcanes(
      braton,
      [],
      new Map(),
      [arachne],
      undefined,
      { ...DEFAULT_SIM_PARAMS, arcaneStacks: 1 },
    );
    expect(full.totalDamage).toBeCloseTo(bare.totalDamage * 2.5, 4);
  });
});

describe("Phase 7 — Incarnon / radial smoke", () => {
  it("bare Braton (Incarnon-capable) has no Incarnon radial DPS folded in", () => {
    const braton = allWeapons.find((w) => w.id === "braton")!;
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const stats = calculateWeaponBuild(braton, [], modsMap);
    const incarnonRadials = (stats.radialAttacks ?? []).filter((a) =>
      /incarnon/i.test(a.name),
    );
    expect(incarnonRadials.every((a) => !a.includeInDps)).toBe(true);
  });
});

describe("Phase 8 — ability scaling registry + sets", () => {
  it("Roar damageBuff scales with strength (verified field)", () => {
    const scaling = getVerifiedFieldScaling("rhino", "Roar", "damageBuff");
    expect(scaling).toEqual({ scale: "strength" });
  });

  it("Electric Shield misc bonuses are fixed (not Strength-scaled in registry)", () => {
    // Absence of verified misc scaling is intentional — Strength N/A on wiki.
    expect(getVerifiedFieldScaling("volt", "Electric Shield", "damageBuff")).toBeNull();
  });

  it("Celestial Twin health mult scales STR; damage mults stay unverified (fixed)", () => {
    expect(getVerifiedMiscScaling("wukong", "Celestial Twin", "healthMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wukong", "Celestial Twin", "damageMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("wukong", "Celestial Twin", "markDamageMultiplier")).toBeNull();
  });

  it("Spores damage growth scales with Strength", () => {
    expect(getVerifiedMiscScaling("saryn", "Spores", "damageGrowth")).toEqual({
      scale: "strength",
    });
  });

  it("Miasma Spores damage multiplier stays fixed (unscaled)", () => {
    expect(getVerifiedMiscScaling("saryn", "Miasma", "sporesDamageMultiplier")).toBeNull();
  });

  it("Pillage shield/armor strip scales with Strength (cap 100%)", () => {
    expect(getVerifiedMiscScaling("hildryn", "Pillage", "shieldStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("hildryn", "Pillage", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("helminth", "Pillage", "shieldStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
  });

  it("Terrify armor strip and enemy count scale with Strength", () => {
    expect(getVerifiedMiscScaling("nekros", "Terrify", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("nekros", "Terrify", "affectedEnemies")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Terrify", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
  });

  it("Eclipse is verified on Mirage (90% DR cap) and Helminth (75% DR cap)", () => {
    expect(getVerifiedFieldScaling("mirage", "Eclipse", "damageBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedFieldScaling("mirage", "Eclipse", "damageReduction")).toEqual({
      scale: "strength",
      cap: 0.9,
    });
    expect(getVerifiedFieldScaling("helminth", "Eclipse", "damageReduction")).toEqual({
      scale: "strength",
      cap: 0.75,
    });
  });

  it("Prismatic Gem placement distance stays Misc-fixed (aurora is radius × Range)", () => {
    expect(getVerifiedMiscScaling("citrine", "Prismatic Gem", "placementDistance")).toBeNull();
    expect(getVerifiedMiscScaling("citrine", "Prismatic Gem", "statusChanceBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("citrine", "Prismatic Gem", "statusDurationBonus")).toEqual({
      scale: "duration",
    });
  });

  it("Effigy / Lycath / Ulfrun / Shroud misc extras stay fixed (wiki Misc / Strength N/A)", () => {
    expect(getVerifiedMiscScaling("chroma", "Effigy", "sentryArmor")).toBeNull();
    expect(getVerifiedMiscScaling("chroma", "Effigy", "stunRadius")).toBeNull();
    expect(getVerifiedMiscScaling("chroma", "Effigy", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("voruna", "Lycath's Hunt", "healthOrbChance")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Lycath's Hunt", "heavyAttackEfficiency")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Lycath's Hunt", "durationExtension")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("voruna", "Ulfrun's Descent", "charges")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Ulfrun's Descent", "killDamageBonus")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Ulfrun's Descent", "speedBuff")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Shroud Of Dynar", "meleeBuffDuration")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Shroud Of Dynar", "speedBuff")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Shroud Of Dynar", "critDamageBonus")).toEqual({
      scale: "strength",
    });
  });

  it("Immolation max-heat DR × STR (cap 90%); initial DR misc × STR (cap 50%)", () => {
    expect(getVerifiedFieldScaling("ember", "Immolation", "damageReduction")).toEqual({
      scale: "strength",
      cap: 0.9,
    });
    expect(getVerifiedMiscScaling("ember", "Immolation", "initialDamageReduction")).toEqual({
      scale: "strength",
      cap: 0.5,
    });
    expect(getVerifiedFieldScaling("ember_prime", "Immolation", "damageReduction")).toEqual({
      scale: "strength",
      cap: 0.9,
    });
  });

  it("Fire Blast armor strip × STR at max heat (cap 100%)", () => {
    expect(getVerifiedMiscScaling("ember", "Fire Blast", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
  });

  it("Ophanim Eyes strip/s × STR; slow/s stays Misc-fixed", () => {
    expect(getVerifiedMiscScaling("jade", "Ophanim Eyes", "armorStripPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("jade", "Ophanim Eyes", "shieldStripPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("jade", "Ophanim Eyes", "slowPerSecond")).toBeNull();
    expect(getVerifiedMiscScaling("helminth", "Ophanim Eyes", "armorStripPerSecond")).toEqual({
      scale: "strength",
    });
  });

  it("Symphony of Mercy Deathbringer damageBuff × STR; Seven/regen misc × STR", () => {
    expect(getVerifiedFieldScaling("jade", "Symphony Of Mercy", "damageBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("jade", "Symphony Of Mercy", "strengthBonus")).toEqual({
      scale: "strength",
      cap: 1.5,
    });
    expect(getVerifiedMiscScaling("jade", "Symphony Of Mercy", "shieldRegen")).toEqual({
      scale: "strength",
    });
  });

  it("Light's Judgment heal × STR; Judgment vuln stays Misc-fixed", () => {
    expect(getVerifiedMiscScaling("jade", "Light's Judgment", "healthRegen")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("jade", "Light's Judgment", "judgmentVulnerability")).toBeNull();
    expect(getVerifiedMiscScaling("jade", "Light's Judgment", "wellsLimit")).toBeNull();
  });

  it("Glory on High flight DR × STR (cap 50%); alt explosion × RNG; chance/drain fixed", () => {
    expect(getVerifiedFieldScaling("jade", "Glory On High", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedMiscScaling("jade", "Glory On High", "altFireExplosion")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("jade", "Glory On High", "judgmentChance")).toBeNull();
    expect(getVerifiedMiscScaling("jade", "Glory On High", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("jade", "Glory On High", "speedBuff")).toBeNull();
  });

  it("Thermal Sunder radii × RNG; Helminth heatDamage × STR; area/status misc fixed", () => {
    expect(getVerifiedMiscScaling("gauss", "Thermal Sunder", "minRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("gauss", "Thermal Sunder", "maxRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("gauss", "Thermal Sunder", "areasPerElement")).toBeNull();
    expect(getVerifiedMiscScaling("gauss", "Thermal Sunder", "statusDurationMin")).toBeNull();
    expect(getVerifiedMiscScaling("helminth", "Thermal Sunder", "heatDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Thermal Sunder", "minRadius")).toEqual({
      scale: "range",
    });
  });

  it("Kinetic Plating full-battery DR × STR (cap 100%); empty floor × STR (cap 50%)", () => {
    expect(getVerifiedFieldScaling("gauss", "Kinetic Plating", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedMiscScaling("gauss", "Kinetic Plating", "minDamageReduction")).toEqual({
      scale: "strength",
      cap: 0.5,
    });
    expect(getVerifiedMiscScaling("gauss", "Kinetic Plating", "energyRestorePerHit")).toBeNull();
    expect(getVerifiedMiscScaling("gauss_prime", "Kinetic Plating", "minDamageReduction")).toEqual({
      scale: "strength",
      cap: 0.5,
    });
  });

  it("Redline speed buffs × Duration; battery drain Misc-fixed", () => {
    expect(getVerifiedMiscScaling("gauss", "Redline", "fireRateBuff")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("gauss", "Redline", "attackSpeedBuff")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("gauss", "Redline", "reloadBuff")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("gauss", "Redline", "castSpeedBuff")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("gauss", "Redline", "batteryDrainPerSecond")).toBeNull();
  });

  it("Arcsphere field DPS × STR / field radius × RNG; sphere cap Misc-fixed", () => {
    expect(getVerifiedMiscScaling("gyre", "Arcsphere", "fieldDamagePerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gyre", "Arcsphere", "fieldRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("gyre", "Arcsphere", "maxSpheres")).toBeNull();
    expect(getVerifiedMiscScaling("gyre", "Arcsphere", "multiHitDamageMultiplier")).toBeNull();
  });

  it("Coil Horizon contact DPS × STR; Helminth matches; lifetimes Misc-fixed", () => {
    expect(getVerifiedMiscScaling("gyre", "Coil Horizon", "contactDamagePerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Coil Horizon", "contactDamagePerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gyre", "Coil Horizon", "sphereLifetime")).toBeNull();
  });

  it("Cathode Grace weapon/ability CC + energy regen × STR; extend/cap Misc-fixed", () => {
    expect(getVerifiedMiscScaling("gyre", "Cathode Grace", "criticalChanceBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gyre", "Cathode Grace", "abilityCritChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gyre", "Cathode Grace", "energyRegen")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gyre", "Cathode Grace", "durationExtension")).toBeNull();
    expect(getVerifiedMiscScaling("gyre", "Cathode Grace", "durationCap")).toBeNull();
    expect(getVerifiedMiscScaling("gyre_prime", "Cathode Grace", "criticalChanceBonus")).toEqual({
      scale: "strength",
    });
  });

  it("Rotorswell discharge × STR / range × RNG; move mult Misc-fixed", () => {
    expect(getVerifiedMiscScaling("gyre", "Rotorswell", "dischargeDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gyre", "Rotorswell", "dischargeRange")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("gyre", "Rotorswell", "moveSpeedMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("gyre", "Rotorswell", "dischargeTargets")).toBeNull();
  });

  it("Grenade Fan shield restore/SPS × STR; grenade counts Misc-fixed", () => {
    expect(getVerifiedMiscScaling("protea", "Grenade Fan", "shieldRestore")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("protea", "Grenade Fan", "shieldsPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("protea", "Grenade Fan", "shrapnelGrenades")).toBeNull();
    expect(getVerifiedMiscScaling("protea", "Grenade Fan", "shieldGateExtension")).toBeNull();
  });

  it("Blaze Artillery splash × RNG; shots/turrets/+100% per hit Misc-fixed", () => {
    expect(getVerifiedMiscScaling("protea", "Blaze Artillery", "splashRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("protea", "Blaze Artillery", "shotsPerSecond")).toBeNull();
    expect(getVerifiedMiscScaling("protea", "Blaze Artillery", "maxTurrets")).toBeNull();
    expect(getVerifiedMiscScaling("protea", "Blaze Artillery", "damageBonusPerHit")).toBeNull();
  });

  it("Dispensary extra pickup × STR; Helminth duration reduced; spawn Misc-fixed", () => {
    expect(getVerifiedMiscScaling("protea", "Dispensary", "extraPickupChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Dispensary", "extraPickupChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("protea", "Dispensary", "spawnInterval")).toBeNull();
    expect(getVerifiedMiscScaling("protea_prime", "Dispensary", "extraPickupChance")).toEqual({
      scale: "strength",
    });
  });

  it("Temporal Anchor damage conversion × STR; invuln/rewind Misc-fixed", () => {
    expect(getVerifiedMiscScaling("protea", "Temporal Anchor", "damageConversion")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("protea", "Temporal Anchor", "invulnerabilityDuration")).toBeNull();
    expect(getVerifiedMiscScaling("protea", "Temporal Anchor", "rewindCountdown")).toBeNull();
    expect(getVerifiedMiscScaling("protea", "Temporal Anchor", "lethalHealthRestore")).toBeNull();
  });

  it("Noctua alt-fire × STR / seek distance × RNG; energy/shot × EFF; fragments Misc-fixed", () => {
    expect(getVerifiedMiscScaling("dante", "Noctua", "altFireDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Noctua", "seekDistance")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("dante", "Noctua", "energyPerShot")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("dante", "Noctua", "pageFragments")).toBeNull();
    expect(getVerifiedMiscScaling("dante", "Noctua", "seekAngle")).toBeNull();
  });

  it("Light Verse Overguard/heal × STR; invuln Misc-fixed", () => {
    expect(getVerifiedMiscScaling("dante", "Light Verse", "overguardGain")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Light Verse", "overguardCap")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Light Verse", "healthHealPercent")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Light Verse", "invulnerabilityDuration")).toBeNull();
  });

  it("Dark Verse cone/statuses Misc-fixed; Helminth is Dark Verse not Noctua", () => {
    expect(getVerifiedMiscScaling("dante", "Dark Verse", "coneAngle")).toBeNull();
    expect(getVerifiedMiscScaling("dante", "Dark Verse", "slashStatuses")).toBeNull();
    expect(getVerifiedMiscScaling("helminth", "Dark Verse", "coneAngle")).toBeNull();
  });

  it("Final Verse Triumph/Tragedy/Pageflight × STR; Wordwarden copy% × STR; vuln dur × DUR", () => {
    expect(getVerifiedMiscScaling("dante", "Final Verse", "overguardGain")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Final Verse", "statusDetonationMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Final Verse", "damageCopied")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Final Verse", "statusChanceVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Final Verse", "statusVulnerabilityDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("dante", "Final Verse", "paragrimmLimit")).toBeNull();
    expect(getVerifiedMiscScaling("dante", "Final Verse", "invulnerabilityDuration")).toBeNull();
  });

  it("Chyrinka Pillar empowered duration × DUR; slow/intervals Misc-fixed; Helminth is Pillar", () => {
    expect(getVerifiedMiscScaling("qorvex", "Chyrinka Pillar", "empoweredDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("helminth", "Chyrinka Pillar", "empoweredDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("qorvex", "Chyrinka Pillar", "slowPercent")).toBeNull();
    expect(getVerifiedMiscScaling("qorvex", "Chyrinka Pillar", "pulseInterval")).toBeNull();
    expect(getVerifiedMiscScaling("qorvex", "Chyrinka Pillar", "maxPillars")).toBeNull();
  });

  it("Containment Wall tick Radiation + vulnerability × STR; assembly Misc-fixed", () => {
    expect(getVerifiedMiscScaling("qorvex", "Containment Wall", "radiationDamagePerTick")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("qorvex", "Containment Wall", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("qorvex", "Containment Wall", "radiationTicks")).toBeNull();
    expect(getVerifiedMiscScaling("qorvex", "Containment Wall", "assemblyTime")).toBeNull();
  });

  it("Disometric Guard status stacks × STR; cast radius/chance Misc-fixed", () => {
    expect(getVerifiedMiscScaling("qorvex", "Disometric Guard", "initialStatusStacks")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("qorvex", "Disometric Guard", "maxStatusStacks")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("qorvex", "Disometric Guard", "damageRadius")).toBeNull();
    expect(getVerifiedMiscScaling("qorvex", "Disometric Guard", "stackChancePerStatus")).toBeNull();
  });

  it("Crucible Blast explosion × STR; beam cylinder Misc-fixed", () => {
    expect(getVerifiedMiscScaling("qorvex", "Crucible Blast", "explosionDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("qorvex", "Crucible Blast", "explosionDamagePerStatus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("qorvex", "Crucible Blast", "beamRadius")).toBeNull();
    expect(getVerifiedMiscScaling("qorvex", "Crucible Blast", "beamDuration")).toBeNull();
  });

  it("Ophidian Bite heal conversion × STR; cone Misc-fixed", () => {
    expect(getVerifiedMiscScaling("lavos", "Ophidian Bite", "healthConversion")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("lavos", "Ophidian Bite", "coneAngle")).toBeNull();
    expect(getVerifiedMiscScaling("lavos_prime", "Ophidian Bite", "healthConversion")).toEqual({
      scale: "strength",
    });
  });

  it("Vial Rush vial charges × RNG; residue/charge speed Misc-fixed", () => {
    expect(getVerifiedMiscScaling("lavos", "Vial Rush", "vialCharges")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("helminth", "Vial Rush", "vialCharges")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("lavos", "Vial Rush", "residueRadius")).toBeNull();
    expect(getVerifiedMiscScaling("lavos", "Vial Rush", "chargeSpeed")).toBeNull();
  });

  it("Transmutation Probe CDR × EFF; probe lifetime / speed Misc-fixed", () => {
    expect(getVerifiedMiscScaling("lavos", "Transmutation Probe", "cooldownReduction")).toEqual({
      scale: "efficiency",
    });
    expect(getVerifiedMiscScaling("lavos", "Transmutation Probe", "probeDuration")).toBeNull();
    expect(getVerifiedMiscScaling("lavos", "Transmutation Probe", "probeSpeed")).toBeNull();
    expect(getVerifiedMiscScaling("lavos", "Transmutation Probe", "haltDelay")).toBeNull();
  });

  it("Catalyze probe speed × RNG; gel mist / +100% per status Misc-fixed", () => {
    expect(getVerifiedMiscScaling("lavos", "Catalyze", "probeSpeed")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("lavos", "Catalyze", "gelMistReach")).toBeNull();
    expect(getVerifiedMiscScaling("lavos", "Catalyze", "probeCount")).toBeNull();
    expect(getVerifiedMiscScaling("lavos", "Catalyze", "damagePerStatus")).toBeNull();
  });

  it("Wrathful Advance flat final melee CC × STR; Helminth reduced base", () => {
    expect(getVerifiedMiscScaling("kullervo", "Wrathful Advance", "criticalChanceBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Wrathful Advance", "criticalChanceBonus")).toEqual({
      scale: "strength",
    });
  });

  it("Recompense heal/miss drain/OG cap × STR; dagger counts Misc-fixed", () => {
    expect(getVerifiedMiscScaling("kullervo", "Recompense", "healthPerHit")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("kullervo", "Recompense", "missDrain")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("kullervo", "Recompense", "overguardCap")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("kullervo", "Recompense", "daggerCount")).toBeNull();
    expect(getVerifiedMiscScaling("kullervo", "Recompense", "daggerAirtime")).toBeNull();
  });

  it("Collective Curse redirection × STR (cap 100%); cone Misc-fixed", () => {
    expect(getVerifiedMiscScaling("kullervo", "Collective Curse", "damageRedirection")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("kullervo", "Collective Curse", "coneAngle")).toBeNull();
  });

  it("Reap vulnerability × STR; debuff duration × DUR; Death Well Misc-fixed", () => {
    expect(getVerifiedMiscScaling("sevagoth", "Reap", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("sevagoth", "Reap", "debuffDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("sevagoth", "Reap", "deathWellGain")).toBeNull();
    expect(getVerifiedMiscScaling("sevagoth_prime", "Reap", "damageVulnerability")).toEqual({
      scale: "strength",
    });
  });

  it("Gloom slow/lifesteal × STR; radii × RNG; range growth × DUR", () => {
    expect(getVerifiedMiscScaling("sevagoth", "Gloom", "slowPercent")).toEqual({
      scale: "strength",
      useSiblingSlowCap: true,
    });
    expect(getVerifiedMiscScaling("sevagoth", "Gloom", "lifeStealPercent")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("sevagoth", "Gloom", "minRadius")).toEqual({ scale: "range" });
    expect(getVerifiedMiscScaling("sevagoth", "Gloom", "maxRadius")).toEqual({ scale: "range" });
    expect(getVerifiedMiscScaling("sevagoth", "Gloom", "rangeGrowthPerSecond")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("sevagoth", "Gloom", "energyDrainPerEnemy")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("helminth", "Gloom", "energyDrainPerEnemy")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("helminth", "Gloom", "slowPercent")).toEqual({
      scale: "strength",
      useSiblingSlowCap: true,
    });
  });

  it("Wyrd Scythes slow/throw × STR; Helminth reduced slow base", () => {
    expect(getVerifiedMiscScaling("dagath", "Wyrd Scythes", "slowPercent")).toEqual({
      scale: "strength",
      useSiblingSlowCap: true,
    });
    expect(getVerifiedMiscScaling("dagath", "Wyrd Scythes", "throwDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dagath", "Wyrd Scythes", "sickleCount")).toBeNull();
    expect(getVerifiedMiscScaling("helminth", "Wyrd Scythes", "slowPercent")).toEqual({
      scale: "strength",
      useSiblingSlowCap: true,
    });
  });

  it("Grave Spirit crit damage × STR; Cavalry strip × STR", () => {
    expect(getVerifiedMiscScaling("dagath", "Grave Spirit", "critDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dagath", "Grave Spirit", "doomCritDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dagath", "Grave Spirit", "cooldown")).toBeNull();
    expect(getVerifiedMiscScaling("dagath", "Rakhali's Cavalry", "defenseReduction")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dagath", "Rakhali's Cavalry", "kaitheCount")).toBeNull();
  });

  it("Sentient Wrath vulnerability × STR; Fusion Strike strip/detonation × STR", () => {
    expect(getVerifiedMiscScaling("caliban", "Sentient Wrath", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("caliban_prime", "Sentient Wrath", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Sentient Wrath", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("caliban", "Fusion Strike", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("caliban", "Fusion Strike", "detonationDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("caliban", "Fusion Strike", "streamCount")).toBeNull();
    expect(getVerifiedMiscScaling("caliban", "Lethal Progeny", "damageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("caliban", "Lethal Progeny", "maxConculysts")).toBeNull();
  });

  it("Baruuk Elude angle × RNG; Desolate Hands charges × STR; Storm DR × STR", () => {
    expect(getVerifiedMiscScaling("baruuk", "Elude", "evasionAngle")).toEqual({ scale: "range" });
    expect(getVerifiedMiscScaling("baruuk", "Elude", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("baruuk", "Lull", "waveDuration")).toEqual({ scale: "duration" });
    expect(getVerifiedMiscScaling("helminth", "Lull", "waveDuration")).toEqual({ scale: "duration" });
    expect(getVerifiedMiscScaling("baruuk", "Desolate Hands", "daggerCharges")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("baruuk", "Desolate Hands", "damageReductionPerDagger")).toBeNull();
    expect(getVerifiedFieldScaling("baruuk", "Serene Storm", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedFieldScaling("baruuk_prime", "Serene Storm", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
  });

  it("Harrow Condemn/Penance/Thurible/Covenant scaling", () => {
    expect(getVerifiedMiscScaling("harrow", "Condemn", "shieldsPerEnemy")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Condemn", "shieldsPerEnemy")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("harrow", "Condemn", "waveWidth")).toBeNull();
    expect(getVerifiedMiscScaling("harrow", "Penance", "fireRateBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("harrow", "Penance", "reloadBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("harrow", "Penance", "maxDuration")).toBeNull();
    expect(getVerifiedMiscScaling("harrow", "Thurible", "energyConvert")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("harrow", "Covenant", "baseCriticalChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("harrow", "Covenant", "critChanceDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("harrow_prime", "Penance", "lifeStealPercent")).toEqual({
      scale: "strength",
    });
  });

  it("Garuda Mirror/Altar/Talons × STR; Bloodletting energy × EFF", () => {
    expect(getVerifiedMiscScaling("garuda", "Dread Mirror", "damageCaptureMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("garuda", "Dread Mirror", "instantKillThreshold")).toBeNull();
    expect(getVerifiedMiscScaling("garuda", "Blood Altar", "healthPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Blood Altar", "healthPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("garuda", "Blood Altar", "maxAltars")).toBeNull();
    expect(getVerifiedMiscScaling("garuda", "Bloodletting", "energyGainPercent")).toEqual({
      scale: "efficiency",
    });
    expect(getVerifiedMiscScaling("garuda", "Bloodletting", "healthDeducted")).toBeNull();
    expect(getVerifiedMiscScaling("garuda", "Bloodletting", "minimumHealth")).toBeNull();
    expect(getVerifiedMiscScaling("garuda", "Seeking Talons", "slashStatusChance")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("garuda", "Seeking Talons", "initialProjectiles")).toBeNull();
    expect(getVerifiedMiscScaling("garuda_prime", "Blood Altar", "healthPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("garuda_prime", "Bloodletting", "energyGainPercent")).toEqual({
      scale: "efficiency",
    });
  });

  it("Nezha Fire Walker / Chakram / Halo / Spears scaling", () => {
    expect(getVerifiedMiscScaling("nezha", "Fire Walker", "explosionDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nezha", "Fire Walker", "flameDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("nezha", "Fire Walker", "speedBuff")).toBeNull();
    expect(getVerifiedMiscScaling("helminth", "Fire Walker", "explosionDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nezha", "Blazing Chakram", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nezha", "Blazing Chakram", "boostedDamage")).toEqual({
      scale: "strength",
    });
    // haloHealth / armor / absorb mults Misc-fixed; Initial Health via computeArmorScaledPool
    expect(getVerifiedMiscScaling("nezha", "Warding Halo", "haloHealth")).toBeNull();
    expect(getVerifiedMiscScaling("nezha", "Warding Halo", "armorMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("nezha", "Warding Halo", "absorptionMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("nezha", "Warding Halo", "invulnerabilityDuration")).toBeNull();
    expect(getVerifiedMiscScaling("nezha_prime", "Warding Halo", "armorMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("nezha", "Divine Spears", "slamDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nezha_prime", "Divine Spears", "slamDamage")).toEqual({
      scale: "strength",
    });
  });

  it("Tharros Strike 50% strip × STR; Helminth is Tharros (not Rally Point)", () => {
    expect(getVerifiedMiscScaling("styanax", "Tharros Strike", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("styanax", "Tharros Strike", "healthPerHit")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Tharros Strike", "shieldStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("helminth", "Rally Point", "energyRegen")).toBeNull();
    expect(getVerifiedMiscScaling("styanax", "Rally Point", "energyRegen")).toEqual({
      scale: "strength",
    });
  });

  it("Voruna Shroud CD × STR; Lycath extension × DUR; Helminth is Lycath", () => {
    expect(getVerifiedMiscScaling("voruna", "Shroud Of Dynar", "critDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("voruna", "Shroud Of Dynar", "durationExtension")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("voruna", "Shroud Of Dynar", "speedBuff")).toBeNull();
    expect(getVerifiedMiscScaling("voruna", "Lycath's Hunt", "durationExtension")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("helminth", "Lycath's Hunt", "durationExtension")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("helminth", "Shroud Of Dynar", "critDamageBonus")).toBeNull();
  });

  it("Nekros Shadows bonuses × STR; Desecrate drop chances Misc-fixed; corpse cost × EFF", () => {
    expect(getVerifiedMiscScaling("nekros", "Shadows Of The Dead", "damageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nekros", "Shadows Of The Dead", "healthBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nekros", "Shadows Of The Dead", "healthDecayPerSecond")).toEqual({
      scale: "duration",
      inverse: true,
    });
    expect(getVerifiedMiscScaling("nekros", "Desecrate", "healthOrbChance")).toBeNull();
    expect(getVerifiedMiscScaling("nekros", "Desecrate", "energyPerCorpse")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("nekros_prime", "Shadows Of The Dead", "shieldBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nekros", "Terrify", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
  });

  it("Hydroid Plunder armor/Corrosive bonus × STR; Tentacle overguard dmg × STR", () => {
    expect(getVerifiedMiscScaling("hydroid", "Plunder", "armorPerEnemy")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("hydroid", "Plunder", "corrosiveBonusPerEnemy")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("hydroid", "Plunder", "armorCap")).toBeNull();
    expect(getVerifiedMiscScaling("hydroid", "Tentacle Swarm", "overguardContactDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("hydroid", "Tentacle Swarm", "tentacleCount")).toBeNull();
    expect(getVerifiedMiscScaling("hydroid_prime", "Plunder", "armorPerCorrosiveStatus")).toEqual({
      scale: "strength",
    });
  });

  it("Limbo Rift Surge banish duration × DUR; Cataclysm final radius × RNG", () => {
    expect(getVerifiedMiscScaling("limbo", "Rift Surge", "banishDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("limbo", "Rift Surge", "transitionalDamage")).toBeNull();
    expect(getVerifiedMiscScaling("limbo", "Cataclysm", "finalRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("limbo_prime", "Cataclysm", "finalRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("limbo", "Stasis", "gunfireObjectLimit")).toBeNull();
  });

  it("Loki Decoy absorb × STR; Switch Teleport speed × STR", () => {
    expect(getVerifiedMiscScaling("loki", "Decoy", "healthShieldAbsorb")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Decoy", "healthShieldAbsorb")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("loki", "Decoy", "decoyHealth")).toBeNull();
    expect(getVerifiedMiscScaling("loki", "Switch Teleport", "speedBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("loki_prime", "Switch Teleport", "speedBuff")).toEqual({
      scale: "strength",
    });
  });

  it("Mag Magnetize/Polarize/Crush scaling", () => {
    expect(getVerifiedMiscScaling("mag", "Magnetize", "damageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mag", "Magnetize", "magneticPull")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mag", "Polarize", "explosionDamageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mag", "Polarize", "shardDamage")).toBeNull();
    expect(getVerifiedMiscScaling("mag", "Crush", "magnetizeExtraDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mag", "Crush", "shieldsPerHit")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mag_prime", "Crush", "shieldsPerHitCap")).toBeNull();
  });

  it("Frost Freeze/Ice Wave/Snow Globe/Avalanche scaling", () => {
    expect(getVerifiedMiscScaling("frost", "Freeze", "areaDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("frost", "Ice Wave", "waveAngle")).toEqual({
      scale: "range",
      cap: 60,
    });
    expect(getVerifiedMiscScaling("frost", "Ice Wave", "initialWidth")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("helminth", "Ice Wave", "waveAngle")).toEqual({
      scale: "range",
      cap: 60,
    });
    expect(getVerifiedMiscScaling("frost", "Snow Globe", "breakDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("frost", "Snow Globe", "armorMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("frost", "Avalanche", "shatterDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("frost", "Avalanche", "shatterRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("frost", "Avalanche", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("frost_prime", "Avalanche", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
  });

  it("Gara Splinter Storm / Spectrorage / Mass Vitrify scaling", () => {
    expect(getVerifiedMiscScaling("gara", "Splinter Storm", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gara", "Splinter Storm", "absorbedDamage")).toBeNull();
    expect(getVerifiedFieldScaling("gara", "Splinter Storm", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedMiscScaling("gara", "Spectrorage", "collapseDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("gara", "Spectrorage", "mirrorCount")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("helminth", "Spectrorage", "charmRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("gara", "Mass Vitrify", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    // segmentHealth / armorMult Misc-fixed; Initial Segment Health via computeArmorScaledPool
    expect(getVerifiedMiscScaling("gara", "Mass Vitrify", "segmentHealth")).toBeNull();
    expect(getVerifiedMiscScaling("gara", "Mass Vitrify", "armorMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("gara_prime", "Mass Vitrify", "explosionRange")).toEqual({
      scale: "range",
    });
  });

  it("Equinox Metamorphosis / Rest & Rage / Pacify / Mend scaling", () => {
    expect(getVerifiedMiscScaling("equinox", "Metamorphosis", "nightArmor")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("equinox", "Metamorphosis", "dayDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("equinox", "Rest & Rage", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Rest & Rage", "enemySpeedBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("equinox", "Rest & Rage", "wakeupHealthThreshold")).toBeNull();
    expect(getVerifiedMiscScaling("equinox", "Pacify & Provoke", "abilityStrengthBonus")).toEqual({
      scale: "strength",
      cap: 0.5,
    });
    expect(getVerifiedMiscScaling("equinox", "Pacify & Provoke", "pacifyDamageReduction")).toEqual({
      scale: "strength",
      formula: "one_minus_base_over_attr",
    });
    expect(getVerifiedMiscScaling("equinox", "Pacify & Provoke", "energyDrainPerEnemy")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("equinox", "Pacify & Provoke", "energyPerAbility")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("equinox_prime", "Pacify & Provoke", "pacifyDamageReduction")).toEqual({
      scale: "strength",
      formula: "one_minus_base_over_attr",
    });
    expect(getVerifiedMiscScaling("equinox", "Mend & Maim", "shieldsPerKill")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("equinox", "Mend & Maim", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("equinox_prime", "Mend & Maim", "damageConversion")).toBeNull();
  });

  it("Ivara Quiver / Navigator / Prowl scaling", () => {
    expect(getVerifiedMiscScaling("ivara", "Quiver", "noiseRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("ivara", "Quiver", "sleepDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("helminth", "Quiver", "noiseRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("ivara", "Quiver", "ziplineRange")).toBeNull();
    expect(getVerifiedMiscScaling("ivara", "Navigator", "maxDamageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("ivara", "Navigator", "multiplierGrowth")).toEqual({
      scale: "duration",
      inverse: true,
    });
    expect(getVerifiedMiscScaling("ivara", "Navigator", "energyDrainGrowth")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("ivara", "Prowl", "headshotBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("ivara", "Prowl", "lootChance")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("ivara", "Prowl", "stealTime")).toEqual({
      scale: "duration",
      inverse: true,
    });
    expect(getVerifiedMiscScaling("ivara", "Prowl", "meleeEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("ivara", "Prowl", "damageEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("ivara_prime", "Prowl", "stealTime")).toEqual({
      scale: "duration",
      inverse: true,
    });
  });

  it("Ash Teleport finisher bonus × STR; Blade Storm mark cost × EFF", () => {
    expect(getVerifiedMiscScaling("ash", "Teleport", "finisherDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("ash", "Teleport", "energyRefund")).toBeNull();
    expect(getVerifiedMiscScaling("ash", "Blade Storm", "energyPerMark")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("ash_prime", "Blade Storm", "energyPerMark")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("ash_prime", "Teleport", "finisherDamageBonus")).toEqual({
      scale: "strength",
    });
  });

  it("Atlas Landslide / Tectonics / Petrify / Rumblers scaling", () => {
    expect(getVerifiedMiscScaling("atlas", "Landslide", "hit2Radius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("atlas", "Tectonics", "rollDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("atlas", "Tectonics", "armorMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("atlas", "Petrify", "rumblerHeal")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Petrify", "rumblerHeal")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("atlas", "Petrify", "damageVulnerability")).toBeNull();
    expect(getVerifiedMiscScaling("atlas", "Rumblers", "rockDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("atlas", "Rumblers", "blastDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("atlas_prime", "Rumblers", "speedMultiplier")).toEqual({
      scale: "range",
      cap: 1.5,
    });
  });

  it("Banshee Sonar mult × STR; Silence stun Misc-fixed", () => {
    expect(getVerifiedMiscScaling("banshee", "Sonar", "damageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("banshee", "Sonar", "propagationSpeed")).toBeNull();
    expect(getVerifiedMiscScaling("banshee", "Silence", "stunDuration")).toBeNull();
    expect(getVerifiedMiscScaling("banshee_prime", "Sonar", "damageMultiplier")).toEqual({
      scale: "strength",
    });
  });

  it("Revenant Mesmer / Reave / Danse / Enthrall scaling", () => {
    expect(getVerifiedMiscScaling("revenant", "Mesmer Skin", "charges")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("revenant", "Mesmer Skin", "stunDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("revenant", "Reave", "hitpointsDrain")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("revenant", "Reave", "thrallHitpointsDrain")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Reave", "hitpointsDrain")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Reave", "thrallHitpointsDrain")).toBeNull();
    expect(getVerifiedMiscScaling("revenant", "Danse Macabre", "boostedDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("revenant", "Danse Macabre", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("revenant", "Danse Macabre", "boostedEnergyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("revenant", "Enthrall", "pillarRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("revenant_prime", "Enthrall", "projectileDamage")).toEqual({
      scale: "strength",
    });
  });

  it("Oberon Smite / Renewal / Reckoning scaling", () => {
    expect(getVerifiedMiscScaling("oberon", "Smite", "percentageDamage")).toEqual({
      scale: "strength",
      cap: 0.75,
    });
    expect(getVerifiedMiscScaling("helminth", "Smite", "percentageDamage")).toEqual({
      scale: "strength",
      cap: 0.5,
    });
    expect(getVerifiedMiscScaling("oberon", "Renewal", "armorBuff")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("oberon", "Renewal", "healthPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("oberon", "Renewal", "bleedoutSlow")).toEqual({
      scale: "duration",
      cap: 0.9,
    });
    expect(getVerifiedMiscScaling("oberon", "Reckoning", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("oberon", "Reckoning", "radiationBonusDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("oberon_prime", "Reckoning", "healthOrbChance")).toBeNull();
  });

  it("Octavia Mallet / Resonator / Metronome / Amp scaling", () => {
    expect(getVerifiedMiscScaling("octavia", "Mallet", "damageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("octavia", "Resonator", "maxCharmRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("helminth", "Resonator", "maxCharmRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("octavia", "Metronome", "armorBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("octavia", "Metronome", "multishotBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("octavia", "Metronome", "buffDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("octavia", "Amp", "maxDamageBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedFieldScaling("octavia", "Amp", "damageBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("octavia_prime", "Amp", "malletRangeBonus")).toBeNull();
  });

  it("Trinity Well of Life / Vampire / Link / Blessing scaling", () => {
    expect(getVerifiedMiscScaling("trinity", "Well Of Life", "healthPerSecond")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Well of Life", "lifesteal")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("trinity", "Energy Vampire", "energyPerPulse")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("trinity", "Energy Vampire", "pulseInterval")).toEqual({
      scale: "duration",
      inverse: true,
      floor: 0.5,
    });
    expect(getVerifiedMiscScaling("trinity_prime", "Energy Vampire", "pulseInterval")).toEqual({
      scale: "duration",
      inverse: true,
      floor: 0.5,
    });
    expect(getVerifiedMiscScaling("trinity", "Link", "affectedEnemies")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("trinity", "Link", "damageRedirection")).toBeNull();
    expect(getVerifiedMiscScaling("trinity", "Blessing", "healthShieldRestore")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedFieldScaling("trinity", "Blessing", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedMiscScaling("trinity_prime", "Blessing", "affinityRange")).toBeNull();
  });

  it("Nova Null Star / Antimatter / Molecular Prime scaling", () => {
    expect(getVerifiedMiscScaling("nova", "Null Star", "particles")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("nova", "Null Star", "damageReductionPerParticle")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Null Star", "damageReductionPerParticle")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nova", "Antimatter Drop", "absorbMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nova", "Molecular Prime", "slow")).toEqual({
      scale: "strength",
      cap: 0.75,
    });
    expect(getVerifiedMiscScaling("nova", "Molecular Prime", "waveDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("nova_prime", "Molecular Prime", "damageVulnerability")).toBeNull();
  });

  it("Volt Speed ally move cap 150%; Electric Shield bonuses fixed", () => {
    expect(getVerifiedMiscScaling("volt", "Speed", "speedBuff")).toEqual({
      scale: "strength",
      cap: 1.5,
    });
    expect(getVerifiedMiscScaling("volt", "Speed", "reloadBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("volt", "Electric Shield", "electricDamageBonus")).toBeNull();
    expect(getVerifiedMiscScaling("volt_prime", "Speed", "speedBuff")).toEqual({
      scale: "strength",
      cap: 1.5,
    });
  });

  it("Valkyr Warcry Affinity AS/armor; Paralysis 400/10m; Hysteria 250/5/s; Helminth AS 30%", () => {
    expect(getVerifiedMiscScaling("valkyr", "Warcry", "attackSpeedBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("valkyr", "Warcry", "armorBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Warcry", "attackSpeedBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("valkyr", "Paralysis", "slowPercent")).toEqual({
      scale: "strength",
      useSiblingSlowCap: true,
    });
    expect(getVerifiedMiscScaling("valkyr", "Hysteria", "healthPerHit")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("valkyr", "Hysteria", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    const valkyr = allWarframes.find((w) => w.id === "valkyr")!;
    const rip = valkyr.abilities.find((a) => a.name === "Rip Line")!;
    expect(rip.damage).toBe(600);
    expect(rip.range).toBe(75);
    expect(rip.miscStats?.pullRadius).toBe(9);
    const warcry = valkyr.abilities.find((a) => a.name === "Warcry")!;
    expect(warcry.duration).toBe(20);
    expect(warcry.range).toBeUndefined();
    expect(warcry.miscStats).toMatchObject({ attackSpeedBuff: 0.5, armorBuff: 0.5 });
    const paralysis = valkyr.abilities.find((a) => a.name === "Paralysis")!;
    expect(paralysis.energyCost).toBe(25);
    expect(paralysis.damage).toBe(400);
    expect(paralysis.range).toBe(10);
    expect(paralysis.duration).toBe(15);
    expect(paralysis.miscStats).toMatchObject({ slowPercent: 0.3, meleeDamageVulnerability: 0.5 });
    const hysteria = valkyr.abilities.find((a) => a.name === "Hysteria")!;
    expect(hysteria.damage).toBe(250);
    expect(hysteria.miscStats).toMatchObject({ energyDrain: 5, healthPerHit: 100 });
    const talons = allWeapons.find((w) => w.id === "talons")!;
    expect(talons.damage).toBe(250);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_valkyr")!;
    expect(helminth.duration).toBe(20);
    expect(helminth.miscStats?.attackSpeedBuff).toBe(0.3);
    expect(helminth.miscStats?.armorBuff).toBe(0.5);
    expect(getVerifiedMiscScaling("valkyr_prime", "Warcry", "armorBuff")).toEqual({
      scale: "strength",
    });
  });

  it("Nidus Larva 12m/Helminth 8m; Ravenous 20 HPS; Parasitic Link stack cost", () => {
    expect(getVerifiedMiscScaling("nidus", "Larva", "mutationStackChance")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("nidus", "Ravenous", "healthRegen")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedFieldScaling("nidus", "Parasitic Link", "damageBuff")).toEqual({
      scale: "strength",
    });
    const nidus = allWarframes.find((w) => w.id === "nidus")!;
    const virulence = nidus.abilities.find((a) => a.name === "Virulence")!;
    expect(virulence.damage).toBe(200);
    expect(virulence.range).toBe(16);
    expect(virulence.damageType).toBe("Puncture");
    expect(virulence.miscStats).toMatchObject({ energyRefundPerHit: 10, width: 4 });
    expect(getVerifiedMiscScaling("nidus", "Virulence", "energyRefundPerHit")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    const larva = nidus.abilities.find((a) => a.name === "Larva")!;
    expect(larva.range).toBe(12);
    expect(larva.duration).toBe(7);
    expect(larva.miscStats?.mutationStackChance).toBe(0.5);
    const link = nidus.abilities.find((a) => a.name === "Parasitic Link")!;
    expect(link.energyCost).toBe(0);
    expect(link.miscStats?.mutationStackCost).toBe(1);
    expect(link.range).toBe(40);
    expect(link.miscStats?.enemyLinkRange).toBe(20);
    const ravenous = nidus.abilities.find((a) => a.name === "Ravenous")!;
    expect(ravenous.damage).toBe(150);
    expect(ravenous.range).toBe(8);
    expect(ravenous.miscStats).toMatchObject({ healthRegen: 20, maggots: 9, explosionRadius: 4 });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_nidus")!;
    expect(helminth.range).toBe(8);
    expect(helminth.duration).toBe(7);
    expect(getVerifiedMiscScaling("nidus_prime", "Larva", "mutationStackChance")).toEqual({
      scale: "strength",
      cap: 1,
    });
  });

  it("Rhino Charge 12m/2m; Iron Skin 1200/2.5× Misc; Stomp 97.5% slow; Helminth Roar 30%", () => {
    // armorMultiplier is Misc-fixed; outer STR applies via computeArmorScaledPool
    expect(getVerifiedMiscScaling("rhino", "Iron Skin", "armorMultiplier")).toBeNull();
    expect(getVerifiedFieldScaling("rhino", "Roar", "damageBuff")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedFieldScaling("helminth", "Roar", "damageBuff")).toEqual({
      scale: "strength",
    });
    const rhino = allWarframes.find((w) => w.id === "rhino")!;
    const charge = rhino.abilities.find((a) => a.name === "Rhino Charge")!;
    expect(charge.damage).toBe(650);
    expect(charge.range).toBe(12);
    expect(charge.radius).toBe(2);
    expect(charge.duration).toBe(1);
    expect(charge.miscStats?.dashSpeed).toBe(48);
    const skin = rhino.abilities.find((a) => a.name === "Iron Skin")!;
    expect(skin.armor).toBe(1200);
    expect(skin.range).toBeUndefined();
    expect(skin.miscStats).toMatchObject({ armorMultiplier: 2.5, invulnerabilityDuration: 3 });
    const roar = rhino.abilities.find((a) => a.name === "Roar")!;
    expect(roar.damageBuff).toBe(0.5);
    expect(roar.range).toBe(25);
    expect(roar.duration).toBe(30);
    const stomp = rhino.abilities.find((a) => a.name === "Rhino Stomp")!;
    expect(stomp.damage).toBe(800);
    expect(stomp.miscStats?.slowPercent).toBe(0.975);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_rhino")!;
    expect(helminth.damageBuff).toBe(0.3);
    expect(helminth.range).toBe(25);
    expect(getVerifiedMiscScaling("rhino_prime", "Iron Skin", "armorMultiplier")).toBeNull();
  });

  it("Mirage Hall clones×STR; Eclipse 25s/drCap 90%; Prism 12s/20 lasers; Helminth Eclipse 25s", () => {
    expect(getVerifiedMiscScaling("mirage", "Hall Of Mirrors", "cloneMeleeDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mirage", "Hall Of Mirrors", "hologramCount")).toBeNull();
    expect(getVerifiedMiscScaling("mirage", "Sleight Of Hand", "jewelCharmRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("mirage", "Prism", "blindDuration")).toEqual({
      scale: "duration",
    });
    const mirage = allWarframes.find((w) => w.id === "mirage")!;
    const hall = mirage.abilities.find((a) => a.name === "Hall Of Mirrors")!;
    expect(hall.duration).toBe(25);
    expect(hall.range).toBeUndefined();
    expect(hall.miscStats).toMatchObject({ hologramCount: 4, cloneRangedDamage: 0.4 });
    const sleight = mirage.abilities.find((a) => a.name === "Sleight Of Hand")!;
    expect(sleight.damage).toBe(200);
    expect(sleight.range).toBe(40);
    expect(sleight.duration).toBe(18);
    const eclipse = mirage.abilities.find((a) => a.name === "Eclipse")!;
    expect(eclipse.duration).toBe(25);
    expect(eclipse.damageBuff).toBe(2);
    expect(eclipse.damageReduction).toBe(0.75);
    expect(eclipse.miscStats?.drCap).toBe(0.9);
    expect(eclipse.range).toBeUndefined();
    const prism = mirage.abilities.find((a) => a.name === "Prism")!;
    expect(prism.damage).toBe(250);
    expect(prism.duration).toBe(12);
    expect(prism.range).toBe(30);
    expect(prism.radius).toBe(25);
    expect(prism.miscStats).toMatchObject({ energyDrain: 10, laserCount: 20, blindDuration: 15 });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_mirage")!;
    expect(helminth.duration).toBe(25);
    expect(helminth.damageBuff).toBe(0.3);
    expect(helminth.energyCost).toBe(50);
    expect(getVerifiedMiscScaling("mirage_prime", "Hall Of Mirrors", "cloneRangedDamage")).toEqual({
      scale: "strength",
    });
  });

  it("Mesa Ballistic Battery store×STR; Peacemaker bonuses; Shatter DR cap 95%", () => {
    expect(getVerifiedMiscScaling("mesa", "Ballistic Battery", "damagePercentage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mesa", "Ballistic Battery", "maxStoredDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mesa", "Peacemaker", "damageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mesa", "Peacemaker", "rampUpDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("mesa", "Peacemaker", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedFieldScaling("mesa", "Shatter Shield", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedFieldScaling("mesa", "Shooting Gallery", "damageBuff")).toEqual({
      scale: "strength",
    });
    const mesa = allWarframes.find((w) => w.id === "mesa")!;
    const battery = mesa.abilities.find((a) => a.name === "Ballistic Battery")!;
    expect(battery.range).toBeUndefined();
    expect(battery.miscStats).toMatchObject({
      damagePercentage: 0.7,
      maxDamagePerInstance: 140,
      maxStoredDamage: 5000,
    });
    const gallery = mesa.abilities.find((a) => a.name === "Shooting Gallery")!;
    expect(gallery.damageBuff).toBe(0.25);
    expect(gallery.range).toBe(16);
    expect(gallery.duration).toBe(30);
    const peace = mesa.abilities.find((a) => a.name === "Peacemaker")!;
    expect(peace.damage).toBe(50);
    expect(peace.range).toBeUndefined();
    expect(peace.miscStats).toMatchObject({
      energyDrain: 15,
      damageBonus: 1.5,
      maxShootingDistance: 50,
      minFov: 15,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_mesa")!;
    expect(helminth.damageBuff).toBe(0.25);
    expect(helminth.range).toBe(16);
    expect(getVerifiedMiscScaling("mesa_prime", "Ballistic Battery", "maxStoredDamage")).toEqual({
      scale: "strength",
    });
  });

  it("Nyx Psychic Bolts strip; Absorb min radius/duration; Helminth Mind Control 60s", () => {
    expect(getVerifiedMiscScaling("nyx", "Psychic Bolts", "defenseStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("nyx", "Psychic Bolts", "infestedSlow")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nyx", "Psychic Bolts", "boltCount")).toBeNull();
    expect(getVerifiedMiscScaling("nyx", "Absorb", "absorbDuration")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("nyx", "Absorb", "weaponDamageConvert")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nyx", "Absorb", "weaponDamageCap")).toBeNull();
    expect(getVerifiedMiscScaling("nyx_prime", "Absorb", "weaponDamageConvert")).toEqual({
      scale: "strength",
    });
    const nyx = allWarframes.find((w) => w.id === "nyx")!;
    const mind = nyx.abilities.find((a) => a.name === "Mind Control")!;
    expect(mind.range).toBe(60);
    expect(mind.duration).toBe(60);
    expect(mind.miscStats).toMatchObject({ initialDamageBonus: 7.5, maxTargets: 1 });
    const bolts = nyx.abilities.find((a) => a.name === "Psychic Bolts")!;
    expect(bolts.range).toBeUndefined();
    expect(bolts.duration).toBe(11);
    expect(bolts.miscStats).toMatchObject({
      boltCount: 6,
      defenseStrip: 0.8,
      targetingRange: 60,
      armorSteal: 25,
    });
    const chaos = nyx.abilities.find((a) => a.name === "Chaos")!;
    expect(chaos.range).toBe(25);
    expect(chaos.duration).toBe(25);
    expect(chaos.miscStats).toMatchObject({ radiationStacks: 10 });
    const absorb = nyx.abilities.find((a) => a.name === "Absorb")!;
    expect(absorb.damage).toBe(1500);
    expect(absorb.range).toBe(15);
    expect(absorb.duration).toBe(8);
    expect(absorb.miscStats).toMatchObject({
      absorbDuration: 5,
      maxRadius: 50,
      weaponDamageCap: 4,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_nyx")!;
    expect(helminth.duration).toBe(60);
    expect(helminth.range).toBe(60);
    expect(getVerifiedMiscScaling("nyx_prime", "Psychic Bolts", "defenseStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
  });

  it("Zephyr Tail Wind dive bomb; Turbulence 6m/20s; Tornado 640 DPS; Helminth Airburst", () => {
    expect(getVerifiedMiscScaling("zephyr", "Tail Wind", "diveBombDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("zephyr", "Tail Wind", "airborneEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("zephyr", "Tornado", "tickDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("zephyr", "Airburst", "airborneEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("zephyr", "Airburst", "damageGrowthPerEnemy")).toBeNull();
    const zephyr = allWarframes.find((w) => w.id === "zephyr")!;
    const dash = zephyr.abilities.find((a) => a.name === "Tail Wind")!;
    expect(dash.damage).toBe(750);
    expect(dash.range).toBe(2);
    expect(dash.radius).toBe(7);
    expect(dash.miscStats).toMatchObject({
      diveBombDamage: 4500,
      airSpeed: 30,
      energyDrain: 5,
      airborneEnergyCost: 12.5,
    });
    const burst = zephyr.abilities.find((a) => a.name === "Airburst")!;
    expect(burst.damage).toBe(500);
    expect(burst.range).toBe(8);
    expect(burst.miscStats).toMatchObject({
      damageGrowthPerEnemy: 0.35,
      statusChance: 0.5,
      airborneEnergyCost: 25,
    });
    const turb = zephyr.abilities.find((a) => a.name === "Turbulence")!;
    expect(turb.range).toBe(6);
    expect(turb.duration).toBe(20);
    const tornado = zephyr.abilities.find((a) => a.name === "Tornado")!;
    expect(tornado.damagePerSecond).toBe(640);
    expect(tornado.range).toBe(25);
    expect(tornado.duration).toBe(20);
    expect(tornado.miscStats).toMatchObject({ tickDamage: 160, tornadoCount: 3, pullRadius: 10 });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_zephyr")!;
    expect(helminth.energyCost).toBe(50);
    expect(helminth.damage).toBe(500);
    expect(helminth.range).toBe(8);
    expect(getVerifiedMiscScaling("zephyr_prime", "Tail Wind", "diveBombDamage")).toEqual({
      scale: "strength",
    });
  });

  it("Wisp Reservoirs STR motes; Breach Surge multiplier; Sol Gate DPS; Helminth range 18", () => {
    expect(getVerifiedMiscScaling("wisp", "Reservoirs", "vitalityHealth")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wisp", "Reservoirs", "hasteFireRate")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wisp", "Reservoirs", "shockRange")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("wisp", "Reservoirs", "maxReservoirs")).toBeNull();
    expect(getVerifiedMiscScaling("wisp", "Breach Surge", "sparkDamageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wisp", "Breach Surge", "radiationStatusChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wisp", "Breach Surge", "sparkSeekRange")).toBeNull();
    expect(getVerifiedMiscScaling("helminth", "Breach Surge", "sparkDamageMultiplier")).toEqual({
      scale: "strength",
    });
    const wisp = allWarframes.find((w) => w.id === "wisp")!;
    const reservoirs = wisp.abilities.find((a) => a.name === "Reservoirs")!;
    expect(reservoirs.range).toBe(5);
    expect(reservoirs.duration).toBe(30);
    expect(reservoirs.miscStats).toMatchObject({
      vitalityHealth: 300,
      vitalityHealPerSecond: 30,
      hasteFireRate: 0.3,
      shockDamage: 10,
      shockRange: 15,
      maxReservoirs: 6,
    });
    const wil = wisp.abilities.find((a) => a.name === "Wil-O-Wisp")!;
    expect(wil.range).toBeUndefined();
    expect(wil.duration).toBe(4);
    expect(wil.miscStats).toMatchObject({ teleportInvulnerability: 3 });
    const surge = wisp.abilities.find((a) => a.name === "Breach Surge")!;
    expect(surge.damage).toBeUndefined();
    expect(surge.range).toBe(18);
    expect(surge.miscStats?.sparkDamageMultiplier).toBe(2);
    const gate = wisp.abilities.find((a) => a.name === "Sol Gate")!;
    expect(gate.damagePerSecond).toBe(1500);
    expect(gate.miscStats).toMatchObject({ energyDrain: 12, boostedDamagePerSecond: 3000 });
    expect(getVerifiedMiscScaling("wisp", "Sol Gate", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("wisp", "Sol Gate", "boostedEnergyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("wisp", "Sol Gate", "damageRampCap")).toBeNull();
    expect(getVerifiedMiscScaling("wisp_prime", "Sol Gate", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_wisp")!;
    expect(helminth.range).toBe(18);
    expect(helminth.duration).toBe(16);
    expect(helminth.miscStats?.sparkDamageMultiplier).toBe(2);
    expect(getVerifiedMiscScaling("wisp_prime", "Reservoirs", "vitalityHealth")).toEqual({
      scale: "strength",
    });
  });

  it("Excalibur Slash Dash chain×RNG; Exalted Blade drain/blind; Helminth Blind", () => {
    const excal = allWarframes.find((w) => w.id === "excalibur")!;
    const prime = allWarframes.find((w) => w.id === "excalibur_prime")!;
    const umbra = allWarframes.find((w) => w.id === "excalibur_umbra")!;
    const dash = excal.abilities.find((a) => a.name === "Slash Dash")!;
    expect(dash.damage).toBeUndefined();
    expect(dash.range).toBe(20);
    expect(dash.chainRange).toBe(7);
    const blade = excal.abilities.find((a) => a.name === "Exalted Blade")!;
    expect(blade.damage).toBe(250);
    expect(blade.range).toBe(5);
    expect(blade.duration).toBe(6);
    expect(blade.miscStats).toMatchObject({
      energyDrain: 2.5,
      meleeRange: 2.5,
      waveRange: 70,
      waveSpeed: 30,
      slideEnergyCost: 25,
    });
    expect(getVerifiedMiscScaling("excalibur", "Exalted Blade", "slideEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("excalibur_umbra", "Exalted Blade", "slideEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    const javelin = excal.abilities.find((a) => a.name === "Radial Javelin")!;
    expect(javelin.damage).toBe(1000);
    expect(javelin.range).toBe(25);
    expect(prime.abilities.find((a) => a.name === "Slash Dash")!.chainRange).toBe(7);
    const howl = umbra.abilities.find((a) => a.name === "Radial Howl")!;
    expect(howl.range).toBe(25);
    expect(howl.duration).toBe(15);
    expect(howl.damage).toBeUndefined();
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_excalibur")!;
    expect(helminth.name).toBe("Radial Blind");
    expect(helminth.range).toBe(25);
    expect(helminth.duration).toBe(15);
    expect(helminth.energyCost).toBe(50);
  });

  it("Jade Judgment 500/8% HPS; Symphony 25%/100%; Glory 150/1500/35% DR; Helminth Eyes", () => {
    expect(getVerifiedMiscScaling("jade", "Light's Judgment", "healthRegen")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("jade", "Symphony Of Mercy", "strengthBonus")).toEqual({
      scale: "strength",
      cap: 1.5,
    });
    expect(getVerifiedFieldScaling("jade", "Glory On High", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedMiscScaling("helminth", "Ophanim Eyes", "armorStripPerSecond")).toEqual({
      scale: "strength",
    });
    const jade = allWarframes.find((w) => w.id === "jade")!;
    const judgment = jade.abilities.find((a) => a.name === "Light's Judgment")!;
    expect(judgment.damage).toBe(500);
    expect(judgment.radius).toBe(6);
    expect(judgment.miscStats?.healthRegen).toBe(0.08);
    const symphony = jade.abilities.find((a) => a.name === "Symphony Of Mercy")!;
    expect(symphony.damageBuff).toBe(1);
    expect(symphony.miscStats?.strengthBonus).toBe(0.25);
    const eyes = jade.abilities.find((a) => a.name === "Ophanim Eyes")!;
    expect(eyes.range).toBe(20);
    expect(eyes.miscStats?.armorStripPerSecond).toBe(0.1);
    const glory = jade.abilities.find((a) => a.name === "Glory On High")!;
    expect(glory.damage).toBe(150);
    expect(glory.aoeDamage).toBe(1500);
    expect(glory.damageReduction).toBe(0.35);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_jade")!;
    expect(helminth.name).toBe("Ophanim Eyes");
    expect(helminth.range).toBe(20);
  });

  it("Styanax Axios 1250; Tharros 1000/50%; Rally 50 shields/kill; Final Stand 30 javelins", () => {
    expect(getVerifiedMiscScaling("styanax", "Tharros Strike", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("styanax", "Rally Point", "shieldsPerKill")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("styanax", "Final Stand", "javelins")).toEqual({
      scale: "duration",
    });
    const styanax = allWarframes.find((w) => w.id === "styanax")!;
    const axios = styanax.abilities.find((a) => a.name === "Axios Javelin")!;
    expect(axios.directDamage).toBe(1250);
    expect(axios.aoeDamage).toBe(1250);
    expect(axios.range).toBe(50);
    expect(axios.radius).toBe(15);
    const tharros = styanax.abilities.find((a) => a.name === "Tharros Strike")!;
    expect(tharros.damage).toBe(1000);
    expect(tharros.miscStats?.healthPerHit).toBe(100);
    const rally = styanax.abilities.find((a) => a.name === "Rally Point")!;
    expect(rally.range).toBe(30);
    expect(rally.miscStats).toMatchObject({ energyRegen: 3, shieldsPerKill: 50 });
    const stand = styanax.abilities.find((a) => a.name === "Final Stand")!;
    expect(stand.directDamage).toBe(1500);
    expect(stand.miscStats?.javelins).toBe(30);
    expect(stand.duration).toBeUndefined();
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_styanax")!;
    expect(helminth.name).toBe("Tharros Strike");
    expect(helminth.miscStats?.armorStrip).toBe(0.5);
    expect(getVerifiedMiscScaling("styanax_prime", "Final Stand", "javelins")).toEqual({
      scale: "duration",
    });
  });

  it("Temple Pyro 1000/25m/20m; Overdrive 750/25% crit; Wail 75% Heat/50e; Solo 75e/1.25×", () => {
    expect(getVerifiedMiscScaling("temple", "Overdrive", "criticalChanceVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("temple", "Ripper's Wail", "heatDamageBonus")).toEqual({
      scale: "strength",
      cap: 7.5,
    });
    const temple = allWarframes.find((w) => w.id === "temple")!;
    const pyro = temple.abilities.find((a) => a.name === "Pyrotechnics")!;
    expect(pyro.damage).toBe(1000);
    expect(pyro.range).toBe(25);
    expect(pyro.radius).toBe(20);
    expect(pyro.miscStats?.pillars).toBe(5);
    const overdrive = temple.abilities.find((a) => a.name === "Overdrive")!;
    expect(overdrive.damage).toBe(750);
    expect(overdrive.range).toBe(20);
    expect(overdrive.miscStats?.criticalChanceVulnerability).toBe(0.25);
    const wail = temple.abilities.find((a) => a.name === "Ripper's Wail")!;
    expect(wail.energyCost).toBe(50);
    expect(wail.duration).toBe(30);
    expect(wail.miscStats?.heatDamageBonus).toBe(0.75);
    const solo = temple.abilities.find((a) => a.name === "Exalted Solo")!;
    expect(solo.energyCost).toBe(75);
    expect(solo.miscStats?.damageMultiplier).toBe(1.25);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_temple")!;
    expect(helminth.name).toBe("Pyrotechnics");
    expect(helminth.damage).toBe(1000);
    expect(helminth.radius).toBe(20);
  });

  it("Koumei Kumihimo 25×dice/30m/12s; Omamori 75e heal×STR; Bunraku 500 Puncture/20s; Helminth Omamori 10–20", () => {
    expect(getVerifiedMiscScaling("koumei", "Kumihimo", "threads")).toEqual({ scale: "range" });
    expect(getVerifiedMiscScaling("koumei", "Omamori", "healMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Omamori", "healMultiplier")).toEqual({
      scale: "strength",
    });
    const koumei = allWarframes.find((w) => w.id === "koumei")!;
    const kumi = koumei.abilities.find((a) => a.name === "Kumihimo")!;
    expect(kumi.damage).toBe(25);
    expect(kumi.range).toBe(30);
    expect(kumi.duration).toBe(12);
    expect(kumi.miscStats?.threads).toBe(15);
    const omikuji = koumei.abilities.find((a) => a.name === "Omikuji")!;
    expect(omikuji.range).toBeUndefined();
    expect(omikuji.miscStats?.rareDecreeChance).toBe(0.15);
    const omamori = koumei.abilities.find((a) => a.name === "Omamori")!;
    expect(omamori.energyCost).toBe(75);
    expect(omamori.duration).toBeUndefined();
    expect(omamori.miscStats?.healMultiplier).toBe(1);
    const bunraku = koumei.abilities.find((a) => a.name === "Bunraku")!;
    expect(bunraku.damage).toBe(500);
    expect(bunraku.damageType).toBe("Puncture");
    expect(bunraku.duration).toBe(20);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_koumei")!;
    expect(helminth.energyCost).toBe(75);
    expect(helminth.miscStats).toMatchObject({ minCharms: 10, maxCharms: 20 });
  });

  it("Voidrig Necraweb 2000 Blast; Storm Shroud 1200 HP/2× absorb; Gravemines 200×24; Guard 50e/5eps", () => {
    // shroudHealth Misc-fixed base; Initial Health / absorb via computeArmorScaledPool × STR
    expect(getVerifiedMiscScaling("voidrig", "Storm Shroud", "shroudHealth")).toBeNull();
    expect(getVerifiedMiscScaling("voidrig", "Storm Shroud", "absorptionMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("voidrig", "Gravemines", "charges")).toEqual({
      scale: "duration",
    });
    const voidrig = allWarframes.find((w) => w.id === "voidrig")!;
    const necraweb = voidrig.abilities.find((a) => a.name === "Necraweb")!;
    expect(necraweb.damage).toBe(2000);
    expect(necraweb.radius).toBe(25);
    expect(necraweb.miscStats?.slow).toBe(0.5);
    const shroud = voidrig.abilities.find((a) => a.name === "Storm Shroud")!;
    expect(shroud.energyCost).toBe(50);
    expect(shroud.miscStats).toMatchObject({ shroudHealth: 1200, absorptionMultiplier: 2 });
    const mines = voidrig.abilities.find((a) => a.name === "Gravemines")!;
    expect(mines.energyCost).toBe(75);
    expect(mines.damage).toBe(200);
    expect(mines.miscStats?.charges).toBe(24);
    const guard = voidrig.abilities.find((a) => a.name === "Guard Mode")!;
    expect(guard.energyCost).toBe(50);
    expect(guard.damage).toBe(500);
    expect(guard.miscStats?.energyDrain).toBe(5);
  });

  it("Bonewidow Meathook %HP; Maiden 2000 HP/2× reflect; Firing Line 25m/1.5× vuln; Ironbride 1500/2.5eps", () => {
    expect(getVerifiedMiscScaling("bonewidow", "Meathook", "healthDrainPerSecond")).toEqual({
      scale: "strength",
    });
    // shieldHealth / armorMult Misc-fixed; Initial Health via computeArmorScaledPool
    expect(getVerifiedMiscScaling("bonewidow", "Shield Maiden", "shieldHealth")).toBeNull();
    expect(getVerifiedMiscScaling("bonewidow", "Shield Maiden", "armorMultiplier")).toBeNull();
    expect(getVerifiedMiscScaling("bonewidow", "Shield Maiden", "reflectMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("bonewidow", "Shield Maiden", "kissEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    const bonewidow = allWarframes.find((w) => w.id === "bonewidow")!;
    const hook = bonewidow.abilities.find((a) => a.name === "Meathook")!;
    expect(hook.damage).toBeUndefined();
    expect(hook.radius).toBe(17);
    expect(hook.miscStats).toMatchObject({
      healthDrainPerSecond: 0.2,
      lifesteal: 0.4,
      explosionHealthPercent: 0.5,
    });
    const maiden = bonewidow.abilities.find((a) => a.name === "Shield Maiden")!;
    expect(maiden.energyCost).toBe(25);
    expect(maiden.miscStats).toMatchObject({
      shieldHealth: 2000,
      reflectMultiplier: 2,
      kissEnergyCost: 15,
    });
    const line = bonewidow.abilities.find((a) => a.name === "Firing Line")!;
    expect(line.energyCost).toBe(50);
    expect(line.damage).toBeUndefined();
    expect(line.range).toBe(25);
    expect(line.miscStats?.damageVulnerability).toBe(0.5);
    const iron = bonewidow.abilities.find((a) => a.name === "Exalted Ironbride")!;
    expect(iron.energyCost).toBe(50);
    expect(iron.damage).toBe(1500);
    expect(iron.miscStats?.energyDrain).toBe(2.5);
  });

  it("Helminth Infested Mobility 60%/30%; Energized Munitions 75% ammo/5s; Empower +50% STR", () => {
    expect(getVerifiedMiscScaling("helminth", "Infested Mobility", "sprintSpeedBonus")).toEqual({
      scale: "strength",
    });
    const mobility = allHelminthAbilities.find((h) => h.id === "helminth_infested_mobility")!;
    expect(mobility.duration).toBe(8);
    expect(mobility.miscStats).toMatchObject({
      sprintSpeedBonus: 0.6,
      parkourVelocityBonus: 0.3,
    });
    const munitions = allHelminthAbilities.find((h) => h.id === "helminth_energized_munitions")!;
    expect(munitions.duration).toBe(5);
    expect(munitions.miscStats?.ammoEfficiency).toBe(0.75);
    const empower = allHelminthAbilities.find((h) => h.id === "helminth_empower")!;
    expect(empower.miscStats?.strengthBonus).toBe(0.5);
    const marked = allHelminthAbilities.find((h) => h.id === "helminth_marked_for_death")!;
    expect(marked.miscStats?.damageSpread).toBe(0.75);
  });

  it("Nokko Stinkbrain 250 Viral/5m/25s; Brightbonnet +30% STR/15e; Sporespring 2500 Toxin/75e; Helminth 20%/10e", () => {
    expect(getVerifiedMiscScaling("nokko", "Brightbonnet", "strengthBonus")).toEqual({
      scale: "strength",
      cap: 1.5,
    });
    expect(getVerifiedMiscScaling("helminth", "Brightbonnet", "strengthBonus")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("nokko", "Reroot", "healthShieldPerSecond")).toEqual({
      scale: "strength",
    });
    const nokko = allWarframes.find((w) => w.id === "nokko")!;
    const stink = nokko.abilities.find((a) => a.name === "Stinkbrain")!;
    expect(stink.damage).toBe(250);
    expect(stink.duration).toBe(25);
    expect(stink.radius).toBe(5);
    expect(stink.miscStats?.maxMushrooms).toBe(4);
    const bright = nokko.abilities.find((a) => a.name === "Brightbonnet")!;
    expect(bright.duration).toBe(25);
    expect(bright.radius).toBe(15);
    expect(bright.miscStats).toMatchObject({
      energyRestore: 15,
      strengthBonus: 0.3,
      strengthBonusCap: 1.5,
    });
    const reroot = nokko.abilities.find((a) => a.name === "Reroot")!;
    expect(reroot.energyCost).toBe(50);
    expect(reroot.duration).toBe(10);
    expect(reroot.miscStats).toMatchObject({ healthShieldPerSecond: 10, pickupHeal: 80 });
    const spore = nokko.abilities.find((a) => a.name === "Sporespring")!;
    expect(spore.energyCost).toBe(75);
    expect(spore.damage).toBe(2500);
    expect(spore.damageType).toBe("Toxin");
    expect(spore.radius).toBe(3);
    expect(spore.miscStats?.bounces).toBe(10);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_nokko")!;
    expect(helminth.miscStats).toMatchObject({
      energyRestore: 10,
      strengthBonus: 0.2,
      strengthBonusCap: 1,
    });
  });

  it("Sirius Coronal 1500; Gravitic 2000/50% strip; Stars 500/35s/7; Clash 10k/26m; Helminth Stars", () => {
    expect(getVerifiedMiscScaling("sirius_orion", "Gravitic Slash", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedFieldScaling("sirius_orion", "Light's Sanctuary", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    const sirius = allWarframes.find((w) => w.id === "sirius_orion")!;
    expect(sirius.abilities.find((a) => a.name === "Coronal Ejection")!.damage).toBe(1500);
    const gravitic = sirius.abilities.find((a) => a.name === "Gravitic Slash")!;
    expect(gravitic.damage).toBe(2000);
    expect(gravitic.radius).toBe(8);
    expect(gravitic.miscStats?.armorStrip).toBe(0.5);
    const stars = sirius.abilities.find((a) => a.name === "Jade Stars")!;
    expect(stars.damage).toBe(500);
    expect(stars.duration).toBe(35);
    expect(stars.miscStats?.motes).toBe(7);
    const sanctuary = sirius.abilities.find((a) => a.name === "Light's Sanctuary")!;
    expect(sanctuary.duration).toBe(30);
    expect(sanctuary.damageReduction).toBe(0.45);
    expect(sanctuary.miscStats?.maxHealthRegen).toBe(55);
    const shell = sirius.abilities.find((a) => a.name === "Astral Shell")!;
    expect(shell.duration).toBe(35);
    expect(shell.miscStats?.decoyDamage).toBe(200);
    const horizon = sirius.abilities.find((a) => a.name === "Event Horizon")!;
    expect(horizon.radius).toBe(8);
    expect(horizon.miscStats?.explosionRadius).toBe(12);
    const clash = sirius.abilities.find((a) => a.name === "Celestial Clash")!;
    expect(clash.damage).toBe(10000);
    expect(clash.radius).toBe(26);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_sirius_orion")!;
    expect(helminth.name).toBe("Jade Stars");
    expect(helminth.damage).toBe(500);
    expect(helminth.duration).toBe(35);
  });

  it("Uriel Infernalis 1500/250 DPS; Remedium 50% heal; Demonium 250/50% vuln; Brimstone 1500; Helminth Remedium 35%", () => {
    expect(getVerifiedMiscScaling("uriel", "Infernalis", "catenachSlow")).toEqual({
      scale: "strength",
      cap: 0.95,
    });
    expect(getVerifiedMiscScaling("uriel", "Remedium", "healthRestore")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Remedium", "healthRestore")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("uriel", "Demonium", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    const uriel = allWarframes.find((w) => w.id === "uriel")!;
    const infernalis = uriel.abilities.find((a) => a.name === "Infernalis")!;
    expect(infernalis.damage).toBe(1500);
    expect(infernalis.damagePerSecond).toBe(250);
    expect(infernalis.duration).toBe(35);
    expect(infernalis.radius).toBe(2);
    const remedium = uriel.abilities.find((a) => a.name === "Remedium")!;
    expect(remedium.energyCost).toBe(50);
    expect(remedium.miscStats?.healthRestore).toBe(0.5);
    const demonium = uriel.abilities.find((a) => a.name === "Demonium")!;
    expect(demonium.energyCost).toBe(75);
    expect(demonium.damage).toBe(250);
    expect(demonium.miscStats?.damageVulnerability).toBe(0.5);
    const brimstone = uriel.abilities.find((a) => a.name === "Brimstone")!;
    expect(brimstone.energyCost).toBe(75);
    expect(brimstone.damage).toBe(1500);
    expect(brimstone.radius).toBe(15);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_uriel")!;
    expect(helminth.name).toBe("Remedium");
    expect(helminth.miscStats?.healthRestore).toBe(0.35);
  });

  it("Follie Perspective 750/5m/3.5s invuln; Portrait 50% DR/cap 90%; Plein Air 25k/50% strip; Helminth DR cap 75%", () => {
    expect(getVerifiedFieldScaling("follie", "Self Portrait", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedFieldScaling("helminth", "Self Portrait", "damageReduction")).toEqual({
      scale: "strength",
      useSiblingDrCap: true,
    });
    expect(getVerifiedMiscScaling("follie", "Plein Air", "defenseReduction")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("follie", "Plein Air", "splashRadius")).toEqual({
      scale: "range",
    });
    const follie = allWarframes.find((w) => w.id === "follie")!;
    const perspective = follie.abilities.find((a) => a.name === "Forced Perspective")!;
    expect(perspective.damage).toBe(750);
    expect(perspective.radius).toBe(5);
    expect(perspective.duration).toBeUndefined();
    expect(perspective.miscStats?.invulnerabilityDuration).toBe(3.5);
    const portrait = follie.abilities.find((a) => a.name === "Self Portrait")!;
    expect(portrait.damageReduction).toBe(0.5);
    expect(portrait.radius).toBe(8);
    expect(portrait.miscStats).toMatchObject({ drCap: 0.9, maxRadius: 20, maxDuration: 60 });
    const plein = follie.abilities.find((a) => a.name === "Plein Air")!;
    expect(plein.damage).toBe(25000);
    expect(plein.miscStats?.defenseReduction).toBe(0.5);
    expect(plein.miscStats?.minFallDamage).toBe(250);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_follie")!;
    expect(helminth.damageReduction).toBe(0.5);
    expect(helminth.miscStats?.drCap).toBe(0.75);
    expect(helminth.radius).toBe(8);
  });

  it("Oraxia Kiss 4000/40m/200% orbs; Embrace 250/50% vuln/10m; Brood 750; Stride 2× HP; Helminth 6.67m", () => {
    expect(getVerifiedMiscScaling("oraxia", "Mercy's Kiss", "healthOrbChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("oraxia", "Webbed Embrace", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Webbed Embrace", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("oraxia", "Silken Stride", "healthMultiplier")).toEqual({
      scale: "strength",
    });
    const oraxia = allWarframes.find((w) => w.id === "oraxia")!;
    const kiss = oraxia.abilities.find((a) => a.name === "Mercy's Kiss")!;
    expect(kiss.damage).toBe(4000);
    expect(kiss.range).toBe(40);
    expect(kiss.miscStats?.healthOrbChance).toBe(2);
    const embrace = oraxia.abilities.find((a) => a.name === "Webbed Embrace")!;
    expect(embrace.energyCost).toBe(50);
    expect(embrace.damage).toBe(250);
    expect(embrace.radius).toBe(10);
    expect(embrace.miscStats?.damageVulnerability).toBe(0.5);
    const brood = oraxia.abilities.find((a) => a.name === "Widow's Brood")!;
    expect(brood.damage).toBe(750);
    expect(brood.range).toBe(25);
    expect(brood.miscStats?.scuttlerDuration).toBe(45);
    const stride = oraxia.abilities.find((a) => a.name === "Silken Stride")!;
    expect(stride.miscStats).toMatchObject({
      healthMultiplier: 2,
      toxinWeaponDamage: 0.4,
      energyDrain: 5,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_oraxia")!;
    expect(helminth.radius).toBe(6.67);
    expect(helminth.duration).toBe(25);
    expect(helminth.damage).toBe(250);
  });

  it("Cyte Seek 60m/75% WP; Evade 75e/10s/cap 30; Helminth Evade cap 25 (was Resupply)", () => {
    expect(getVerifiedMiscScaling("cyte_09", "Seek", "weakPointDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("cyte_09", "Resupply", "weaponDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("cyte_09", "Evade", "healthRestore")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Evade", "healthRestore")).toEqual({
      scale: "strength",
    });
    const cyte = allWarframes.find((w) => w.id === "cyte_09")!;
    const seek = cyte.abilities.find((a) => a.name === "Seek")!;
    expect(seek.range).toBe(60);
    expect(seek.duration).toBe(35);
    expect(seek.miscStats?.weakPointDamageBonus).toBe(0.75);
    const resupply = cyte.abilities.find((a) => a.name === "Resupply")!;
    expect(resupply.range).toBeUndefined();
    expect(resupply.miscStats).toMatchObject({
      weaponDamageBonus: 0.25,
      sniperDamageBonus: 0.5,
    });
    const evade = cyte.abilities.find((a) => a.name === "Evade")!;
    expect(evade.energyCost).toBe(75);
    expect(evade.duration).toBe(10);
    expect(evade.miscStats).toMatchObject({ durationCap: 30, healthRestore: 100 });
    const neutralize = cyte.abilities.find((a) => a.name === "Neutralize")!;
    expect(neutralize.energyCost).toBe(5);
    expect(neutralize.miscStats?.damageMultiplier).toBe(1.25);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_cyte_09")!;
    expect(helminth.name).toBe("Evade");
    expect(helminth.energyCost).toBe(75);
    expect(helminth.miscStats?.durationCap).toBe(25);
  });

  it("Ember Fireball 800/300; Inferno 2500/700 DPS/15s; Helminth Fire Blast 25m", () => {
    expect(getVerifiedMiscScaling("ember", "Immolation", "initialDamageReduction")).toEqual({
      scale: "strength",
      cap: 0.5,
    });
    expect(getVerifiedMiscScaling("ember", "Fire Blast", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("ember", "Fire Blast", "maxHeatEnergyCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("helminth", "Fire Blast", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("helminth", "Fire Blast", "maxHeatEnergyCost")).toBeNull();
    const ember = allWarframes.find((w) => w.id === "ember")!;
    const fireball = ember.abilities.find((a) => a.name === "Fireball")!;
    expect(fireball.damage).toBe(800);
    expect(fireball.radius).toBe(3);
    expect(fireball.miscStats?.areaDamage).toBe(300);
    const inferno = ember.abilities.find((a) => a.name === "Inferno")!;
    expect(inferno.energyCost).toBe(0);
    expect(inferno.damage).toBe(2500);
    expect(inferno.damagePerSecond).toBe(700);
    expect(inferno.duration).toBe(15);
    expect(inferno.range).toBe(25);
    expect(inferno.miscStats).toMatchObject({
      ringRadius: 8,
      energyPerEnemy: 10,
      maxEnergyTargets: 10,
    });
    expect(getVerifiedMiscScaling("ember", "Inferno", "energyPerEnemy")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("ember", "Inferno", "maxEnergyTargets")).toBeNull();
    const blast = ember.abilities.find((a) => a.name === "Fire Blast")!;
    expect(blast.damage).toBe(200);
    expect(blast.range).toBe(25);
    expect(blast.miscStats?.maxHeatEnergyCost).toBe(25);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_ember")!;
    expect(helminth.range).toBe(25);
    expect(helminth.miscStats?.armorStrip).toBe(1);
    expect(getVerifiedFieldScaling("ember_prime", "Immolation", "damageReduction")).toEqual({
      scale: "strength",
      cap: 0.9,
    });
  });

  it("Citrine Fractured Helminth 250/25%/10%; Shell Affinity-fixed; Crystallize Impact/300% crit", () => {
    expect(getVerifiedMiscScaling("citrine", "Fractured Blast", "healthOrbChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Fractured Blast", "healthOrbChance")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("citrine", "Preserving Shell", "drPerKill")).toEqual({
      scale: "strength",
    });
    const citrine = allWarframes.find((w) => w.id === "citrine")!;
    const blast = citrine.abilities.find((a) => a.name === "Fractured Blast")!;
    expect(blast.damage).toBe(500);
    expect(blast.range).toBe(14);
    expect(blast.miscStats).toMatchObject({ healthOrbChance: 0.5, energyOrbChance: 0.2 });
    const shell = citrine.abilities.find((a) => a.name === "Preserving Shell")!;
    expect(shell.range).toBeUndefined();
    expect(shell.damageReduction).toBe(0.4);
    expect(shell.miscStats?.staggerRadius).toBe(8);
    const gem = citrine.abilities.find((a) => a.name === "Prismatic Gem")!;
    expect(gem.damage).toBe(1000);
    expect(gem.range).toBe(15);
    const crystal = citrine.abilities.find((a) => a.name === "Crystallize")!;
    expect(crystal.damageType).toBe("Impact");
    expect(crystal.miscStats?.absoluteCritChance).toBe(3);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_citrine")!;
    expect(helminth.name).toBe("Fractured Blast");
    expect(helminth.damage).toBe(250);
    expect(helminth.miscStats).toMatchObject({ healthOrbChance: 0.25, energyOrbChance: 0.1 });
  });

  it("Vauban Tesla 150/6m/10 charges; Minelayer 25e; Photon 2500/7m/50e; Bastille 10%/s strip", () => {
    expect(getVerifiedMiscScaling("vauban", "Tesla Nervos", "charges")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("helminth", "Tesla Nervos", "charges")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("vauban", "Minelayer", "weaponDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("vauban", "Bastille", "armorStripPerSecond")).toEqual({
      scale: "strength",
    });
    const vauban = allWarframes.find((w) => w.id === "vauban")!;
    const tesla = vauban.abilities.find((a) => a.name === "Tesla Nervos")!;
    expect(tesla.damage).toBe(150);
    expect(tesla.damagePerSecond).toBe(25);
    expect(tesla.range).toBe(6);
    expect(tesla.miscStats).toMatchObject({ charges: 10, maxDrones: 4 });
    const mine = vauban.abilities.find((a) => a.name === "Minelayer")!;
    expect(mine.energyCost).toBe(25);
    expect(mine.damage).toBe(250);
    expect(mine.range).toBe(20);
    expect(mine.duration).toBe(25);
    expect(mine.miscStats?.weaponDamageBonus).toBe(0.25);
    const photon = vauban.abilities.find((a) => a.name === "Photon Strike")!;
    expect(photon.energyCost).toBe(50);
    expect(photon.damage).toBe(2500);
    expect(photon.range).toBe(7);
    expect(photon.damageType).toBe("Blast");
    expect(photon.miscStats?.overguardDamageMultiplier).toBe(2);
    const bastille = vauban.abilities.find((a) => a.name === "Bastille")!;
    expect(bastille.range).toBe(10);
    expect(bastille.duration).toBe(15);
    expect(bastille.miscStats).toMatchObject({
      armorStripPerSecond: 0.1,
      armorCap: 1500,
      vortexDamagePerSecond: 50,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_vauban")!;
    expect(helminth.damage).toBe(150);
    expect(helminth.range).toBe(6);
    expect(helminth.miscStats?.charges).toBe(10);
    expect(getVerifiedMiscScaling("vauban_prime", "Bastille", "vortexDamagePerSecond")).toEqual({
      scale: "strength",
    });
  });

  it("Chroma Ward element buffs; Vex 350%/275%; Effigy 8000 HP/10/s; Helminth Ward", () => {
    expect(getVerifiedMiscScaling("chroma", "Elemental Ward", "heatHealthBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Elemental Ward", "coldArmorBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("chroma", "Vex Armor", "scornMax")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("chroma", "Vex Armor", "furyMax")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("chroma", "Effigy", "energyDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    const chroma = allWarframes.find((w) => w.id === "chroma")!;
    const scream = chroma.abilities.find((a) => a.name === "Spectral Scream")!;
    expect(scream.damagePerSecond).toBe(400);
    expect(scream.range).toBe(10);
    expect(scream.miscStats?.energyDrain).toBe(3);
    const ward = chroma.abilities.find((a) => a.name === "Elemental Ward")!;
    expect(ward.duration).toBe(25);
    expect(ward.miscStats).toMatchObject({
      heatHealthBonus: 0.55,
      heatDps: 100,
      coldArmorBonus: 1.45,
      electricReflectMult: 10,
    });
    const vex = chroma.abilities.find((a) => a.name === "Vex Armor")!;
    expect(vex.range).toBe(18);
    expect(vex.duration).toBe(25);
    expect(vex.miscStats).toMatchObject({ scornMax: 3.5, furyMax: 2.75 });
    const effigy = chroma.abilities.find((a) => a.name === "Effigy")!;
    expect(effigy.health).toBe(8000);
    expect(effigy.damagePerSecond).toBe(2000);
    expect(effigy.miscStats).toMatchObject({
      energyDrain: 10,
      moveSpeedBonus: 0.2,
      armorReduction: 0.5,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_chroma")!;
    expect(helminth.name).toBe("Elemental Ward");
    expect(helminth.duration).toBe(25);
    expect(helminth.miscStats?.heatDps).toBe(100);
    expect(getVerifiedMiscScaling("chroma_prime", "Vex Armor", "scornMax")).toEqual({
      scale: "strength",
    });
  });

  it("Yareli Sea Snares 250 DPS/12s; Merulina 7500; Aquablades 750/45s/75e; Helminth Aquablades", () => {
    expect(getVerifiedMiscScaling("yareli", "Sea Snares", "damageVulnerability")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("yareli", "Merulina", "merulinaHealth")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("yareli", "Riptide", "burstDamage")).toEqual({
      scale: "strength",
    });
    const yareli = allWarframes.find((w) => w.id === "yareli")!;
    const snares = yareli.abilities.find((a) => a.name === "Sea Snares")!;
    expect(snares.damagePerSecond).toBe(250);
    expect(snares.duration).toBe(12);
    expect(snares.miscStats?.damageVulnerability).toBe(1);
    const merulina = yareli.abilities.find((a) => a.name === "Merulina")!;
    expect(merulina.miscStats?.merulinaHealth).toBe(7500);
    expect(merulina.miscStats?.damageRedirection).toBe(0.9);
    const aqua = yareli.abilities.find((a) => a.name === "Aquablades")!;
    expect(aqua.energyCost).toBe(75);
    expect(aqua.damage).toBe(750);
    expect(aqua.duration).toBe(45);
    expect(aqua.miscStats?.bladeRadius).toBe(5);
    const riptide = yareli.abilities.find((a) => a.name === "Riptide")!;
    expect(riptide.range).toBe(40);
    expect(riptide.miscStats?.burstDamage).toBe(2500);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_yareli")!;
    expect(helminth.energyCost).toBe(75);
    expect(helminth.damage).toBe(750);
    expect(helminth.duration).toBe(45);
    expect(getVerifiedMiscScaling("yareli_prime", "Merulina", "merulinaHealth")).toEqual({
      scale: "strength",
    });
  });

  it("Khora Whipclaw 150/10m; Ensnare 30m/10m spread; Strangledome 250/5m; Helminth Ensnare", () => {
    expect(getVerifiedMiscScaling("khora", "Ensnare", "spreadRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("helminth", "Ensnare", "spreadRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("khora", "Venari", "snareDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("khora", "Strangledome", "grabRadius")).toEqual({
      scale: "range",
    });
    const khora = allWarframes.find((w) => w.id === "khora")!;
    const whip = khora.abilities.find((a) => a.name === "Whipclaw")!;
    expect(whip.damage).toBe(150);
    expect(whip.range).toBe(10);
    expect(whip.radius).toBe(5);
    const ensnare = khora.abilities.find((a) => a.name === "Ensnare")!;
    expect(ensnare.range).toBe(30);
    expect(ensnare.duration).toBe(15);
    expect(ensnare.miscStats?.spreadRadius).toBe(10);
    const venari = khora.abilities.find((a) => a.name === "Venari")!;
    expect(venari.miscStats).toMatchObject({
      moveSpeedMultiplier: 1.15,
      snareDamage: 350,
      healthRegen: 50,
    });
    const dome = khora.abilities.find((a) => a.name === "Strangledome")!;
    expect(dome.damage).toBe(250);
    expect(dome.range).toBe(5);
    expect(dome.miscStats?.grabRadius).toBe(10);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_khora")!;
    expect(helminth.range).toBe(30);
    expect(helminth.miscStats?.spreadRadius).toBe(10);
    expect(getVerifiedMiscScaling("khora_prime", "Venari", "healthRegen")).toEqual({
      scale: "strength",
    });
  });

  it("Inaros Desiccation 150/8 DPS; Sandstorm 500 DPS; Scarab Shell 350 armor; Swarm 100e", () => {
    expect(getVerifiedMiscScaling("inaros", "Sandstorm", "healthPerEnemy")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("inaros", "Scarab Shell", "armorBonus")).toEqual({
      scale: "strength",
    });
    const inaros = allWarframes.find((w) => w.id === "inaros")!;
    const desiccation = inaros.abilities.find((a) => a.name === "Desiccation")!;
    expect(desiccation.damage).toBe(150);
    expect(desiccation.damagePerSecond).toBe(8);
    expect(desiccation.range).toBe(15);
    expect(desiccation.duration).toBe(8);
    expect(desiccation.miscStats?.lifesteal).toBe(0.25);
    const sandstorm = inaros.abilities.find((a) => a.name === "Sandstorm")!;
    expect(sandstorm.damagePerSecond).toBe(500);
    expect(sandstorm.range).toBe(7.5);
    expect(sandstorm.miscStats?.healthPerEnemy).toBe(50);
    const shell = inaros.abilities.find((a) => a.name === "Scarab Shell")!;
    expect(shell.energyCost).toBe(0);
    expect(shell.miscStats?.armorBonus).toBe(350);
    const swarm = inaros.abilities.find((a) => a.name === "Scarab Swarm")!;
    expect(swarm.energyCost).toBe(100);
    expect(swarm.duration).toBe(15);
    expect(swarm.miscStats?.healthAsDamage).toBe(0.1);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_inaros")!;
    expect(helminth.damage).toBe(150);
    expect(helminth.miscStats?.damagePerSecond).toBe(8);
    expect(getVerifiedMiscScaling("inaros_prime", "Scarab Shell", "armorBonus")).toEqual({
      scale: "strength",
    });
  });

  it("Saryn Spores 10/60m/16m spread; Molt 500/400/40s; Toxic Lash 30%/60%; Helminth Molt 40s", () => {
    expect(getVerifiedMiscScaling("saryn", "Spores", "damageGrowth")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("saryn", "Spores", "spreadRadius")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("saryn", "Molt", "speedBuff")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("helminth", "Molt", "speedBuff")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("saryn", "Toxic Lash", "gunDamage")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("saryn", "Miasma", "sporesDamageMultiplier")).toBeNull();
    const saryn = allWarframes.find((w) => w.id === "saryn")!;
    const spores = saryn.abilities.find((a) => a.name === "Spores")!;
    expect(spores.damage).toBe(10);
    expect(spores.range).toBe(60);
    expect(spores.miscStats).toMatchObject({ damageGrowth: 2, spreadRadius: 16 });
    const molt = saryn.abilities.find((a) => a.name === "Molt")!;
    expect(molt.health).toBe(500);
    expect(molt.damage).toBe(400);
    expect(molt.duration).toBe(40);
    expect(molt.range).toBe(10);
    expect(molt.miscStats?.speedBuff).toBe(0.5);
    const lash = saryn.abilities.find((a) => a.name === "Toxic Lash")!;
    expect(lash.duration).toBe(45);
    expect(lash.range).toBeUndefined();
    expect(lash.miscStats).toMatchObject({ gunDamage: 0.3, meleeDamage: 0.6 });
    const miasma = saryn.abilities.find((a) => a.name === "Miasma")!;
    expect(miasma.damagePerSecond).toBe(150);
    expect(miasma.range).toBe(20);
    expect(miasma.miscStats?.sporesDamageMultiplier).toBe(4);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_saryn")!;
    expect(helminth.duration).toBe(40);
    expect(helminth.range).toBe(10);
    expect(helminth.damage).toBe(400);
    expect(getVerifiedMiscScaling("saryn_prime", "Spores", "spreadRadius")).toEqual({
      scale: "range",
    });
  });

  it("Wukong Twin 2× HP; Cloud 8m/1%/m; Defy 7.5×/1500 cap; Iron Staff 300; Helminth Defy cap 750", () => {
    expect(getVerifiedMiscScaling("wukong", "Celestial Twin", "healthMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wukong", "Cloud Walker", "healPerMeter")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wukong", "Defy", "damageMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("wukong", "Defy", "armorMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Defy", "armorMultiplier")).toEqual({
      scale: "strength",
    });
    const wukong = allWarframes.find((w) => w.id === "wukong")!;
    const twin = wukong.abilities.find((a) => a.name === "Celestial Twin")!;
    expect(twin.range).toBeUndefined();
    expect(twin.miscStats).toMatchObject({
      healthMultiplier: 2,
      damageMultiplier: 0.5,
      markDamageMultiplier: 3,
    });
    const cloud = wukong.abilities.find((a) => a.name === "Cloud Walker")!;
    expect(cloud.range).toBe(8);
    expect(cloud.duration).toBe(2);
    expect(cloud.miscStats?.healPerMeter).toBe(0.01);
    const defy = wukong.abilities.find((a) => a.name === "Defy")!;
    expect(defy.damage).toBe(500);
    expect(defy.range).toBe(12);
    expect(defy.duration).toBe(2);
    expect(defy.miscStats).toMatchObject({
      damageMultiplier: 7.5,
      armorMultiplier: 1.5,
      armorDuration: 25,
      armorCap: 1500,
    });
    const fury = wukong.abilities.find((a) => a.name === "Primal Fury")!;
    expect(fury.damage).toBe(300);
    expect(fury.miscStats?.energyDrain).toBe(5);
    const staff = allWeapons.find((w) => w.id === "iron_staff")!;
    expect(staff.damage).toBe(300);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_wukong")!;
    expect(helminth.miscStats?.armorCap).toBe(750);
    expect(helminth.range).toBe(12);
    expect(getVerifiedMiscScaling("wukong_prime", "Defy", "armorMultiplier")).toEqual({
      scale: "strength",
    });
  });

  it("Xaku Xata 26%/35s; Grasp 50/15m/6; Lost Deny 4000; Vast Untime 1200/25% slow", () => {
    expect(getVerifiedMiscScaling("xaku", "Xata's Whisper", "voidDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("helminth", "Xata's Whisper", "voidDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("xaku", "Grasp Of Lohk", "maxTargets")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("xaku", "The Lost", "gazeDefenseStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("xaku", "The Vast Untime", "slowPercent")).toEqual({
      scale: "strength",
      useSiblingSlowCap: true,
    });
    const xaku = allWarframes.find((w) => w.id === "xaku")!;
    const xata = xaku.abilities.find((a) => a.name === "Xata's Whisper")!;
    expect(xata.duration).toBe(35);
    expect(xata.range).toBeUndefined();
    expect(xata.miscStats?.voidDamageBonus).toBe(0.26);
    const grasp = xaku.abilities.find((a) => a.name === "Grasp Of Lohk")!;
    expect(grasp.damage).toBe(50);
    expect(grasp.range).toBe(15);
    expect(grasp.duration).toBe(12);
    expect(grasp.miscStats).toMatchObject({ targetRange: 8, maxTargets: 6 });
    const lost = xaku.abilities.find((a) => a.name === "The Lost")!;
    expect(lost.damage).toBe(4000);
    expect(lost.range).toBe(40);
    expect(lost.miscStats?.gazeDefenseStrip).toBe(0.5);
    expect(lost.miscStats?.accuseMaxTargets).toBe(8);
    const vast = xaku.abilities.find((a) => a.name === "The Vast Untime")!;
    expect(vast.damage).toBe(1200);
    expect(vast.duration).toBe(25);
    expect(vast.range).toBe(25);
    expect(vast.miscStats).toMatchObject({
      slowPercent: 0.25,
      voidDamageVulnerability: 0.5,
      dodgeChance: 0.75,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_xaku")!;
    expect(helminth.duration).toBe(35);
    expect(helminth.miscStats?.voidDamageBonus).toBe(0.26);
    expect(getVerifiedMiscScaling("xaku_prime", "Grasp Of Lohk", "maxTargets")).toEqual({
      scale: "strength",
    });
  });

  it("Grendel Feast 500/25m; Nourish 75%/2×/25s; Pulverize strip; Regurgitate 2000; Helminth Nourish 45%/1.6×", () => {
    expect(getVerifiedMiscScaling("grendel", "Nourish", "viralDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("grendel", "Nourish", "selfHeal")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("grendel", "Nourish", "energyMultiplier")).toEqual({
      scale: "strength",
      formula: "one_plus_bonus_times_attr",
    });
    expect(getVerifiedMiscScaling("helminth", "Nourish", "energyMultiplier")).toEqual({
      scale: "strength",
      formula: "one_plus_bonus_times_attr",
    });
    expect(getVerifiedMiscScaling("helminth", "Nourish", "viralDamageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("grendel", "Pulverize", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("grendel", "Regurgitate", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    const grendel = allWarframes.find((w) => w.id === "grendel")!;
    const feast = grendel.abilities.find((a) => a.name === "Feast")!;
    expect(feast.damage).toBe(500);
    expect(feast.range).toBe(25);
    expect(feast.miscStats).toMatchObject({ maxEnemies: 5, vomitConeRange: 8 });
    const nourish = grendel.abilities.find((a) => a.name === "Nourish")!;
    expect(nourish.duration).toBe(25);
    expect(nourish.range).toBe(25);
    expect(nourish.miscStats).toMatchObject({
      viralDamageBonus: 0.75,
      energyMultiplier: 2,
      selfHeal: 1000,
      viralDamage: 250,
      splashRadius: 12,
      viralStacks: 10,
    });
    const pulverize = grendel.abilities.find((a) => a.name === "Pulverize")!;
    expect(pulverize.damage).toBe(2000);
    expect(pulverize.range).toBe(15);
    expect(pulverize.miscStats).toMatchObject({
      healPerSecond: 200,
      armorStrip: 0.5,
      toxinDamagePerSecond: 25,
      energyDrain: 3,
    });
    const regurgitate = grendel.abilities.find((a) => a.name === "Regurgitate")!;
    expect(regurgitate.damage).toBe(2000);
    expect(regurgitate.range).toBe(6);
    expect(regurgitate.miscStats).toMatchObject({
      armorStrip: 0.75,
      slowPercent: 0.8,
      slowDuration: 6,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_grendel")!;
    expect(helminth.name).toBe("Nourish");
    expect(helminth.duration).toBe(25);
    expect(helminth.range).toBe(25);
    expect(helminth.miscStats).toMatchObject({
      viralDamageBonus: 0.45,
      energyMultiplier: 1.6,
      viralStacks: 1,
    });
    expect(helminth.miscStats?.selfHeal).toBeUndefined();
    expect(getVerifiedMiscScaling("grendel_prime", "Nourish", "viralDamageBonus")).toEqual({
      scale: "strength",
    });
  });

  it("Hildryn Balefire 1500/3m; Pillage 8m/25%; Haven 500/200 DPS; Aegis Storm 200/500", () => {
    expect(getVerifiedMiscScaling("hildryn", "Pillage", "shieldStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("hildryn", "Pillage", "shieldCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("hildryn", "Haven", "allyShieldBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("hildryn", "Haven", "shieldRechargeRate")).toEqual({
      scale: "duration",
    });
    expect(getVerifiedMiscScaling("hildryn", "Haven", "shieldCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("hildryn", "Haven", "shieldDrainPerAlly")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("hildryn", "Aegis Storm", "deactivationDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("hildryn", "Aegis Storm", "shieldDrain")).toEqual({
      scale: "efficiency",
      formula: "channeled_drain",
    });
    expect(getVerifiedMiscScaling("hildryn", "Aegis Storm", "dodgeShieldCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("hildryn_prime", "Aegis Storm", "dodgeShieldCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    expect(getVerifiedMiscScaling("hildryn", "Balefire", "shieldCost")).toEqual({
      scale: "efficiency",
      formula: "cast_cost",
    });
    const hildryn = allWarframes.find((w) => w.id === "hildryn")!;
    const balefire = hildryn.abilities.find((a) => a.name === "Balefire")!;
    expect(balefire.damage).toBe(1500);
    expect(balefire.range).toBe(3);
    expect(balefire.miscStats).toMatchObject({ shieldCost: 50, minDamage: 500 });
    const pillage = hildryn.abilities.find((a) => a.name === "Pillage")!;
    expect(pillage.range).toBe(8);
    expect(pillage.duration).toBe(2);
    expect(pillage.miscStats).toMatchObject({
      shieldStrip: 0.25,
      armorStrip: 0.25,
      shieldCost: 150,
    });
    const haven = hildryn.abilities.find((a) => a.name === "Haven")!;
    expect(haven.damagePerSecond).toBe(200);
    expect(haven.range).toBe(15);
    expect(haven.miscStats?.allyShieldBonus).toBe(500);
    const storm = hildryn.abilities.find((a) => a.name === "Aegis Storm")!;
    expect(storm.damagePerSecond).toBe(200);
    expect(storm.range).toBe(15);
    expect(storm.miscStats).toMatchObject({
      deactivationDamage: 500,
      dodgeShieldCost: 50,
    });
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_hildryn")!;
    expect(helminth.name).toBe("Pillage");
    expect(helminth.range).toBe(8);
    expect(helminth.miscStats?.shieldStrip).toBe(0.25);
    expect(getVerifiedMiscScaling("hildryn_prime", "Haven", "allyShieldBonus")).toEqual({
      scale: "strength",
    });
  });

  it("Titania Spellbind Helminth; Tribute aura 120s; Lantern 350/2500; Razorwing 160/200 Diwata", () => {
    const titania = allWarframes.find((w) => w.id === "titania")!;
    const spellbind = titania.abilities.find((a) => a.name === "Spellbind")!;
    expect(spellbind.range).toBe(50);
    expect(spellbind.duration).toBe(16);
    expect(spellbind.radius).toBe(5);
    const tribute = titania.abilities.find((a) => a.name === "Tribute")!;
    expect(tribute.damage).toBe(500);
    expect(tribute.range).toBe(25);
    expect(tribute.duration).toBe(12);
    expect(tribute.miscStats).toMatchObject({ auraDuration: 120, auraRadius: 35 });
    const lantern = titania.abilities.find((a) => a.name === "Lantern")!;
    expect(lantern.damagePerSecond).toBe(350);
    expect(lantern.damage).toBe(2500);
    expect(lantern.duration).toBe(25);
    expect(lantern.radius).toBe(20);
    expect(lantern.miscStats?.explosionRadius).toBe(8);
    const razorwing = titania.abilities.find((a) => a.name === "Razorwing")!;
    expect(razorwing.damage).toBe(160);
    expect(razorwing.miscStats).toMatchObject({
      energyDrain: 5,
      meleeDamage: 200,
      droneDamage: 80,
      evasion: 0.5,
      razorflies: 6,
    });
    const diwata = allWeapons.find((w) => w.id === "diwata")!;
    expect(diwata.damage).toBe(200);
    const helminth = allHelminthAbilities.find((h) => h.id === "subsume_titania")!;
    expect(helminth.name).toBe("Spellbind");
    expect(helminth.duration).toBe(16);
    expect(helminth.range).toBe(50);
    expect(helminth.radius).toBe(5);
    expect(helminth.energyCost).toBe(25);
    const prime = allWarframes.find((w) => w.id === "titania_prime")!;
    expect(prime.abilities.find((a) => a.name === "Spellbind")!.duration).toBe(16);
  });

  it("Intensify raises warframe strength used by ability displays", () => {
    const excal = allWarframes.find((w) => w.id === "excalibur")!;
    const intensify = allMods.find((m) => m.id === "intensify_r3")!;
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const bare = calculateWarframeBuild(excal, [], modsMap);
    const buffed = calculateWarframeBuild(
      excal,
      [{ modId: intensify.id, rank: intensify.maxRank, slotIndex: 0 }],
      modsMap,
    );
    expect(buffed.abilityStrength).toBeCloseTo(bare.abilityStrength + 0.3, 8);
  });

  it("Umbral Intensify gains set bonus with 3 Umbral pieces (wiki +75% to set)", () => {
    const excal = allWarframes.find((w) => w.id === "excalibur")!;
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const intensify = allMods.find((m) => m.id === "umbra_intensify")!;
    const alone = calculateWarframeBuild(
      excal,
      [{ modId: "umbra_intensify", rank: intensify.maxRank, slotIndex: 0 }],
      modsMap,
    );
    const fullSet = calculateWarframeBuild(
      excal,
      [
        { modId: "umbra_vitality", rank: 10, slotIndex: 0 },
        { modId: "umbra_fiber", rank: 10, slotIndex: 1 },
        { modId: "umbra_intensify", rank: intensify.maxRank, slotIndex: 2 },
      ],
      modsMap,
    );
    // Alone: base +44% → 1.44; 3pc set mult 1.75 on the mod's contribution
    expect(alone.abilityStrength).toBeCloseTo(1.44, 2);
    expect(fullSet.abilityStrength).toBeGreaterThan(alone.abilityStrength);
    expect(fullSet.abilityStrength).toBeCloseTo(1.77, 2);
  });
});

describe("Phase 9 — satellite builders smoke", () => {
  it("companion calculator returns finite survivability totals", () => {
    const companion = allCompanions[0]!;
    const modsMap = new Map(allMods.map((m) => [m.id, m]));
    const stats = calculateCompanionBuild(companion, [], modsMap);
    expect(stats.totalHealth).toBeGreaterThan(0);
    expect(Number.isFinite(stats.totalHealth)).toBe(true);
  });

  it("railjack calculator returns finite hull for default components", () => {
    const stats = calculateRailjackBuild({
      reactorId: "lavan_reactor_mk3",
      shieldId: "lavan_shield_mk3",
      engineId: "lavan_engine_mk3",
      platingId: "lavan_plating_mk3",
    });
    expect(stats.hull).toBeGreaterThan(3000);
    expect(Number.isFinite(stats.hull)).toBe(true);
  });
});
