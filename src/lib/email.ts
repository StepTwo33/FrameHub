/**
 * Email delivery module using Resend.
 * Sends transactional emails from support@frame-hub.com.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "FrameHub <support@frame-hub.com>";

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your FrameHub verification code",
    html: verificationTemplate(code),
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

function verificationTemplate(code: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0; font-size: 24px; color: #e2e8f0;">
          <span style="color: #22d3ee;">Frame</span><span style="color: #94a3b8;">Hub</span>
        </h1>
      </div>
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px;">Your verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f1f5f9; margin: 16px 0; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 16px 0 0;">This code expires in 10 minutes.</p>
      </div>
      <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 24px;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;
}
