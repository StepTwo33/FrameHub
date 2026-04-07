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

export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  if (process.env.AUTH_URL?.trim()) return process.env.AUTH_URL.trim().replace(/\/$/, "");
  return "http://localhost:3000";
}

/** Email the reporter when a mod marks their ticket resolved or won't fix. No-op if RESEND_API_KEY is unset. */
export async function sendReportStatusEmail(params: {
  to: string;
  reporterName: string;
  status: "resolved" | "wontfix";
  itemName: string;
  itemType: string;
  reportId: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY missing; skipping report status notification");
    return;
  }
  const base = getAppBaseUrl();
  const profileUrl = `${base}/profile`;
  const isResolved = params.status === "resolved";
  const subject = isResolved
    ? `Your report was resolved: ${params.itemName}`
    : `Update on your report: ${params.itemName}`;
  const headline = isResolved ? "Report marked resolved" : "Report closed (won't fix)";
  const bodyText = isResolved
    ? "A moderator reviewed your data issue report and marked it as resolved. Thank you for helping improve Frame Hub."
    : "A moderator reviewed your report and marked it as won't fix. If you still believe there is an error, you can submit a new report with more detail.";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 22px; color: #e2e8f0;">
          <span style="color: #22d3ee;">Frame</span><span style="color: #94a3b8;">Hub</span>
        </h1>
      </div>
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <p style="color: #f1f5f9; font-size: 16px; font-weight: 600; margin: 0 0 12px;">${headline}</p>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">${bodyText}</p>
        <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; color: #64748b;">Item</td><td style="padding: 4px 0;">${escapeHtml(params.itemName)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Type</td><td style="padding: 4px 0;">${escapeHtml(params.itemType)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Report ID</td><td style="padding: 4px 0; font-family: monospace; font-size: 11px;">${escapeHtml(params.reportId)}</td></tr>
        </table>
        <p style="margin: 20px 0 0;">
          <a href="${profileUrl}" style="display: inline-block; background: #0ea5e9; color: #0f172a; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 8px;">View your profile & reports</a>
        </p>
      </div>
      <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 24px;">
        Hi ${escapeHtml(params.reporterName)}, you received this because you submitted this report while signed in to Frame Hub.
      </p>
    </div>
  `;

  await sendEmail(params.to, subject, html);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
