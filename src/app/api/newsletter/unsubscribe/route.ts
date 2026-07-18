import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNewsletterUnsubscribeToken } from "@/lib/email";

export const dynamic = "force-dynamic";

/** One-click unsubscribe from newsletter emails (signed token). */
export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const userId = verifyNewsletterUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  await prisma.user.updateMany({
    where: { id: userId },
    data: { newsletterOptIn: false },
  });

  return NextResponse.json({ ok: true });
}
