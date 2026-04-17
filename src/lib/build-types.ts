/** Allowed `Build.type` values — must match client `SavedBuild` and Prisma usage. */
export const ALLOWED_BUILD_TYPES = new Set([
  "weapon",
  "warframe",
  "companion",
  "modular",
  "archwing",
  "railjack",
]);

export function isAllowedBuildType(type: unknown): type is string {
  return typeof type === "string" && ALLOWED_BUILD_TYPES.has(type);
}

export function safeParseBuildJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
