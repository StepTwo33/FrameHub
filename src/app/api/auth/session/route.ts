import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Refresh key fields from DB so role/username/verification changes are immediate
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, username: true, name: true, image: true, emailVerified: true },
  });

  if (!dbUser) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      ...session.user,
      ...dbUser,
      // DB stores a DateTime | null; the client expects the JWT's boolean shape.
      emailVerified: !!dbUser.emailVerified,
    },
  });
}
