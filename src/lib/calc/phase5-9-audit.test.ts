/**
 * Phases 5–9 foundation goldens: stance mult, arcanes, incarnon/radial smoke,
 * ability scaling registry, satellite calculators.
 */
import { describe, expect, it } from "vitest";
import { allArcanes } from "@/data/arcanes";
import { allCompanions } from "@/data/companions";
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
    expect(getVerifiedMiscScaling("chroma", "Effigy", "energyDrain")).toBeNull();
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
    expect(getVerifiedMiscScaling("jade", "Glory On High", "energyDrain")).toBeNull();
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

  it("Noctua alt-fire × STR / seek distance × RNG; fragments Misc-fixed", () => {
    expect(getVerifiedMiscScaling("dante", "Noctua", "altFireDamage")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("dante", "Noctua", "seekDistance")).toEqual({
      scale: "range",
    });
    expect(getVerifiedMiscScaling("dante", "Noctua", "pageFragments")).toBeNull();
    expect(getVerifiedMiscScaling("dante", "Noctua", "seekAngle")).toBeNull();
    expect(getVerifiedMiscScaling("dante", "Noctua", "energyPerShot")).toBeNull();
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

  it("Transmutation Probe CDR stays Misc-fixed (EFF scale unmodeled); probe lifetime fixed", () => {
    expect(getVerifiedMiscScaling("lavos", "Transmutation Probe", "cooldownReduction")).toBeNull();
    expect(getVerifiedMiscScaling("lavos", "Transmutation Probe", "probeDuration")).toBeNull();
    expect(getVerifiedMiscScaling("lavos", "Transmutation Probe", "probeSpeed")).toBeNull();
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
    expect(getVerifiedMiscScaling("sevagoth", "Gloom", "energyDrainPerEnemy")).toBeNull();
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
    expect(getVerifiedMiscScaling("baruuk", "Elude", "energyDrain")).toBeNull();
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

  it("Garuda Mirror capture × STR; Altar heal × STR; Talons Slash SC × STR", () => {
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
    expect(getVerifiedMiscScaling("garuda", "Seeking Talons", "slashStatusChance")).toEqual({
      scale: "strength",
      cap: 1,
    });
    expect(getVerifiedMiscScaling("garuda", "Seeking Talons", "initialProjectiles")).toBeNull();
    expect(getVerifiedMiscScaling("garuda_prime", "Blood Altar", "healthPerSecond")).toEqual({
      scale: "strength",
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
    expect(getVerifiedMiscScaling("nezha", "Warding Halo", "haloHealth")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nezha", "Warding Halo", "armorMultiplier")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nezha", "Warding Halo", "invulnerabilityDuration")).toBeNull();
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

  it("Nekros Shadows bonuses × STR; Desecrate drop chances Misc-fixed", () => {
    expect(getVerifiedMiscScaling("nekros", "Shadows Of The Dead", "damageBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nekros", "Shadows Of The Dead", "healthBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nekros", "Shadows Of The Dead", "healthDecayPerSecond")).toBeNull();
    expect(getVerifiedMiscScaling("nekros", "Desecrate", "healthOrbChance")).toBeNull();
    expect(getVerifiedMiscScaling("nekros_prime", "Shadows Of The Dead", "shieldBonus")).toEqual({
      scale: "strength",
    });
    expect(getVerifiedMiscScaling("nekros", "Terrify", "armorStrip")).toEqual({
      scale: "strength",
      cap: 1,
    });
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
