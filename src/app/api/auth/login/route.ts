import { NextRequest, NextResponse } from "next/server";
import {
    findUserByEmail,
    verifyPassword,
    createSession,
    SESSION_COOKIE,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

        const body = await req.json();
        const { email, password } = body as { email?: string; password?: string };

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // ---------- Find user ----------
        const user = await findUserByEmail(email);
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

        // ---------- Create session ----------
        const token = await createSession({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email!,
            image: user.image,
            emailVerified: true,
            role: user.role,
        });

        const origin = req.headers.get("x-forwarded-proto") && req.headers.get("x-forwarded-host")
            ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("x-forwarded-host")}`
            : req.nextUrl.origin;

        const response = NextResponse.json({ success: true });
        response.cookies.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: origin.startsWith("https"),
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
