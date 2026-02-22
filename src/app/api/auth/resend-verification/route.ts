import { NextRequest, NextResponse } from "next/server";
import {
    findUserByEmail,
    generateVerificationCode,
    storeVerificationToken,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
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
        console.error("Resend verification error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
