import { describe, expect, it } from "vitest";
import {
  deepMergeOverrideFields,
  OVERRIDE_DELETE,
  buildNestedPatch,
} from "@/lib/override-merge";

describe("deepMergeOverrideFields deletion", () => {
  it("removes nested stats marked with null", () => {
    const base = {
      id: "amalgam_serration",
      stats: { damage: 14, slideSpeed: 5, sprintSpeed: 2.27 },
    };
    const merged = deepMergeOverrideFields(base, {
      stats: { sprintSpeed: null },
    });
    expect(merged.stats).toEqual({ damage: 14, slideSpeed: 5 });
    expect("sprintSpeed" in merged.stats).toBe(false);
  });

  it("removes nested stats marked with OVERRIDE_DELETE", () => {
    const base = { stats: { damage: 10, bogus: 99 } };
    const merged = deepMergeOverrideFields(base, {
      stats: { bogus: OVERRIDE_DELETE },
    });
    expect(merged.stats).toEqual({ damage: 10 });
  });

  it("removes top-level keys with null", () => {
    const base = { id: "x", note: "bad", name: "Keep" };
    const merged = deepMergeOverrideFields(base, { note: null });
    expect(merged).toEqual({ id: "x", name: "Keep" });
  });

  it("buildNestedPatch preserves delete sentinels", () => {
    const patch = buildNestedPatch({
      "stats.sprintSpeed": OVERRIDE_DELETE,
      "stats.damage": 15,
    });
    expect(patch).toEqual({
      stats: { sprintSpeed: OVERRIDE_DELETE, damage: 15 },
    });
  });
});
