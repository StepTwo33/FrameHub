import { NextRequest, NextResponse } from "next/server";
import { getSession, isValidUsername, normalizeUsername, createSession, SESSION_COOKIE, framehubSessionCookieOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { logServerError } from "@/lib/log-server-error";
import { getPublicOrigin } from "@/lib/site/public-origin";

export const dynamic = "force-dynamic";

const PROFILE_PATCH_BODY_MAX = 32_000;

// GET full profile from DB (includes bio, createdAt, etc.)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      bio: true,
      role: true,
      emailVerified: true,
      supporterAt: true,
      newsletterOptIn: true,
      createdAt: true,
      _count: { select: { builds: true, reports: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// PATCH to update profile fields (name, bio)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`profile_patch:${session.user.id}:${ip}`, 30, 60 * 60 * 1000);
  if (rl.limited) {
    return NextResponse.json({ error: "Too many profile updates. Try again later." }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > PROFILE_PATCH_BODY_MAX) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let body: { name?: string; bio?: string; username?: string; newsletterOptIn?: boolean };
  try {
    body = JSON.parse(raw) as {
      name?: string;
      bio?: string;
      username?: string;
      newsletterOptIn?: boolean;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, bio, username, newsletterOptIn } = body;

  const updates: Record<string, unknown> = {};

  try {
    if (newsletterOptIn !== undefined) {
      if (typeof newsletterOptIn !== "boolean") {
        return NextResponse.json({ error: "newsletterOptIn must be a boolean" }, { status: 400 });
      }
      updates.newsletterOptIn = newsletterOptIn;
    }

    if (name !== undefined) {
      const trimmed = typeof name === "string" ? name.trim() : "";
      if (trimmed.length > 50) {
        return NextResponse.json({ error: "Name must be 50 characters or less" }, { status: 400 });
      }
      updates.name = trimmed || null;
    }

    if (bio !== undefined) {
      const trimmed = typeof bio === "string" ? bio.trim() : "";
      if (trimmed.length > 300) {
        return NextResponse.json({ error: "Bio must be 300 characters or less" }, { status: 400 });
      }
      updates.bio = trimmed || null;
    }

    if (username !== undefined) {
      const trimmed = typeof username === "string" ? username.trim() : "";
      if (!trimmed) {
        updates.username = null;
      } else {
        const normalized = normalizeUsername(trimmed);
        if (!isValidUsername(normalized)) {
          return NextResponse.json(
            { error: "Username must be 3-24 chars and only include letters, numbers, ., _, or -" },
            { status: 400 }
          );
        }

        const existing = await prisma.user.findUnique({
          where: { username: normalized },
          select: { id: true },
        });

        if (existing && existing.id !== session.user.id) {
          return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
        }

        updates.username = normalized;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        newsletterOptIn: true,
        createdAt: true,
      },
    });

    const response = NextResponse.json({ user });

    // Refresh JWT so header/session reflect name & username immediately
    const token = await createSession({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email ?? session.user.email,
      image: user.image,
      emailVerified: session.user.emailVerified,
      role: user.role,
    });
    const origin = getPublicOrigin(req);
    response.cookies.set(SESSION_COOKIE, token, framehubSessionCookieOptions(origin));

    return response;
  } catch (e) {
    // Check-then-update can race a concurrent username claim; surface the
    // unique-constraint violation as a conflict rather than a 500.
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }
    logServerError("PATCH /api/auth/profile", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
