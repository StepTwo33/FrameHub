import { NextRequest, NextResponse } from "next/server";
import {
    findUserByEmail,
    generateVerificationCode,
    storeVerificationToken,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logServerError } from "@/lib/log-server-error";

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req.headers);
        const rl = checkRateLimit(`resend:${ip}`, 3, 15 * 60 * 1000);
        if (rl.limited) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email } = body as { email?: string };

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(email);
        if (!user) {
            // Don't reveal whether the email exists
            return NextResponse.json({ success: true, message: "If an account exists, a new code has been sent." });
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { error: "This email is already verified" },
                { status: 400 }
            );
        }

        const code = generateVerificationCode();
        await storeVerificationToken(email, code);
        await sendVerificationEmail(email, code);

        return NextResponse.json({ success: true, message: "A new verification code has been sent." });
    } catch (error) {
        logServerError("Resend verification error", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
