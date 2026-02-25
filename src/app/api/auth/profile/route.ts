import { NextRequest, NextResponse } from "next/server";
import { getSession, isValidUsername, normalizeUsername } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  const body = await req.json();
  const { name, bio, username } = body as { name?: string; bio?: string; username?: string };

  const updates: Record<string, unknown> = {};

  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length > 50) {
      return NextResponse.json({ error: "Name must be 50 characters or less" }, { status: 400 });
    }
    updates.name = trimmed || null;
  }

  if (bio !== undefined) {
    const trimmed = bio.trim();
    if (trimmed.length > 300) {
      return NextResponse.json({ error: "Bio must be 300 characters or less" }, { status: 400 });
    }
    updates.bio = trimmed || null;
  }

  if (username !== undefined) {
    const trimmed = username.trim();
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
    select: { id: true, name: true, username: true, email: true, image: true, bio: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
}
