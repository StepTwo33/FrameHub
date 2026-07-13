import { NextRequest, NextResponse } from "next/server";
import { getSession, generateOAuthState, oauthStateCookieOptions } from "@/lib/auth";
import { getDiscordLinkAuthUrl, getDiscordClientId } from "@/lib/bot/discord-oauth";
import { getPublicOrigin } from "@/lib/public-origin";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/signin?callbackUrl=/bot/dashboard", getPublicOrigin(req)));
  }
  if (!getDiscordClientId()) {
    return NextResponse.json(
      { error: "Discord is not configured (DISCORD_CLIENT_ID missing)." },
      { status: 503 },
    );
  }

  const origin = getPublicOrigin(req);
  const state = generateOAuthState();
  const url = getDiscordLinkAuthUrl(origin, state);
  const res = NextResponse.redirect(url);
  res.cookies.set("discord_oauth_state", state, oauthStateCookieOptions(origin, 600));
  res.cookies.set("discord_oauth_uid", session.user.id, oauthStateCookieOptions(origin, 600));
  return res;
}
