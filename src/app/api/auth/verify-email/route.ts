import { NextRequest, NextResponse } from "next/server";
import {
    validateVerificationToken,
    findUserByEmail,
    createSession,
    SESSION_COOKIE,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getPublicOrigin } from "@/lib/public-origin";
import { logServerError } from "@/lib/log-server-error";

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

        const body = await req.json();
        const { email, code } = body as { email?: string; code?: string };

        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and verification code are required" },
                { status: 400 }
            );
        }

        const valid = await validateVerificationToken(email, code);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        // Auto-login after verification
        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
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
        response.cookies.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: origin.startsWith("https"),
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        logServerError("Email verification error", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
