import { describe, expect, it } from "vitest";
import {
  computeArmorScaledPool,
  scaleAbilityMiscStats,
} from "@/lib/codex/ability-misc-stats";

describe("computeArmorScaledPool", () => {
  // wiki Iron Skin: (1200 + (2.5 × 240 × 2)) × 1.3 = 3120
  it("matches wiki Iron Skin Overguard before absorb", () => {
    expect(computeArmorScaledPool(1200, 2.5, 480, 1.3)).toBe(3120);
  });
  // wiki Snow Globe: {3500 + 5 × [300 × (1 + 1)]} × 1.3 = 8450
  it("matches wiki Snow Globe health before absorb", () => {
    expect(computeArmorScaledPool(3500, 5, 600, 1.3)).toBe(8450);
  });
});

describe("scaleAbilityMiscStats", () => {
  it("keeps Iron Skin armorMultiplier Misc-fixed (outer STR on pool)", () => {
    const lines = scaleAbilityMiscStats(
      { armorMultiplier: 2.5, invulnerabilityDuration: 3 },
      { strength: 1.3, duration: 1, range: 1, efficiency: 1 },
      { warframeId: "rhino", abilityName: "Iron Skin" },
    );
    expect(lines.find((l) => l.label === "Armor Mult.")!).toMatchObject({
      base: "2.5x",
      scaled: "2.5x",
      modified: false,
    });
  });

  it("keeps Warding Halo halo/armor/absorb mults Misc-fixed", () => {
    const lines = scaleAbilityMiscStats(
      { haloHealth: 1000, armorMultiplier: 2.5, absorptionMultiplier: 2.5 },
      { strength: 1.3, duration: 1, range: 1, efficiency: 1 },
      { warframeId: "nezha", abilityName: "Warding Halo" },
    );
    expect(lines.find((l) => l.label === "Halo Health")!).toMatchObject({
      base: "1000",
      scaled: "1000",
      modified: false,
    });
    expect(lines.find((l) => l.label === "Armor Mult.")!).toMatchObject({
      base: "2.5x",
      scaled: "2.5x",
      modified: false,
    });
    expect(lines.find((l) => l.label === "Absorption Mult.")!).toMatchObject({
      base: "2.5x",
      scaled: "2.5x",
      modified: false,
    });
  });

  it("scales Celestial Twin health as a multiplier, not seconds/percent", () => {
    const lines = scaleAbilityMiscStats(
      { healthMultiplier: 2, damageMultiplier: 0.5, markDamageMultiplier: 3 },
      { strength: 1.5, duration: 1, range: 1 },
      { warframeId: "wukong", abilityName: "Celestial Twin" },
    );
    const health = lines.find((l) => l.label === "Health Multiplier")!;
    expect(health.base).toBe("2.0x");
    expect(health.scaled).toBe("3.0x");
    expect(health.modified).toBe(true);

    // Damage mults are fixed (unverified) — show base, no STR scale.
    const dmg = lines.find((l) => l.label === "Damage Multiplier")!;
    expect(dmg.base).toBe("0.50x");
    expect(dmg.scaled).toBe("0.50x");
    expect(dmg.modified).toBe(false);
  });

  it("scales Spores damageGrowth with Strength as a multiplier", () => {
    const lines = scaleAbilityMiscStats(
      { damageGrowth: 2 },
      { strength: 1.5, duration: 1, range: 1 },
      { warframeId: "saryn", abilityName: "Spores" },
    );
    expect(lines[0]!.base).toBe("2.0x");
    expect(lines[0]!.scaled).toBe("3.0x");
    expect(lines[0]!.modified).toBe(true);
  });

  it("keeps Miasma Spores damage multiplier fixed at 4x (no STR)", () => {
    const lines = scaleAbilityMiscStats(
      { sporesDamageMultiplier: 4 },
      { strength: 2, duration: 1, range: 1 },
      { warframeId: "saryn", abilityName: "Miasma" },
    );
    expect(lines[0]!.label).toBe("Spores Damage Mult.");
    expect(lines[0]!.base).toBe("4.0x");
    expect(lines[0]!.scaled).toBe("4.0x");
    expect(lines[0]!.modified).toBe(false);
  });

  it("scales Pillage strip with Strength and caps at 100%", () => {
    const lines = scaleAbilityMiscStats(
      { shieldStrip: 0.25, armorStrip: 0.25 },
      { strength: 4, duration: 1, range: 1 },
      { warframeId: "hildryn", abilityName: "Pillage" },
    );
    const shield = lines.find((l) => l.label === "Shield Strip")!;
    const armor = lines.find((l) => l.label === "Armor Strip")!;
    expect(shield.base).toBe("25%");
    expect(shield.scaled).toBe("100%");
    expect(armor.scaled).toBe("100%");
  });

  it("scales Terrify armor strip and enemy count with Strength", () => {
    const lines = scaleAbilityMiscStats(
      { armorStrip: 0.6, affectedEnemies: 20 },
      { strength: 1.67, duration: 1, range: 1 },
      { warframeId: "nekros", abilityName: "Terrify" },
    );
    const strip = lines.find((l) => l.label === "Armor Strip")!;
    const enemies = lines.find((l) => l.label === "Affected Enemies")!;
    expect(strip.base).toBe("60%");
    expect(strip.scaled).toBe("100%");
    expect(enemies.base).toBe("20");
    expect(enemies.scaled).toBe("33");
  });

  it("scales Tharros Strike strip and health per hit with Strength", () => {
    const lines = scaleAbilityMiscStats(
      { shieldStrip: 1, armorStrip: 0.5, healthPerHit: 250 },
      { strength: 2, duration: 1, range: 1 },
      { warframeId: "styanax", abilityName: "Tharros Strike" },
    );
    const shield = lines.find((l) => l.label === "Shield Strip")!;
    const armor = lines.find((l) => l.label === "Armor Strip")!;
    const health = lines.find((l) => l.label === "Health per Hit")!;
    expect(shield.base).toBe("100%");
    expect(shield.scaled).toBe("100%"); // capped
    expect(armor.base).toBe("50%");
    expect(armor.scaled).toBe("100%");
    expect(health.base).toBe("250");
    expect(health.scaled).toBe("500");
  });

  it("scales Parasitic Link strength bonus with Strength", () => {
    const lines = scaleAbilityMiscStats(
      { strengthBonus: 0.25, enemyLinkRange: 20 },
      { strength: 2, duration: 1, range: 1.5 },
      { warframeId: "nidus", abilityName: "Parasitic Link" },
    );
    const str = lines.find((l) => l.label === "Strength Bonus")!;
    const range = lines.find((l) => l.label === "Link Range")!;
    expect(str.base).toBe("25%");
    expect(str.scaled).toBe("50%");
    expect(range.base).toBe("20.0m");
    expect(range.scaled).toBe("30.0m");
  });

  it("scales Gravitic Slash strip with Strength (cap 100%)", () => {
    const lines = scaleAbilityMiscStats(
      { shieldStrip: 0.35, armorStrip: 0.35 },
      { strength: 3, duration: 1, range: 1 },
      { warframeId: "sirius_orion", abilityName: "Gravitic Slash" },
    );
    const shield = lines.find((l) => l.label === "Shield Strip")!;
    expect(shield.base).toBe("35%");
    expect(shield.scaled).toBe("100%");
  });

  it("still formats numeric armorDuration as seconds when verified", () => {
    const lines = scaleAbilityMiscStats(
      { armorDuration: 25, damageMultiplier: 7.5 },
      { strength: 1, duration: 1.2, range: 1 },
      { warframeId: "wukong", abilityName: "Defy" },
    );
    const dur = lines.find((l) => l.label === "Armor Duration")!;
    expect(dur.base).toBe("25.0s");
    expect(dur.scaled).toBe("30.0s");
  });

  // wiki Shroud: flat melee CD × STR; status/speed/CC Misc fixed; buff extension × DUR
  it("scales Shroud of Dynar melee CD with Strength (status/speed fixed)", () => {
    const lines = scaleAbilityMiscStats(
      {
        speedBuff: 1,
        meleeBuffDuration: 3,
        durationExtension: 5,
        criticalChanceBonus: 1,
        statusChance: 1,
        critDamageBonus: 2,
        parkourVelocity: 0.5,
      },
      { strength: 2, duration: 1.5, range: 1 },
      { warframeId: "voruna", abilityName: "Shroud Of Dynar" },
    );
    const cd = lines.find((l) => l.label === "Crit Damage Bonus")!;
    const sc = lines.find((l) => l.label === "Status Chance")!;
    const speed = lines.find((l) => l.label === "Speed Buff")!;
    const cc = lines.find((l) => l.label === "Crit Chance Bonus")!;
    const ext = lines.find((l) => l.label === "Duration Extension")!;
    expect(cd.base).toBe("+2.0x");
    expect(cd.scaled).toBe("+4.0x");
    expect(sc.base).toBe("100%");
    expect(sc.scaled).toBe("100%");
    expect(sc.modified).toBe(false);
    expect(speed.scaled).toBe(speed.base);
    expect(speed.modified).toBe(false);
    expect(cc.scaled).toBe("100%");
    expect(cc.modified).toBe(false);
    expect(ext.base).toBe("5.0s");
    expect(ext.scaled).toBe("7.5s");
  });

  it("scales Psychic Bolts defenseStrip with Strength (cap 100%)", () => {
    const lines = scaleAbilityMiscStats(
      { defenseStrip: 0.8 },
      { strength: 1.25, duration: 1, range: 1 },
      { warframeId: "nyx", abilityName: "Psychic Bolts" },
    );
    expect(lines[0]!.label).toBe("Defense Strip");
    expect(lines[0]!.base).toBe("80%");
    expect(lines[0]!.scaled).toBe("100%");
  });

  it("keeps Ulfrun Descent speedBuff fixed (Misc, not STR)", () => {
    const lines = scaleAbilityMiscStats(
      { speedBuff: 0.5, killDamageBonus: 2 },
      { strength: 2, duration: 1, range: 1 },
      { warframeId: "voruna", abilityName: "Ulfrun's Descent" },
    );
    const speed = lines.find((l) => l.label === "Speed Buff")!;
    expect(speed.base).toBe("50%");
    expect(speed.scaled).toBe("50%");
    expect(speed.modified).toBe(false);
  });

  it("scales Larva mutationStackChance with Strength (cap 100%)", () => {
    const lines = scaleAbilityMiscStats(
      { mutationStackChance: 0.5 },
      { strength: 2, duration: 1, range: 1 },
      { warframeId: "nidus", abilityName: "Larva" },
    );
    expect(lines[0]!.label).toBe("Mutation Chance");
    expect(lines[0]!.base).toBe("50%");
    expect(lines[0]!.scaled).toBe("100%");
  });

  it("scales Elemental Ward bonuses (toxin reload × DUR; heat DPS × STR)", () => {
    const lines = scaleAbilityMiscStats(
      {
        auraRadius: 12,
        heatHealthBonus: 0.55,
        heatDps: 100,
        toxinReloadBonus: 0.35,
        coldArmorBonus: 1.45,
        coldReflectMult: 3,
      },
      { strength: 2, duration: 2, range: 1.25 },
      { warframeId: "chroma", abilityName: "Elemental Ward" },
    );
    expect(lines.find((l) => l.label === "Aura Radius")!.scaled).toBe("15.0m");
    expect(lines.find((l) => l.label === "Heat Health Bonus")!.scaled).toBe("110%");
    expect(lines.find((l) => l.label === "Heat DPS")!.scaled).toBe("200/s");
    expect(lines.find((l) => l.label === "Toxin Reload Bonus")!.scaled).toBe("70%");
    expect(lines.find((l) => l.label === "Cold Armor Bonus")!.base).toBe("145%");
    expect(lines.find((l) => l.label === "Cold Armor Bonus")!.scaled).toBe("290%");
    expect(lines.find((l) => l.label === "Cold Reflect Mult.")!.scaled).toBe("6.0x");
  });

  it("formats Fangs of Raksh statusTypes/stacks as counts not percent", () => {
    const lines = scaleAbilityMiscStats(
      { statusTypes: 5, statusStacks: 10 },
      { strength: 2, duration: 1, range: 1 },
      { warframeId: "voruna", abilityName: "Fangs of Raksh" },
    );
    expect(lines.find((l) => l.label === "Status Types")!.base).toBe("5");
    expect(lines.find((l) => l.label === "Status Types")!.scaled).toBe("5");
    expect(lines.find((l) => l.label === "Stacks per Status")!.base).toBe("10");
    expect(lines.find((l) => l.label === "Stacks per Status")!.scaled).toBe("10");
  });

  it("formats Effigy sentry/stun Misc-fixed; drain × EFF/DUR", () => {
    const lines = scaleAbilityMiscStats(
      {
        sentryArmor: 200,
        energyDrain: 10,
        stunRadius: 30,
        creditPickupRadius: 10,
      },
      { strength: 2, duration: 2, range: 2, efficiency: 1 },
      { warframeId: "chroma", abilityName: "Effigy" },
    );
    expect(lines.find((l) => l.label === "Sentry Armor")!.base).toBe("200");
    expect(lines.find((l) => l.label === "Sentry Armor")!.scaled).toBe("200");
    expect(lines.find((l) => l.label === "Sentry Armor")!.modified).toBe(false);
    // 10 × max((2−1)÷2, 0.25) = 5/s
    expect(lines.find((l) => l.label === "Energy Drain")!).toMatchObject({
      base: "10/s",
      scaled: "5/s",
      modified: true,
      scaleAttr: "efficiency",
    });
    expect(lines.find((l) => l.label === "Stun Radius")!.base).toBe("30.0m");
    expect(lines.find((l) => l.label === "Stun Radius")!.modified).toBe(false);
    expect(lines.find((l) => l.label === "Credit Pickup Radius")!.base).toBe("10.0m");
    expect(lines.find((l) => l.label === "Credit Pickup Radius")!.modified).toBe(false);
  });

  it("scales Vex Armor scorn/fury max with Strength", () => {
    const lines = scaleAbilityMiscStats(
      { auraRadius: 18, scornMax: 3.5, furyMax: 2.75 },
      { strength: 2, duration: 1, range: 1 },
      { warframeId: "chroma", abilityName: "Vex Armor" },
    );
    expect(lines.find((l) => l.label === "Scorn Max")!.base).toBe("350%");
    expect(lines.find((l) => l.label === "Scorn Max")!.scaled).toBe("700%");
    expect(lines.find((l) => l.label === "Fury Max")!.base).toBe("275%");
    expect(lines.find((l) => l.label === "Fury Max")!.scaled).toBe("550%");
  });

  // wiki cast costs × EFF: Pillage 150 shields; Exalted slide 25; Prowl 2/10; Zephyr air 12.5/25; Kiss 15
  it("scales activation cast costs with Efficiency across frames", () => {
    const ctx = { strength: 1, duration: 1, range: 1, efficiency: 1.3 };
    const pillage = scaleAbilityMiscStats(
      { shieldCost: 150 },
      ctx,
      { warframeId: "hildryn", abilityName: "Pillage" },
    );
    expect(pillage.find((l) => l.label === "Shield Cost")!).toMatchObject({
      base: "150",
      scaled: "105",
      scaleAttr: "efficiency",
    });
    const blade = scaleAbilityMiscStats(
      { slideEnergyCost: 25 },
      ctx,
      { warframeId: "excalibur", abilityName: "Exalted Blade" },
    );
    expect(blade.find((l) => l.label === "Slide Energy Cost")!).toMatchObject({
      base: "25",
      scaled: "17.5",
      scaleAttr: "efficiency",
    });
    const prowl = scaleAbilityMiscStats(
      { meleeEnergyCost: 2, damageEnergyCost: 10 },
      ctx,
      { warframeId: "ivara", abilityName: "Prowl" },
    );
    expect(prowl.find((l) => l.label === "Melee Energy Cost")!).toMatchObject({
      base: "2",
      scaled: "1.4",
    });
    expect(prowl.find((l) => l.label === "Damage Energy Cost")!).toMatchObject({
      base: "10",
      scaled: "7",
    });
    const tail = scaleAbilityMiscStats(
      { airborneEnergyCost: 12.5 },
      ctx,
      { warframeId: "zephyr", abilityName: "Tail Wind" },
    );
    expect(tail.find((l) => l.label === "Airborne Energy Cost")!).toMatchObject({
      base: "12.50",
      scaled: "8.8",
    });
    const burst = scaleAbilityMiscStats(
      { airborneEnergyCost: 25 },
      ctx,
      { warframeId: "zephyr", abilityName: "Airburst" },
    );
    expect(burst.find((l) => l.label === "Airborne Energy Cost")!.scaled).toBe("17.5");
    const kiss = scaleAbilityMiscStats(
      { kissEnergyCost: 15 },
      ctx,
      { warframeId: "bonewidow", abilityName: "Shield Maiden" },
    );
    expect(kiss.find((l) => l.label === "Maiden's Kiss Energy")!).toMatchObject({
      base: "15",
      scaled: "10.5",
    });
    const mark = scaleAbilityMiscStats(
      { energyPerMark: 12 },
      ctx,
      { warframeId: "ash", abilityName: "Blade Storm" },
    );
    expect(mark.find((l) => l.label === "Energy per Mark")!).toMatchObject({
      base: "12",
      scaled: "8.4",
    });
    const desecrate = scaleAbilityMiscStats(
      { energyPerCorpse: 10 },
      ctx,
      { warframeId: "nekros", abilityName: "Desecrate" },
    );
    expect(desecrate.find((l) => l.label === "Energy per Corpse")!).toMatchObject({
      base: "10",
      scaled: "7",
    });
    const provoke = scaleAbilityMiscStats(
      { energyPerAbility: 3 },
      ctx,
      { warframeId: "equinox", abilityName: "Pacify & Provoke" },
    );
    expect(provoke.find((l) => l.label === "Energy per Ability")!).toMatchObject({
      base: "3",
      scaled: "2.1",
    });
    const nav = scaleAbilityMiscStats(
      { energyDrainGrowth: 2 },
      ctx,
      { warframeId: "ivara", abilityName: "Navigator" },
    );
    expect(nav.find((l) => l.label === "Energy Drain Growth")!).toMatchObject({
      base: "2/s",
      scaled: "1.4/s",
    });
    const vampire = scaleAbilityMiscStats(
      { energyPerPulse: 25 },
      { strength: 1.3, duration: 1, range: 1, efficiency: 1 },
      { warframeId: "trinity", abilityName: "Energy Vampire" },
    );
    expect(vampire.find((l) => l.label === "Energy per Pulse")!).toMatchObject({
      base: "25",
      scaled: "33",
      scaleAttr: "strength",
    });
    const bright = scaleAbilityMiscStats(
      { energyRestore: 15 },
      { strength: 1.3, duration: 1, range: 1, efficiency: 1 },
      { warframeId: "nokko", abilityName: "Brightbonnet" },
    );
    expect(bright.find((l) => l.label === "Energy Restore")!).toMatchObject({
      base: "15",
      scaled: "20",
      scaleAttr: "strength",
    });
    const mutation = scaleAbilityMiscStats(
      { mutationStackCost: 1 },
      ctx,
      { warframeId: "nidus", abilityName: "Parasitic Link" },
    );
    expect(mutation.find((l) => l.label === "Mutation Cost")!).toMatchObject({
      base: "1",
      scaled: "1",
      modified: false,
    });
  });

  // wiki Haven/Aegis/Balefire: shield drains × EFF/DUR; cast shieldCost × EFF; recharge × DUR
  it("scales Hildryn Haven/Aegis/Balefire shield costs and drains", () => {
    const haven = scaleAbilityMiscStats(
      {
        allyShieldBonus: 500,
        shieldRechargeRate: 0.8,
        shieldCost: 250,
        shieldDrainPerAlly: 5,
        shieldDrainPerEnemy: 25,
      },
      { strength: 1.3, duration: 1.3, range: 1, efficiency: 1.3 },
      { warframeId: "hildryn", abilityName: "Haven" },
    );
    expect(haven.find((l) => l.label === "Ally Shields")!.scaled).toBe("650");
    expect(haven.find((l) => l.label === "Shield Recharge Rate")!).toMatchObject({
      base: "80%",
      scaled: "104%",
      scaleAttr: "duration",
    });
    expect(haven.find((l) => l.label === "Shield Cost")!).toMatchObject({
      base: "250",
      scaled: "175",
      scaleAttr: "efficiency",
    });
    // 5 × (0.7 / 1.3) ≈ 2.69
    expect(haven.find((l) => l.label === "Shield Drain/Ally")!.scaled).toBe("2.7/s");
    expect(haven.find((l) => l.label === "Shield Drain/Enemy")!.scaled).toBe("13.5/s");
    const storm = scaleAbilityMiscStats(
      { shieldCost: 100, shieldDrain: 25, shieldDrainPerEnemy: 25 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.3 },
      { warframeId: "hildryn", abilityName: "Aegis Storm" },
    );
    expect(storm.find((l) => l.label === "Shield Cost")!.scaled).toBe("70");
    expect(storm.find((l) => l.label === "Shield Drain")!.scaled).toBe("17.5/s");
    const balefire = scaleAbilityMiscStats(
      { shieldCost: 50 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.75 },
      { warframeId: "hildryn", abilityName: "Balefire" },
    );
    expect(balefire.find((l) => l.label === "Shield Cost")!).toMatchObject({
      base: "50",
      scaled: "12.5",
      scaleAttr: "efficiency",
    });
  });

  // wiki channeled drains: Peacemaker 15, Hysteria 5, Spectral Scream 3, Danse 20/40, Prowl 1/3 moving
  it("scales high-use channeled energyDrain with EFF/DUR across frames", () => {
    const drain = (wf: string, ability: string, misc: Record<string, number>) =>
      scaleAbilityMiscStats(misc, { strength: 1, duration: 1, range: 1, efficiency: 1.3 }, {
        warframeId: wf,
        abilityName: ability,
      });
    expect(drain("mesa", "Peacemaker", { energyDrain: 15 }).find((l) => l.label === "Energy Drain")).toMatchObject({
      base: "15/s",
      scaled: "10.5/s",
      scaleAttr: "efficiency",
    });
    expect(drain("valkyr", "Hysteria", { energyDrain: 5 }).find((l) => l.label === "Energy Drain")!.scaled).toBe(
      "3.5/s",
    );
    expect(drain("chroma", "Spectral Scream", { energyDrain: 3 }).find((l) => l.label === "Energy Drain")!.scaled).toBe(
      "2.1/s",
    );
    expect(drain("excalibur", "Exalted Blade", { energyDrain: 2.5 }).find((l) => l.label === "Energy Drain")).toMatchObject({
      base: "2.5/s",
      scaled: "1.8/s",
    });
    const danse = drain("revenant", "Danse Macabre", { energyDrain: 20, boostedEnergyDrain: 40 });
    expect(danse.find((l) => l.label === "Energy Drain")!.scaled).toBe("14/s");
    expect(danse.find((l) => l.label === "Boosted Energy Drain")!.scaled).toBe("28/s");
    const prowl = drain("ivara", "Prowl", { energyDrain: 1, energyDrainMoving: 3 });
    expect(prowl.find((l) => l.label === "Energy Drain")!).toMatchObject({
      base: "1/s",
      scaled: "0.70/s",
    });
    expect(prowl.find((l) => l.label === "Energy Drain (Moving)")!).toMatchObject({
      base: "3/s",
      scaled: "2.1/s",
    });
  });

  // wiki Pacify 0.5/s/enemy + Mend 3.5/s channeled drains
  it("scales Equinox Pacify/Mend channeled drains with EFF/DUR", () => {
    const pacify = scaleAbilityMiscStats(
      { energyDrainPerEnemy: 0.5 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.3 },
      { warframeId: "equinox", abilityName: "Pacify & Provoke" },
    );
    expect(pacify.find((l) => l.label === "Energy Drain per Enemy")!).toMatchObject({
      base: "0.50/s",
      scaled: "0.35/s",
      modified: true,
      scaleAttr: "efficiency",
    });
    const mend = scaleAbilityMiscStats(
      { energyDrain: 3.5 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.3 },
      { warframeId: "equinox", abilityName: "Mend & Maim" },
    );
    expect(mend.find((l) => l.label === "Energy Drain")!).toMatchObject({
      base: "3.5/s",
      // 3.5 × 0.7 → 2.45 (float → 2.4 with toFixed(1))
      scaled: "2.4/s",
      modified: true,
      scaleAttr: "efficiency",
    });
  });

  // wiki Gloom: 0.75/s/enemy × max((2−EFF)÷DUR, 0.25); was mis-shown as 75%
  it("scales Gloom energyDrainPerEnemy with channeled EFF/DUR and formats as /s", () => {
    const bare = scaleAbilityMiscStats(
      { energyDrainPerEnemy: 0.75, energyDrainEnemyCap: 10 },
      { strength: 1, duration: 1, range: 1, efficiency: 1 },
      { warframeId: "sevagoth", abilityName: "Gloom" },
    );
    expect(bare.find((l) => l.label === "Energy Drain per Enemy")!).toMatchObject({
      base: "0.75/s",
      scaled: "0.75/s",
      modified: false,
      scaleAttr: "efficiency",
    });
    expect(bare.find((l) => l.label === "Energy Drain Enemy Cap")!).toMatchObject({
      base: "10",
      modified: false,
    });
    const streamline = scaleAbilityMiscStats(
      { energyDrainPerEnemy: 0.75 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.3 },
      { warframeId: "sevagoth", abilityName: "Gloom" },
    );
    expect(streamline.find((l) => l.label === "Energy Drain per Enemy")!).toMatchObject({
      base: "0.75/s",
      // 0.75 × 0.7 → 0.525 (float → 0.52 with toFixed(2))
      scaled: "0.52/s",
      modified: true,
      scaleAttr: "efficiency",
    });
    const helminth = scaleAbilityMiscStats(
      { energyDrainPerEnemy: 0.75 },
      { strength: 1, duration: 1.3, range: 1, efficiency: 1.3 },
      { warframeId: "helminth", abilityName: "Gloom" },
    );
    // 0.75 × (0.7 / 1.3) ≈ 0.4038
    expect(helminth.find((l) => l.label === "Energy Drain per Enemy")!.scaled).toBe("0.40/s");
  });

  // wiki Nourish: 1+((mult−1)×STR); native 2×→2.3× / Helminth 1.6×→1.8× at 130% STR
  it("scales Nourish energyMultiplier as 1+(bonus×STR)", () => {
    const native = scaleAbilityMiscStats(
      { energyMultiplier: 2 },
      { strength: 1.3, duration: 1, range: 1 },
      { warframeId: "grendel", abilityName: "Nourish" },
    );
    expect(native.find((l) => l.label === "Energy Multiplier")!).toMatchObject({
      base: "2.0x",
      scaled: "2.3x",
      modified: true,
      scaleAttr: "strength",
    });
    const helminth = scaleAbilityMiscStats(
      { energyMultiplier: 1.6 },
      { strength: 1.3, duration: 1, range: 1 },
      { warframeId: "helminth", abilityName: "Nourish" },
    );
    expect(helminth.find((l) => l.label === "Energy Multiplier")!).toMatchObject({
      base: "1.6x",
      scaled: "1.8x",
      modified: true,
      scaleAttr: "strength",
    });
  });

  // wiki Absorb: 0.025% convert × STR (buff √(convert×STR×absorbed) needs absorbed sim)
  it("scales Absorb weaponDamageConvert percent-points with Strength", () => {
    const lines = scaleAbilityMiscStats(
      { weaponDamageConvert: 0.025, weaponDamageCap: 4 },
      { strength: 1.3, duration: 1, range: 1 },
      { warframeId: "nyx", abilityName: "Absorb" },
    );
    expect(lines.find((l) => l.label === "Weapon Damage Convert")!).toMatchObject({
      base: "0.025%",
      scaled: "0.0325%",
      modified: true,
      scaleAttr: "strength",
    });
    expect(lines.find((l) => l.label === "Weapon Damage Cap")!.modified).toBe(false);
  });

  // wiki channeled drain: base × max((2−EFF)÷DUR, 0.25); Sol Gate 12 → 8.4 at 130% EFF
  it("scales Sol Gate energyDrain with channeled EFF/DUR formula", () => {
    const streamline = scaleAbilityMiscStats(
      { energyDrain: 12, boostedEnergyDrain: 24 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.3 },
      { warframeId: "wisp", abilityName: "Sol Gate" },
    );
    expect(streamline.find((l) => l.label === "Energy Drain")!).toMatchObject({
      base: "12/s",
      scaled: "8.4/s",
      modified: true,
      scaleAttr: "efficiency",
    });
    expect(streamline.find((l) => l.label === "Boosted Energy Drain")!.scaled).toBe("16.8/s");
    const both = scaleAbilityMiscStats(
      { energyDrain: 12 },
      { strength: 1, duration: 1.3, range: 1, efficiency: 1.3 },
      { warframeId: "wisp", abilityName: "Sol Gate" },
    );
    // 12 × (0.7 / 1.3) ≈ 6.46
    expect(both.find((l) => l.label === "Energy Drain")!.scaled).toBe("6.5/s");
    const floor = scaleAbilityMiscStats(
      { energyDrain: 12 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.75 },
      { warframeId: "wisp", abilityName: "Sol Gate" },
    );
    expect(floor.find((l) => l.label === "Energy Drain")!.scaled).toBe("3/s");
  });

  // wiki Pacify: Modified DR = 1 − (0.5 ÷ STR); Intensify 130% → 61.5%
  it("scales Pacify damage reduction with 1−(base÷STR)", () => {
    const bare = scaleAbilityMiscStats(
      { pacifyDamageReduction: 0.5 },
      { strength: 1, duration: 1, range: 1 },
      { warframeId: "equinox", abilityName: "Pacify & Provoke" },
    );
    expect(bare.find((l) => l.label === "Pacify Damage Reduction")!).toMatchObject({
      base: "50%",
      scaled: "50%",
      modified: false,
      scaleAttr: "strength",
    });
    const intensify = scaleAbilityMiscStats(
      { pacifyDamageReduction: 0.5 },
      { strength: 1.3, duration: 1, range: 1 },
      { warframeId: "equinox", abilityName: "Pacify & Provoke" },
    );
    expect(intensify.find((l) => l.label === "Pacify Damage Reduction")!).toMatchObject({
      base: "50%",
      scaled: "62%",
      modified: true,
      scaleAttr: "strength",
    });
  });

  // wiki Energy Vampire: pulse interval ÷ DUR, floor 0.5s (2.25→1.125 at 200%; 0.5 at 500%)
  it("scales Energy Vampire pulseInterval inversely with Duration (0.5s floor)", () => {
    const at2x = scaleAbilityMiscStats(
      { pulseInterval: 2.25 },
      { strength: 1, duration: 2, range: 1 },
      { warframeId: "trinity", abilityName: "Energy Vampire" },
    );
    expect(at2x.find((l) => l.label === "Pulse Interval")!).toMatchObject({
      base: "2.3s",
      scaled: "1.1s",
      modified: true,
      scaleAttr: "duration",
    });
    const at5x = scaleAbilityMiscStats(
      { pulseInterval: 2.25 },
      { strength: 1, duration: 5, range: 1 },
      { warframeId: "trinity", abilityName: "Energy Vampire" },
    );
    expect(at5x.find((l) => l.label === "Pulse Interval")!.scaled).toBe("0.5s");
  });

  // wiki Shadows / Navigator / Prowl — decay, growth, steal time ÷ DUR
  it("scales Shadows decay, Navigator growth, and Prowl steal time inversely with Duration", () => {
    const shadows = scaleAbilityMiscStats(
      { healthDecayPerSecond: 0.03 },
      { strength: 1, duration: 2, range: 1 },
      { warframeId: "nekros", abilityName: "Shadows Of The Dead" },
    );
    expect(shadows.find((l) => l.label === "Health Decay/s")!).toMatchObject({
      base: "3%",
      scaled: "2%",
      modified: true,
      scaleAttr: "duration",
    });
    const nav = scaleAbilityMiscStats(
      { multiplierGrowth: 1 },
      { strength: 1, duration: 2, range: 1 },
      { warframeId: "ivara", abilityName: "Navigator" },
    );
    expect(nav.find((l) => l.label === "Multiplier Growth")!).toMatchObject({
      base: "100%",
      scaled: "50%",
      modified: true,
      scaleAttr: "duration",
    });
    const prowl = scaleAbilityMiscStats(
      { stealTime: 2.5 },
      { strength: 1, duration: 2, range: 1 },
      { warframeId: "ivara", abilityName: "Prowl" },
    );
    expect(prowl.find((l) => l.label === "Steal Time")!).toMatchObject({
      base: "2.5s",
      scaled: "1.3s",
      modified: true,
      scaleAttr: "duration",
    });
  });

  // wiki Bloodletting R3: 40% energy gain × Ability Efficiency (Streamline 130% → 52%)
  it("scales Bloodletting energyGainPercent with Efficiency", () => {
    const lines = scaleAbilityMiscStats(
      { energyGainPercent: 0.4, healthDeducted: 0.5, minimumHealth: 2 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.3 },
      { warframeId: "garuda", abilityName: "Bloodletting" },
    );
    const gain = lines.find((l) => l.label === "Energy Gain")!;
    expect(gain.base).toBe("40%");
    expect(gain.scaled).toBe("52%");
    expect(gain.modified).toBe(true);
    expect(gain.scaleAttr).toBe("efficiency");
    expect(lines.find((l) => l.label === "Health Deducted")!.modified).toBe(false);
  });

  // wiki Transmutation Probe: 1.5s CDR × Ability Efficiency (Streamline 130% → 1.95s)
  it("scales Transmutation Probe cooldownReduction with Efficiency", () => {
    const lines = scaleAbilityMiscStats(
      { cooldownReduction: 1.5, probeDuration: 3, probeSpeed: 15, haltDelay: 0.5 },
      { strength: 1, duration: 1, range: 1, efficiency: 1.3 },
      { warframeId: "lavos", abilityName: "Transmutation Probe" },
    );
    const cdr = lines.find((l) => l.label === "Cooldown Reduction")!;
    expect(cdr.base).toBe("1.5s");
    expect(cdr.scaled).toBe("2.0s");
    expect(cdr.modified).toBe(true);
    expect(cdr.scaleAttr).toBe("efficiency");
    expect(lines.find((l) => l.label === "Probe Duration")!.modified).toBe(false);
    expect(lines.find((l) => l.label === "Probe Speed")!.modified).toBe(false);
  });

  // wiki Contagion Cloud R3: 300 Toxin/s × STR, 5m × RNG, 12s × DUR; melee mult 2× fixed
  it("scales Contagion Cloud miscStats with STR/RNG/DUR (melee mult fixed)", () => {
    const lines = scaleAbilityMiscStats(
      {
        contagionCloudDps: 300,
        contagionCloudRange: 5,
        contagionCloudDuration: 12,
        contagionCloudMeleeMult: 2,
      },
      { strength: 2, duration: 1.5, range: 1.2 },
      { warframeId: "saryn", abilityName: "Toxic Lash" },
    );
    const dps = lines.find((l) => l.label === "Contagion Cloud DPS")!;
    const range = lines.find((l) => l.label === "Contagion Cloud Range")!;
    const duration = lines.find((l) => l.label === "Contagion Cloud Duration")!;
    const melee = lines.find((l) => l.label === "Contagion Melee Mult.")!;
    expect(dps.base).toBe("300/s");
    expect(dps.scaled).toBe("600/s");
    expect(range.base).toBe("5.0m");
    expect(range.scaled).toBe("6.0m");
    expect(duration.base).toBe("12.0s");
    expect(duration.scaled).toBe("18.0s");
    expect(melee.base).toBe("2.0x");
    expect(melee.scaled).toBe("2.0x");
    expect(melee.modified).toBe(false);
  });
});
