"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronRight, Loader2, Megaphone, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSiteUpdateTime, type SiteUpdateSummary } from "@/lib/site-updates";
import { ContentPanel } from "@/components/page-shell";

interface SiteUpdatesSidebarProps {
  variant?: "sidebar" | "inline";
  limit?: number;
  className?: string;
}

function UpdateCard({ update, compact }: { update: SiteUpdateSummary; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const clamped = !expanded && update.body.length > 140;

  return (
    <article className="rounded-lg border border-border/50 bg-background/40 p-3 transition-colors hover:border-primary/25">
      <time className="text-[10px] text-muted-foreground">{formatSiteUpdateTime(update.createdAt)}</time>
      <h3 className={cn("mt-1 font-semibold leading-snug text-foreground", compact ? "text-xs" : "text-sm")}>
        {update.title}
      </h3>
      <p
        className={cn(
          "mt-1.5 text-muted-foreground whitespace-pre-wrap leading-relaxed",
          compact ? "text-[11px]" : "text-xs",
          clamped && "line-clamp-3",
        )}
      >
        {update.body}
      </p>
      {update.body.length > 140 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[10px] font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  );
}

export function SiteUpdatesSidebar({
  variant = "sidebar",
  limit = 8,
  className,
}: SiteUpdatesSidebarProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [updates, setUpdates] = useState<SiteUpdateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/site-updates?limit=${limit}`);
      if (!res.ok) return;
      const data = await res.json();
      setUpdates(data.updates ?? []);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const isSidebar = variant === "sidebar";

  return (
    <ContentPanel
      padding={false}
      className={cn(
        isSidebar && "sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Megaphone className="h-4 w-4 shrink-0 text-amber-400" />
            What&apos;s New
          </h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Updates from the Frame Hub team
          </p>
        </div>
      </div>

      <div className={cn("space-y-2 p-3", isSidebar && "overflow-y-auto flex-1")}>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : updates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">No site updates posted yet.</p>
          </div>
        ) : (
          updates.map((update) => (
            <UpdateCard key={update.id} update={update} compact={isSidebar} />
          ))
        )}
      </div>

      {isAdmin && (
        <div className="border-t border-border/60 px-3 py-2.5">
          <Link
            href="/admin/updates"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background/50 px-2 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <PenLine className="h-3 w-3" />
            Manage updates
            <ChevronRight className="ml-auto h-3 w-3" />
          </Link>
        </div>
      )}
    </ContentPanel>
  );
}
