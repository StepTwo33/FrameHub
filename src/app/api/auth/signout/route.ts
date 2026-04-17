import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/public-origin";

export async function POST(req: NextRequest) {
  const origin = getPublicOrigin(req);
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
