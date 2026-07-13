import { describe, expect, it } from "vitest";
import { buildArsenalData, normalizeArsenalLoadOuts } from "@/lib/warframe-arsenal/normalize-payload";

const minimalPayload = {
  accountInfo: {
    playerName: "Tester",
    masteryRank: 10,
    lastUpdated: 1_700_000_000,
    glyph: "",
    focus: "",
  },
  loadOuts: {
    NORMAL: {
      warframe: {
        uniqueName: "/Lotus/Powersuits/Excalibur/Excalibur",
        upgrades: [],
      },
    },
  },
};

describe("normalizeArsenalLoadOuts", () => {
  it("fills missing optional DE sections required by arsenal-parser", () => {
    const normalized = normalizeArsenalLoadOuts(minimalPayload.loadOuts);
    expect(normalized.NORMAL).toBeTruthy();
    expect(normalized.ARCHWING).toEqual({});
    expect(normalized.DATAKNIFE).toEqual({});
    expect(normalized.OPERATOR).toEqual({});
    expect(normalized.SENTINEL).toEqual({});
  });
});

describe("buildArsenalData", () => {
  it("parses payloads that omit empty ARCHWING/SENTINEL sections", () => {
    const arsenal = buildArsenalData(minimalPayload);
    expect(arsenal.account.name).toBe("Tester");
    expect(arsenal.loadout.warframe.uniqueName).toContain("Excalibur");
  });
});
