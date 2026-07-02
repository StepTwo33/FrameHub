/**
 * Simple in-memory rate limiter.
 * Tracks attempts per key (IP or email) with a sliding window.
 * Not distributed — works for single-server deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check if a key is rate-limited.
 * @returns `{ limited: false }` if allowed, `{ limited: true, retryAfterMs }` if blocked.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { limited: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false };
  }

  if (entry.count >= maxAttempts) {
    return { limited: true, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { limited: false };
}

/**
 * Clear a rate-limit key (e.g. after a successful login so legitimate
 * sign-in/sign-out cycles don't count toward lockout).
 */
export function clearRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Extract client IP from request headers (Cloudflare / proxy aware).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
