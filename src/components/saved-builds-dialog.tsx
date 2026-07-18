"use client";

import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SavedBuild } from "@/lib/build-storage";
import { cn } from "@/lib/utils";

export function SavedBuildsDialog({
  open,
  onOpenChange,
  title,
  emptyMessage = "No saved builds yet.",
  builds,
  getSubtitle,
  onLoad,
  onDelete,
  accent = "cyan",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  emptyMessage?: string;
  builds: SavedBuild[];
  getSubtitle: (build: SavedBuild) => string;
  onLoad: (build: SavedBuild) => void;
  onDelete: (id: string) => void;
  accent?: "cyan" | "purple";
}) {
  const hoverBorder =
    accent === "purple" ? "hover:border-purple-500/30" : "hover:border-cyan-500/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
          {builds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
          ) : (
            <div className="space-y-2">
              {builds.map((build) => (
                <div
                  key={build.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border border-border transition-all",
                    hoverBorder,
                  )}
                >
                  <button onClick={() => onLoad(build)} className="flex-1 text-left">
                    <span className="text-sm font-medium">{build.name}</span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {getSubtitle(build)}
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(build.id)}
                    className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
