import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const origin = req.headers.get("x-forwarded-proto") && req.headers.get("x-forwarded-host")
    ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("x-forwarded-host")}`
    : req.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
