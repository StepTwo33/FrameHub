import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, generateOAuthState, oauthStateCookieOptions } from "@/lib/auth/auth";
import { getPublicOrigin } from "@/lib/site/public-origin";

export async function GET(req: NextRequest) {
    const origin = getPublicOrigin(req);
    const callbackUrl = `${origin}/api/auth/callback`;
    const state = generateOAuthState();
    const url = getGoogleAuthUrl(callbackUrl, state);
    const response = NextResponse.redirect(url);
    response.cookies.set("oauth_state", state, oauthStateCookieOptions(origin, 600));
    return response;
}
