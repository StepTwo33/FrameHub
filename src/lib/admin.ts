import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Verify admin/moderator role from the database (not just JWT).
 * Use this on sensitive admin routes to prevent stale JWT role abuse.
 */
export async function verifyAdmin(): Promise<{ isAdmin: boolean; userId?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { isAdmin: false };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) return { isAdmin: false };
  const isAdmin = user.role === "admin" || user.role === "moderator";
  return { isAdmin, userId: session.user.id };
}
