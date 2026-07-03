import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForUser,
  findOrCreateUser,
  createSession,
  SESSION_COOKIE,
  framehubSessionCookieOptions,
  oauthStateCookieOptions,
} from "@/lib/auth";
import { getPublicOrigin } from "@/lib/public-origin";

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

  const origin = getPublicOrigin(req);
  const callbackUrl = `${origin}/api/auth/callback`;

  const googleUser = await exchangeCodeForUser(code, callbackUrl);
  if (!googleUser) {
    return NextResponse.redirect(new URL("/?error=auth_failed", origin));
  }

  // Persist to DB and link Google account
  let user;
  try {
    user = await findOrCreateUser(googleUser.email, {
      name: googleUser.name,
      image: googleUser.image,
      emailVerified: true,
      provider: "google",
      providerAccountId: googleUser.id,
    });
  } catch {
    return NextResponse.redirect(new URL("/?error=account_suspended", origin));
  }

  const token = await createSession(user);
  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.set(SESSION_COOKIE, token, framehubSessionCookieOptions(origin));
  response.cookies.set("oauth_state", "", oauthStateCookieOptions(origin, 0));

  return response;
}
