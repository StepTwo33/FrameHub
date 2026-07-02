import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { prisma } from "@/lib/prisma";
import { ThumbsUp, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const normalized = username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: normalized },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: { select: { builds: true } },
    },
  });

  if (!user) notFound();

  const publicBuilds = await prisma.build.findMany({
    where: { userId: user.id, isPublic: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      upvoteCount: true,
      updatedAt: true,
    },
    take: 50,
  });

  const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {user.image ? (
              <Image src={user.image} alt="" width={80} height={80} className="w-20 h-20 rounded-full border-2 border-border object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <span className="text-3xl font-bold text-muted-foreground">
                  {(user.name ?? user.username ?? "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user.name ?? user.username ?? "Tenno"}</h1>
              {user.username && <p className="text-primary text-sm mt-1">@{user.username}</p>}
              {user.bio ? (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{user.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground/80 mt-3">No bio yet.</p>
              )}
            </div>

            <div className="text-center shrink-0">
              <div className="text-2xl font-bold">{publicBuilds.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Public Builds</div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>Joined {joined}</span>
            {user.role !== "user" && (
              <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 uppercase text-[10px] font-semibold">
                {user.role}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground mb-4">
            COMMUNITY BUILDS
          </h2>
          {publicBuilds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12 rounded-xl border border-dashed border-border">
              No public builds yet.
            </p>
          ) : (
            <div className="space-y-2">
              {publicBuilds.map((build) => (
                <Link
                  key={build.id}
                  href={`/build/${build.id}`}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/35 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {build.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="capitalize">{build.type}</span>
                      <span>•</span>
                      <span>{new Date(build.updatedAt).toLocaleDateString()}</span>
                      {build.upvoteCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5">
                            <ThumbsUp className="h-3 w-3" />
                            {build.upvoteCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
