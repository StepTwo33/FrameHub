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

    const stats = calculateWeaponBuild(calc, [], modsMap());
    expect(stats.fireRate).toBe(8);
    expect(stats.magazine).toBe(170);
    expect(stats.totalDamage).toBeCloseTo(51, 0);
  });

  it("Extended Volley adds +9 magazine", () => {
    const base = resolveIncarnonActiveWeapon(torid, data, { 1: 0 });
    const changes = mergeIncarnonStatChanges(data, { 1: 0, 3: 2 }, "torid");
    expect(changes?.flatMagazine).toBe(9);
    const stats = calculateWeaponBuild(base, [], modsMap(), changes);
    expect(stats.magazine).toBe(179);
  });

  it("flatBaseDamage scales against form base (51) when form active", () => {
    const formWeapon = resolveIncarnonActiveWeapon(torid, data, { 1: 0 });
    const formStats = calculateWeaponBuild(formWeapon, [], modsMap(), { flatBaseDamage: 51 });
    // +51 flat on 51 base → 2× damage
    expect(formStats.totalDamage).toBeCloseTo(102, 0);

    const baseStats = calculateWeaponBuild(torid, [], modsMap(), { flatBaseDamage: 51 });
    // +51 on 140 arsenal → 1 + 51/140
    expect(baseStats.totalDamage).toBeCloseTo(140 * (1 + 51 / 140), 0);
  });
});
