import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, clearFramehubSessionCookieOptions } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/public-origin";

export async function POST(req: NextRequest) {
  const origin = getPublicOrigin(req);
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", clearFramehubSessionCookieOptions(origin));
  return response;
}
