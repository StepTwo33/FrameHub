/** Safe internal path for post-navigation return (open-redirect guard). */
export function isSafeReturnPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

export function encodeReturnTo(path: string): string {
  return encodeURIComponent(path);
}

export function decodeReturnTo(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return isSafeReturnPath(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function appendReturnTo(url: string, returnTo: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}returnTo=${encodeReturnTo(returnTo)}`;
}

export function returnLabel(path: string): string {
  if (path.startsWith("/codex")) return "Back to Codex";
  if (path.startsWith("/warframe-builder")) return "Back to Warframe Builder";
  if (path.startsWith("/weapon-builder")) return "Back to Weapon Builder";
  if (path.startsWith("/companion-builder")) return "Back to Companion Builder";
  return "Back";
}
