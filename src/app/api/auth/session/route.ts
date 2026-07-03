import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserBanned, syncBootstrapAdminRole } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Refresh key fields from DB so role/username/verification changes are immediate
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, username: true, name: true, image: true, emailVerified: true, bannedAt: true, email: true },
  });

  if (!dbUser || isUserBanned(dbUser)) {
    return NextResponse.json({ user: null });
  }

  const role = await syncBootstrapAdminRole(session.user.id, dbUser.email, dbUser.role);

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: dbUser.name,
      username: dbUser.username,
      image: dbUser.image,
      role,
      emailVerified: !!dbUser.emailVerified,
    },
  });
}
