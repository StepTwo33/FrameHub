import { describe, expect, it } from "vitest";
import { allWeapons } from "@/data/weapons";
import { incarnonDataMap } from "@/data/incarnon";
import { calculateWeaponBuild } from "@/lib/calc/calculator";
import {
  isIncarnonFormActive,
  resolveIncarnonActiveWeapon,
} from "@/lib/calc/incarnon-active-weapon";
import { mergeIncarnonStatChanges } from "@/lib/calc/weapon-stat-merges";

const modsMap = () => new Map();

describe("Torid Incarnon Form", () => {
  const torid = allWeapons.find((w) => w.id === "torid")!;
  const data = incarnonDataMap.get("torid")!;

  it("detects form when tier-1 Incarnon Form is selected", () => {
    expect(isIncarnonFormActive({ 1: 0 }, data)).toBe(true);
    expect(isIncarnonFormActive({}, data)).toBe(false);
  });

  it("keeps grenade stats when form inactive", () => {
    const calc = resolveIncarnonActiveWeapon(torid, data, {});
    expect(calc.damage).toBe(torid.damage);
    expect(calc.fireRate).toBeCloseTo(torid.fireRate, 4);
    const stats = calculateWeaponBuild(calc, [], modsMap());
    expect(stats.fireRate).toBeCloseTo(torid.fireRate, 4);
    expect(stats.magazine).toBe(torid.magazine);
  });

  it("uses form beam stats when Incarnon Form selected", () => {
    const calc = resolveIncarnonActiveWeapon(torid, data, { 1: 0 });
    expect(calc.damage).toBe(51);
    expect(calc.toxin).toBe(51);
    expect(calc.fireRate).toBe(8);
    expect(calc.criticalChance).toBeCloseTo(0.29, 5);
    expect(calc.criticalMultiplier).toBeCloseTo(3.1, 5);
    expect(calc.statusChance).toBeCloseTo(0.39, 5);
    expect(calc.magazine).toBe(170);
    expect(calc.triggerType).toBe("Held");
    expect(calc.radialAttacks).toEqual([]);

    const stats = calculateWeaponBuild(calc, [], modsMap(), undefined, undefined, {
      incarnonFormActive: true,
    });
    expect(stats.fireRate).toBe(8);
    expect(stats.magazine).toBe(170);
    expect(stats.totalDamage).toBeCloseTo(51, 0);
  });

  it("Extended Volley adds +9 magazine", () => {
    const base = resolveIncarnonActiveWeapon(torid, data, { 1: 0 });
    const changes = mergeIncarnonStatChanges(data, { 1: 0, 3: 2 }, "torid");
    expect(changes?.flatMagazine).toBe(9);
    const stats = calculateWeaponBuild(base, [], modsMap(), changes, undefined, {
      incarnonFormActive: true,
    });
    expect(stats.magazine).toBe(179);
  });

  it("flatBaseDamage scales against form base (51) when form active", () => {
    const formWeapon = resolveIncarnonActiveWeapon(torid, data, { 1: 0 });
    const formStats = calculateWeaponBuild(formWeapon, [], modsMap(), { flatBaseDamage: 51 });
    expect(formStats.totalDamage).toBeCloseTo(102, 0);

    const baseStats = calculateWeaponBuild(torid, [], modsMap(), { flatBaseDamage: 51 });
    expect(baseStats.totalDamage).toBeCloseTo(140 * (1 + 51 / 140), 0);
  });
});

describe("wiki-shaped Incarnon forms", () => {
  it("Burston form uses Auto Heat / FR 20 / mag 600", () => {
    const burston = allWeapons.find((w) => w.id === "burston")!;
    const data = incarnonDataMap.get("burston")!;
    const form = resolveIncarnonActiveWeapon(burston, data, { 1: 0 });
    expect(form.fireRate).toBe(20);
    expect(form.magazine).toBe(600);
    expect(form.triggerType).toBe("Auto");
    expect(form.heat).toBe(3);
    expect(form.radialAttacks?.some((a) => /incarnon form/i.test(a.name))).toBe(true);
  });

  it("Burston Prime syncs Heat 13 from form radial", () => {
    const prime = allWeapons.find((w) => w.id === "burston_prime")!;
    const data = incarnonDataMap.get("burston_prime")!;
    const form = resolveIncarnonActiveWeapon(prime, data, { 1: 0 });
    expect(form.heat).toBe(13);
    expect(form.damage).toBe(13);
  });

  it("Soma form is 8-pellet shotgun", () => {
    const soma = allWeapons.find((w) => w.id === "soma")!;
    const data = incarnonDataMap.get("soma")!;
    const form = resolveIncarnonActiveWeapon(soma, data, { 1: 0 });
    expect(form.multishot).toBe(8);
    expect(form.fireRate).toBe(7);
    expect(form.magazine).toBe(200);
    expect(form.criticalChance).toBeCloseTo(0.1, 5);
  });

  it("Phenmor form is Slash+Radiation Auto FR 13.33", () => {
    const phenmor = allWeapons.find((w) => w.id === "phenmor")!;
    const data = incarnonDataMap.get("phenmor")!;
    const form = resolveIncarnonActiveWeapon(phenmor, data, { 1: 0 });
    expect(form.slash).toBe(80);
    expect(form.radiation).toBe(60);
    expect(form.damage).toBe(140);
    expect(form.fireRate).toBeCloseTo(13.33, 2);
    expect(form.magazine).toBe(408);
  });

  it("melee Incarnon Form does not double base damage", () => {
    const hate = allWeapons.find((w) => w.id === "hate")!;
    const data = incarnonDataMap.get("hate")!;
    const form = resolveIncarnonActiveWeapon(hate, data, { 1: 0 });
    expect(form.damage).toBe(hate.damage);
  });

  it("form radials contribute only when incarnonFormActive", () => {
    const burston = allWeapons.find((w) => w.id === "burston")!;
    const data = incarnonDataMap.get("burston")!;
    const form = resolveIncarnonActiveWeapon(burston, data, { 1: 0 });
    const off = calculateWeaponBuild(form, [], modsMap());
    const on = calculateWeaponBuild(form, [], modsMap(), undefined, undefined, {
      incarnonFormActive: true,
    });
    expect(on.radialBurstDps ?? 0).toBeGreaterThan(off.radialBurstDps ?? 0);
  });
});

describe("evolution numeric fixes", () => {
  it("Despair Fatal Affliction / Elemental Balance / Survivor's Edge", () => {
    const data = incarnonDataMap.get("despair")!;
    expect(mergeIncarnonStatChanges(data, { 2: 0 }, "despair")?.flatBaseDamage).toBe(50);
    expect(mergeIncarnonStatChanges(data, { 4: 0 }, "despair")?.statusChance).toBe(0.24);
    expect(mergeIncarnonStatChanges(data, { 4: 1 }, "despair")?.criticalChance).toBe(0.12);
  });

  it("Vasto Lone Gun uses unconditional +66 only", () => {
    const data = incarnonDataMap.get("vasto")!;
    expect(mergeIncarnonStatChanges(data, { 2: 0 }, "vasto")?.flatBaseDamage).toBe(66);
  });

  it("Sybaris Extended Volley +8 / Well Rehearsed +20", () => {
    const data = incarnonDataMap.get("sybaris")!;
    expect(mergeIncarnonStatChanges(data, { 3: 0 }, "sybaris")?.flatMagazine).toBe(8);
    expect(mergeIncarnonStatChanges(data, { 1: 1 }, "sybaris")?.flatBaseDamage).toBe(20);
    expect(mergeIncarnonStatChanges(data, { 1: 1 }, "dex_sybaris")?.flatBaseDamage).toBe(15);
  });

  it("Despair Vendetta is +60 flat only (no always-on MS)", () => {
    const data = incarnonDataMap.get("despair")!;
    const changes = mergeIncarnonStatChanges(data, { 2: 1 }, "despair");
    expect(changes?.flatBaseDamage).toBe(60);
    expect(changes?.multishot).toBeUndefined();
  });

  it("Paris Vicious Promise stays description-only (undamaged conditional)", () => {
    const data = incarnonDataMap.get("paris")!;
    expect(mergeIncarnonStatChanges(data, { 4: 0 }, "paris")).toBeUndefined();
  });

  it("Braton Daring Reverie / Munitions Grit variant flats", () => {
    const data = incarnonDataMap.get("braton")!;
    expect(mergeIncarnonStatChanges(data, { 1: 1 }, "braton")?.flatBaseDamage).toBe(24);
    expect(mergeIncarnonStatChanges(data, { 1: 2 }, "braton_prime")?.flatBaseDamage).toBe(2);
    expect(mergeIncarnonStatChanges(data, { 1: 2 }, "braton")?.multishot).toBe(0.2);
  });

  it("Latron Riddled Target / Critical Parallel", () => {
    const data = incarnonDataMap.get("latron")!;
    expect(mergeIncarnonStatChanges(data, { 1: 1 }, "latron")?.flatBaseDamage).toBe(48);
    expect(mergeIncarnonStatChanges(data, { 1: 1 }, "latron_prime")?.flatBaseDamage).toBe(6);
    expect(mergeIncarnonStatChanges(data, { 4: 2 }, "latron")?.criticalChance).toBe(0.3);
    expect(mergeIncarnonStatChanges(data, { 4: 2 }, "latron")?.criticalMultiplier).toBe(0.6);
  });

  it("Furis Haven Foray +28 / Mk1 +34", () => {
    const data = incarnonDataMap.get("furis")!;
    expect(mergeIncarnonStatChanges(data, { 1: 1 }, "furis")?.flatBaseDamage).toBe(28);
    expect(mergeIncarnonStatChanges(data, { 1: 1 }, "mk1_furis")?.flatBaseDamage).toBe(34);
  });

  it("melee T1 +100% Melee Damage encodes as damage:1", () => {
    const data = incarnonDataMap.get("hate")!;
    expect(mergeIncarnonStatChanges(data, { 1: 0 }, "hate")?.damage).toBe(1);
  });

  it("Gorgon / Strun flat base damage tables", () => {
    const gorgon = incarnonDataMap.get("gorgon")!;
    expect(mergeIncarnonStatChanges(gorgon, { 1: 1 }, "gorgon")?.flatBaseDamage).toBe(10);
    const strun = incarnonDataMap.get("strun")!;
    expect(mergeIncarnonStatChanges(strun, { 1: 1 }, "strun")?.flatBaseDamage).toBe(54);
    expect(mergeIncarnonStatChanges(strun, { 1: 1 }, "strun_prime")?.flatBaseDamage).toBe(2);
  });
});

describe("pass-3 wiki forms", () => {
  it("Lex form is Radiation+Impact 1000", () => {
    const lex = allWeapons.find((w) => w.id === "lex")!;
    const data = incarnonDataMap.get("lex")!;
    const form = resolveIncarnonActiveWeapon(lex, data, { 1: 0 });
    expect(form.radiation).toBe(700);
    expect(form.impact).toBe(300);
    expect(form.damage).toBe(1000);
    expect(form.magazine).toBe(20);
  });

  it("Atomos form is Impact 100 Semi grenades", () => {
    const atomos = allWeapons.find((w) => w.id === "atomos")!;
    const data = incarnonDataMap.get("atomos")!;
    const form = resolveIncarnonActiveWeapon(atomos, data, { 1: 0 });
    expect(form.impact).toBe(100);
    expect(form.triggerType).toBe("Semi");
    expect(form.fireRate).toBe(1.5);
    expect(form.magazine).toBe(21);
  });

  it("Furis form is Heat Held beam", () => {
    const furis = allWeapons.find((w) => w.id === "furis")!;
    const data = incarnonDataMap.get("furis")!;
    const form = resolveIncarnonActiveWeapon(furis, data, { 1: 0 });
    expect(form.heat).toBe(100);
    expect(form.triggerType).toBe("Held");
    expect(form.fireRate).toBe(12);
    expect(form.magazine).toBe(280);
  });

  it("Sybaris form is 90 IPS / mag 200", () => {
    const sybaris = allWeapons.find((w) => w.id === "sybaris")!;
    const data = incarnonDataMap.get("sybaris")!;
    const form = resolveIncarnonActiveWeapon(sybaris, data, { 1: 0 });
    expect(form.damage).toBe(90);
    expect(form.magazine).toBe(200);
    expect(form.criticalChance).toBeCloseTo(0.2, 5);
  });

  it("Boltor form is 4×3 multishot slash bias", () => {
    const boltor = allWeapons.find((w) => w.id === "boltor")!;
    const data = incarnonDataMap.get("boltor")!;
    const form = resolveIncarnonActiveWeapon(boltor, data, { 1: 0 });
    expect(form.multishot).toBe(3);
    expect(form.slash).toBe(2.4);
    expect(form.damage).toBe(4);
    expect(form.magazine).toBe(160);
  });

  it("Angstrum form strips rocket radials for Heat Auto", () => {
    const angstrum = allWeapons.find((w) => w.id === "angstrum")!;
    const data = incarnonDataMap.get("angstrum")!;
    const form = resolveIncarnonActiveWeapon(angstrum, data, { 1: 0 });
    expect(form.heat).toBe(30);
    expect(form.triggerType).toBe("Auto");
    expect(form.magazine).toBe(120);
    expect(form.radialAttacks).toEqual([]);
  });

  it("Vectis form is Cold 5 / mag 45", () => {
    const vectis = allWeapons.find((w) => w.id === "vectis")!;
    const data = incarnonDataMap.get("vectis")!;
    const form = resolveIncarnonActiveWeapon(vectis, data, { 1: 0 });
    expect(form.cold).toBe(5);
    expect(form.magazine).toBe(45);
    expect(form.fireRate).toBeCloseTo(1.333, 3);
  });

  it("Boar form is Heat Held beam", () => {
    const boar = allWeapons.find((w) => w.id === "boar")!;
    const data = incarnonDataMap.get("boar")!;
    const form = resolveIncarnonActiveWeapon(boar, data, { 1: 0 });
    expect(form.heat).toBe(20);
    expect(form.triggerType).toBe("Held");
    expect(form.magazine).toBe(150);
  });

  it("Dera form is Magnetic hybrid Semi", () => {
    const dera = allWeapons.find((w) => w.id === "dera")!;
    const data = incarnonDataMap.get("dera")!;
    const form = resolveIncarnonActiveWeapon(dera, data, { 1: 0 });
    expect(form.magnetic).toBe(80);
    expect(form.damage).toBe(330);
    expect(form.magazine).toBe(50);
  });

  it("Vasto form is 6-pellet Burst", () => {
    const vasto = allWeapons.find((w) => w.id === "vasto")!;
    const data = incarnonDataMap.get("vasto")!;
    const form = resolveIncarnonActiveWeapon(vasto, data, { 1: 0 });
    expect(form.multishot).toBe(6);
    expect(form.triggerType).toBe("Burst");
    expect(form.damage).toBe(30);
    expect(form.magazine).toBe(24);
  });

  it("Ballistica form is Slash 640 Charge", () => {
    const ballistica = allWeapons.find((w) => w.id === "ballistica")!;
    const data = incarnonDataMap.get("ballistica")!;
    const form = resolveIncarnonActiveWeapon(ballistica, data, { 1: 0 });
    expect(form.slash).toBe(640);
    expect(form.triggerType).toBe("Charge");
    expect(form.magazine).toBe(18);
  });

  it("Stug form keeps Incarnon blob radials only", () => {
    const stug = allWeapons.find((w) => w.id === "stug")!;
    const data = incarnonDataMap.get("stug")!;
    const form = resolveIncarnonActiveWeapon(stug, data, { 1: 0 });
    expect(form.corrosive).toBe(50);
    expect(form.magazine).toBe(120);
    expect(form.radialAttacks?.every((a) => /incarnon form/i.test(a.name))).toBe(true);
    expect(form.radialAttacks?.length).toBeGreaterThan(0);
  });

  it("Dual Toxocyst form is Auto IPS 75 / mag 270", () => {
    const w = allWeapons.find((x) => x.id === "dual_toxocyst")!;
    const data = incarnonDataMap.get("dual_toxocyst")!;
    const form = resolveIncarnonActiveWeapon(w, data, { 1: 0 });
    expect(form.damage).toBe(75);
    expect(form.triggerType).toBe("Auto");
    expect(form.fireRate).toBe(4.5);
    expect(form.magazine).toBe(270);
  });
});
