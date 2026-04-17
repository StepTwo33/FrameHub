import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, generateOAuthState } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/public-origin";

export async function GET(req: NextRequest) {
    const origin = getPublicOrigin(req);
    const callbackUrl = `${origin}/api/auth/callback`;
    const state = generateOAuthState();
    const url = getGoogleAuthUrl(callbackUrl, state);
    const response = NextResponse.redirect(url);
    response.cookies.set("oauth_state", state, {
        httpOnly: true,
        secure: origin.startsWith("https"),
        sameSite: "lax",
        path: "/",
        maxAge: 600, // 10 minutes
    });
    return response;
}
