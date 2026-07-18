import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, clearFramehubSessionCookieOptions } from "@/lib/auth/auth";
import { getPublicOrigin } from "@/lib/site/public-origin";

export async function POST(req: NextRequest) {
  const origin = getPublicOrigin(req);
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", clearFramehubSessionCookieOptions(origin));
  return response;
}
