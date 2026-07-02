"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, Loader2, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicBuildSummary } from "@/lib/build-types";

interface BuildVoteButtonProps {
  buildId: string;
  initialCount: number;
  initialVoted?: boolean;
  canVote?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function BuildVoteButton({
  buildId,
  initialCount,
  initialVoted = false,
  canVote = true,
  size = "sm",
  className,
}: BuildVoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
    setVoted(initialVoted);
  }, [initialCount, initialVoted]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canVote || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/builds/${buildId}/vote`, { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/signin";
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.upvoteCount);
      setVoted(data.voted);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const pad = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={loading || !canVote}
      title={canVote ? (voted ? "Remove upvote" : "Upvote") : "Sign in to upvote"}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border transition-colors font-medium",
        pad,
        voted
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30",
        !canVote && "opacity-70 cursor-default",
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : (
        <ThumbsUp className={cn(iconSize, voted && "fill-current")} />
      )}
      <span>{count}</span>
    </button>
  );
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

interface PublicBuildRowProps {
  build: PublicBuildSummary & { voted?: boolean };
  showVote?: boolean;
  onLoad?: () => void;
  compact?: boolean;
}

export function PublicBuildRow({ build, showVote = true, onLoad, compact = false }: PublicBuildRowProps) {
  return (
    <div
      className={cn(
        "group flex items-stretch overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200",
        "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
        compact && "text-sm",
      )}
    >
      <Link
        href={`/build/${build.id}`}
        className="flex flex-1 items-center gap-3 p-3 sm:p-4 min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
      >
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate group-hover:text-primary transition-colors">{build.name}</div>
          {!compact && build.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{build.description}</p>
          )}
          <div className="text-[10px] text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {build.author.profileSlug ? (
              <Link
                href={`/u/${build.author.profileSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-primary transition-colors"
              >
                @{build.author.username}
              </Link>
            ) : (
              <span>@{build.author.username}</span>
            )}
            <span>•</span>
            <span>{build.type}</span>
            <span>•</span>
            <span>{formatRelativeTime(build.updatedAt)}</span>
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
      </Link>

      <div className="flex items-center gap-1 px-2 sm:px-3 border-l border-border shrink-0">
        {showVote && (
          <BuildVoteButton
            buildId={build.id}
            initialCount={build.upvoteCount}
            initialVoted={build.voted}
          />
        )}
        {onLoad && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onLoad();
            }}
            title="Load in builder"
            className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
