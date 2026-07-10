/** Community build meta tags — stored as JSON array on Build.tags. */

export const BUILD_TAG_OPTIONS = [
  { id: "steel_path", label: "Steel Path" },
  { id: "eda", label: "EDA / ETA" },
  { id: "level_cap", label: "Level Cap" },
  { id: "boss", label: "Boss" },
  { id: "budget", label: "Budget" },
  { id: "beginner", label: "Beginner" },
  { id: "endgame", label: "Endgame" },
  { id: "status", label: "Status" },
  { id: "crit", label: "Crit" },
  { id: "aoe", label: "AoE" },
  { id: "single_target", label: "Single Target" },
  { id: "support", label: "Support" },
] as const;

export type BuildTagId = (typeof BUILD_TAG_OPTIONS)[number]["id"];

const VALID = new Set(BUILD_TAG_OPTIONS.map((t) => t.id));

export function parseBuildTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((t): t is string => typeof t === "string" && VALID.has(t as BuildTagId));
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      return parseBuildTags(JSON.parse(raw));
    } catch {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter((t) => VALID.has(t as BuildTagId));
    }
  }
  return [];
}

export function serializeBuildTags(tags: string[]): string {
  return JSON.stringify(parseBuildTags(tags));
}

export function tagLabel(id: string): string {
  return BUILD_TAG_OPTIONS.find((t) => t.id === id)?.label ?? id;
}
