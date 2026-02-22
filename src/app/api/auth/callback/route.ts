import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForUser, findOrCreateUser, createSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }

  // Verify OAuth state to prevent CSRF
  const stateParam = req.nextUrl.searchParams.get("state");
  const stateCookie = req.cookies.get("oauth_state")?.value;
  if (!stateParam || !stateCookie || stateParam !== stateCookie) {
    return NextResponse.redirect(new URL("/?error=invalid_state", req.url));
  }

  const origin = req.headers.get("x-forwarded-proto") && req.headers.get("x-forwarded-host")
    ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("x-forwarded-host")}`
    : req.nextUrl.origin;
  const callbackUrl = `${origin}/api/auth/callback`;

  const googleUser = await exchangeCodeForUser(code, callbackUrl);
  if (!googleUser) {
    return NextResponse.redirect(new URL("/?error=auth_failed", origin));
  }

  // Persist to DB and link Google account
  const user = await findOrCreateUser(googleUser.email, {
    name: googleUser.name,
    image: googleUser.image,
    emailVerified: true,
    provider: "google",
    providerAccountId: googleUser.id,
  });

  const token = await createSession(user);
  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  // Clear the oauth_state cookie
  response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });

  return response;
}
