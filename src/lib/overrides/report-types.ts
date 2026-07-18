/** Allowed `Report.itemType` — matches Prisma model comment. */
export const ALLOWED_REPORT_ITEM_TYPES = new Set([
  "weapon",
  "mod",
  "warframe",
  "companion",
  "archon_shard",
  "other",
]);

export function normalizeReportItemType(raw: unknown): string {
  if (typeof raw !== "string") return "other";
  const t = raw.trim().toLowerCase();
  return ALLOWED_REPORT_ITEM_TYPES.has(t) ? t : "other";
}
