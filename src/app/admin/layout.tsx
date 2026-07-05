import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserBanned } from "@/lib/admin";
import { Flag, Users, Megaphone } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, bannedAt: true },
  });

  if (!user || isUserBanned(user) || (user.role !== "admin" && user.role !== "moderator")) {
    redirect("/");
  }

  const isFullAdmin = user.role === "admin";

  return (
    <div>
      <div className="border-b border-border/60 bg-card/40">
        <div className="container mx-auto flex gap-1 px-4 py-2">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <Flag className="h-3.5 w-3.5" />
            Reports
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <Users className="h-3.5 w-3.5" />
            Users
          </Link>
          {isFullAdmin && (
            <Link
              href="/admin/updates"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <Megaphone className="h-3.5 w-3.5" />
              Site Updates
            </Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
