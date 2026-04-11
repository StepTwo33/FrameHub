/**
 * Make warframe ability / passive description text readable in the UI:
 * strips wiki-style tags and normalizes placeholders.
 */
export function formatAbilityDescription(raw: string): string {
  if (!raw) return "";
  let s = raw;
  // Remove <DT_* ...> and similar tags (keep inner text where useful)
  s = s.replace(/<DT_[A-Z0-9_]+(?:_COLOR)?>/gi, "");
  s = s.replace(/<\/DT_[A-Z0-9_]+>/gi, "");
  s = s.replace(/<AFFINITY_SHARE>/gi, "Affinity Range");
  s = s.replace(/<[^>]+>/g, "");
  // Placeholders like |DAMAGE| — keep readable
  s = s.replace(/\|([A-Z0-9_]+)\|/g, "[$1]");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
