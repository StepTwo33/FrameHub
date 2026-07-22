import { describe, expect, it } from "vitest";
import { scaleAbilityMiscStats } from "@/lib/codex/ability-misc-stats";

describe("scaleAbilityMiscStats", () => {
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

  it("formats Effigy miscStats as fixed Misc (no STR/RNG scaling)", () => {
    const lines = scaleAbilityMiscStats(
      {
        sentryArmor: 200,
        energyDrain: 10,
        stunRadius: 30,
        creditPickupRadius: 10,
      },
      { strength: 2, duration: 2, range: 2 },
      { warframeId: "chroma", abilityName: "Effigy" },
    );
    expect(lines.find((l) => l.label === "Sentry Armor")!.base).toBe("200");
    expect(lines.find((l) => l.label === "Sentry Armor")!.scaled).toBe("200");
    expect(lines.find((l) => l.label === "Sentry Armor")!.modified).toBe(false);
    expect(lines.find((l) => l.label === "Energy Drain")!.base).toBe("10/s");
    expect(lines.find((l) => l.label === "Energy Drain")!.modified).toBe(false);
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
