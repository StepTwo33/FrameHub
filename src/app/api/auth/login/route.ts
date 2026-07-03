import { NextRequest, NextResponse } from "next/server";
import {
    findUserByEmailInsensitive,
    verifyPassword,
    createSession,
    buildSessionUser,
    SESSION_COOKIE,
    framehubSessionCookieOptions,
} from "@/lib/auth";
import { isUserBanned } from "@/lib/admin";
import { checkRateLimit, clearRateLimit, getClientIp } from "@/lib/rate-limit";
import { getPublicOrigin } from "@/lib/public-origin";
import { logServerError } from "@/lib/log-server-error";
import { readJsonBodyLimited } from "@/lib/read-json-body";

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req.headers);
        const rl = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
        if (rl.limited) {
            return NextResponse.json(
                { error: "Too many login attempts. Please try again later." },
                { status: 429 }
            );
        }

        const parsed = await readJsonBodyLimited(req);
        if (!parsed.ok) return parsed.response;
        const body = parsed.body as { email?: string; password?: string };
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Per-account limit so a spoofed client IP can't enable password brute force.
        const accountRl = checkRateLimit(`login-account:${email.toLowerCase()}`, 10, 15 * 60 * 1000);
        if (accountRl.limited) {
            return NextResponse.json(
                { error: "Too many login attempts. Please try again later." },
                { status: 429 }
            );
        }

        // ---------- Find user ----------
        const user = await findUserByEmailInsensitive(email);
        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // ---------- Verify password ----------
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // ---------- Check email verification ----------
        if (!user.emailVerified) {
            return NextResponse.json(
                { error: "Please verify your email before signing in", needsVerification: true, email },
                { status: 403 }
            );
        }

        if (isUserBanned(user)) {
            return NextResponse.json(
                { error: "This account has been suspended. Contact support if you believe this is a mistake." },
                { status: 403 }
            );
        }

        // ---------- Create session ----------
        const sessionUser = await buildSessionUser(user);
        const token = await createSession(sessionUser);

        const origin = getPublicOrigin(req);

        const response = NextResponse.json({ success: true });
        response.cookies.set(SESSION_COOKIE, token, framehubSessionCookieOptions(origin));

        // Successful logins shouldn't count toward lockout (repeat sign-ins, shared NAT IPs).
        clearRateLimit(`login:${ip}`);
        clearRateLimit(`login-account:${email.toLowerCase()}`);

        return response;
    } catch (error) {
        logServerError("Login error", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
