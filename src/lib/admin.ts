import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Comma-separated admin emails in `.env` — promoted on sign-in (not stored in git). */
export function getBootstrapAdminEmails(): Set<string> {
  const raw = process.env.AUTH_ADMIN_EMAILS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * If the user's email is listed in AUTH_ADMIN_EMAILS, ensure they have the admin role.
 * Returns the effective role after sync.
 */
export async function syncBootstrapAdminRole(
  userId: string,
  email: string | null | undefined,
  currentRole: string,
): Promise<string> {
  if (!email) return currentRole;
  const admins = getBootstrapAdminEmails();
  if (!admins.has(email.trim().toLowerCase())) return currentRole;
  if (currentRole === "admin") return currentRole;
  await prisma.user.update({
    where: { id: userId },
    data: { role: "admin" },
  });
  return "admin";
}

export function isUserBanned(user: { bannedAt: Date | null | undefined }): boolean {
  return user.bannedAt != null;
}

/**
 * Verify admin/moderator role from the database (not just JWT).
 * Use this on sensitive admin routes to prevent stale JWT role abuse.
 */
export async function verifyAdmin(): Promise<{ isAdmin: boolean; userId?: string; role?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { isAdmin: false };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, bannedAt: true },
  });

  if (!user || isUserBanned(user)) return { isAdmin: false };
  const isAdmin = user.role === "admin" || user.role === "moderator";
  return { isAdmin, userId: session.user.id, role: user.role };
}

/** Full admin only — for promoting users or changing roles. */
export async function verifyFullAdmin(): Promise<{ isAdmin: boolean; userId?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { isAdmin: false };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, bannedAt: true },
  });

  if (!user || isUserBanned(user) || user.role !== "admin") return { isAdmin: false };
  return { isAdmin: true, userId: session.user.id };
}

/** Ban a user: record ban, unpublish all public builds. */
export async function banUser(userId: string, reason?: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: new Date(),
        banReason: reason?.trim() || null,
      },
    }),
    prisma.build.updateMany({
      where: { userId, isPublic: true },
      data: { isPublic: false },
    }),
  ]);
}

export async function unbanUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { bannedAt: null, banReason: null },
  });
}
