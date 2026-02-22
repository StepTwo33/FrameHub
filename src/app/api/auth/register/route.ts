import { NextRequest, NextResponse } from "next/server";
import {
    hashPassword,
    generateVerificationCode,
    storeVerificationToken,
    findUserByEmail,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req.headers);
        const rl = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
        if (rl.limited) {
            return NextResponse.json(
                { error: "Too many registration attempts. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email, password, name } = body as {
            email?: string;
            password?: string;
            name?: string;
        };

        // ---------- Validation ----------
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // ---------- Check for existing user ----------
        const existing = await findUserByEmail(email);
        if (existing) {
            if (!existing.passwordHash) {
                return NextResponse.json(
                    { error: "This email is linked to a Google account. Please sign in with Google instead.", useGoogle: true },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // ---------- Create user ----------
        const passwordHash = await hashPassword(password);
        await prisma.user.create({
            data: {
                email,
                name: name?.trim() || null,
                passwordHash,
                emailVerified: null,
            },
        });

        // ---------- Verification code ----------
        const code = generateVerificationCode();
        await storeVerificationToken(email, code);
        await sendVerificationEmail(email, code);

        return NextResponse.json({ success: true, message: "Account created. Check your email for a verification code." });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
