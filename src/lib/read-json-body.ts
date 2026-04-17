import { NextRequest, NextResponse } from "next/server";

/** Default cap for auth POST bodies (email, password, name, codes). */
export const AUTH_JSON_BODY_MAX = 24_576;

export async function readJsonBodyLimited(
  req: NextRequest,
  maxBytes = AUTH_JSON_BODY_MAX,
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  const text = await req.text();
  if (text.length > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body too large" }, { status: 413 }),
    };
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request" }, { status: 400 }),
    };
  }
  try {
    return { ok: true, body: JSON.parse(trimmed) };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}
