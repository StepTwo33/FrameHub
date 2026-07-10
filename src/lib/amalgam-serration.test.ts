import { describe, expect, it } from "vitest";
import { allMods } from "@/data/mods";
import { allWeapons } from "@/data/weapons";
import { allWarframes } from "@/data/warframes";
import { calculateWeaponBuild, calculateWarframeBuild } from "@/lib/calculator";
import { getModStatDisplayLines } from "@/lib/mod-display";

const modsMap = new Map(allMods.map((m) => [m.id, m]));

describe("Amalgam Serration", () => {
  const amalgam = allMods.find((m) => m.id === "amalgam_serration")!;

  it("has damage + slideSpeed only (no bogus sprintSpeed)", () => {
    expect(amalgam).toBeDefined();
    expect(amalgam.stats.damage).toBeGreaterThan(0);
    expect(amalgam.stats.slideSpeed).toBe(5);
    expect(amalgam.stats.sprintSpeed).toBeUndefined();
  });

  it("applies +55% slide speed at max rank on weapon stats", () => {
    const weapon = allWeapons.find((w) => w.category === "rifle" || w.category === "primary")!;
    const stats = calculateWeaponBuild(
      weapon,
      [{ modId: "amalgam_serration", rank: amalgam.maxRank, slotIndex: 0 }],
      modsMap,
    );
    expect(stats.slideSpeedBonus).toBeCloseTo(0.55, 5);
  });

  it("shows slide speed on mod card lines", () => {
    const lines = getModStatDisplayLines(amalgam, amalgam.maxRank);
    const slide = lines.find((l) => l.statKey === "slideSpeed");
    expect(slide).toBeDefined();
    expect(slide!.atRank).toMatch(/\+55%/);
  });

  it("feeds slide speed into warframe when primary has Amalgam Serration (loadout linkage)", () => {
    const wf = allWarframes[0]!;
    const stats = calculateWarframeBuild(wf, [], modsMap, {
      primaryMods: [{ modId: "amalgam_serration", rank: amalgam.maxRank, slotIndex: 0 }],
    });
    expect(stats.slideSpeedBonus).toBeCloseTo(0.55, 5);
  });

  it("applies Maglev slide speed on warframe mods", () => {
    const maglev = allMods.find((m) => m.id === "maglev");
    if (!maglev) return;
    const wf = allWarframes[0]!;
    const stats = calculateWarframeBuild(
      wf,
      [{ modId: "maglev", rank: maglev.maxRank, slotIndex: 0 }],
      modsMap,
    );
    const expected = (maglev.stats.slideSpeed! * (maglev.maxRank + 1)) / 100;
    expect(stats.slideSpeedBonus).toBeCloseTo(expected, 5);
  });
});
