import { NextRequest, NextResponse } from "next/server";
import {
    validateVerificationToken,
    findUserByEmailInsensitive,
    createSession,
    SESSION_COOKIE,
    framehubSessionCookieOptions,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getPublicOrigin } from "@/lib/public-origin";
import { logServerError } from "@/lib/log-server-error";
import { readJsonBodyLimited } from "@/lib/read-json-body";

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req.headers);
        const rl = checkRateLimit(`verify:${ip}`, 5, 15 * 60 * 1000);
        if (rl.limited) {
            return NextResponse.json(
                { error: "Too many verification attempts. Please try again later." },
                { status: 429 }
            );
        }

        const parsed = await readJsonBodyLimited(req);
        if (!parsed.ok) return parsed.response;
        const { email, code } = parsed.body as { email?: string; code?: string };

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and verification code are required" },
                { status: 400 }
            );
        }

        // Per-account limit so a spoofed client IP can't brute-force the 6-digit code.
        const accountRl = checkRateLimit(`verify-account:${email.toLowerCase()}`, 10, 15 * 60 * 1000);
        if (accountRl.limited) {
            return NextResponse.json(
                { error: "Too many verification attempts. Please try again later." },
                { status: 429 }
            );
        }

        // Look up the user first (case-insensitive) so token validation and the
        // emailVerified update both use the email stored on the user row.
        const user = await findUserByEmailInsensitive(email);
        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        const valid = await validateVerificationToken(user.email!, code);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        const token = await createSession({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email!,
            image: user.image,
            emailVerified: true,
            role: user.role,
        });

        const origin = getPublicOrigin(req);

        const response = NextResponse.json({ success: true });
        response.cookies.set(SESSION_COOKIE, token, framehubSessionCookieOptions(origin));

        return response;
    } catch (error) {
        logServerError("Email verification error", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
