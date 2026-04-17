"use client";

import { useState, useMemo } from "react";
import { Mod } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getArcaneImage } from "@/lib/images";
import { GameAssetImage } from "@/components/game-asset-image";

const rarityColors: Record<string, string> = {
  common: "bg-amber-900/30 text-amber-300 border-amber-900/50",
  uncommon: "bg-slate-500/20 text-slate-300 border-slate-500/50",
  rare: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  legendary: "bg-white/10 text-white border-white/30",
};

interface ArcaneSlotProps {
  arcane: Mod | null;
  rank: number;
  label: string;
  onAdd: () => void;
  onRemove: () => void;
}

export function ArcaneSlotCard({ arcane, rank, label, onAdd, onRemove }: ArcaneSlotProps) {
  if (!arcane) {
    return (
      <button
        onClick={onAdd}
        className="w-full h-16 border border-dashed border-purple-500/30 rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5 transition-all"
      >
        <Plus className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </button>
    );
  }

  return (
    <div className="relative w-full h-16 border border-purple-500/30 rounded-lg p-3 bg-purple-500/5">
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex items-center gap-2 h-full">
        <GameAssetImage src={getArcaneImage(arcane.name)} alt="" width={32} height={32} className="w-8 h-8 rounded object-contain bg-muted/20 shrink-0" hideOnError />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{arcane.name}</span>
          <span className="text-[10px] text-muted-foreground">Rank {rank}/{arcane.maxRank}</span>
        </div>
      </div>
    </div>
  );
}

interface ArcanePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arcanes: Mod[];
  equippedArcaneIds: string[];
  onSelect: (arcane: Mod) => void;
  title?: string;
}

export function ArcanePicker({ open, onOpenChange, arcanes, equippedArcaneIds, onSelect, title = "Select Arcane" }: ArcanePickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return arcanes;
    const q = search.toLowerCase();
    return arcanes.filter((a) => a.name.toLowerCase().includes(q));
  }, [arcanes, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search arcanes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{filtered.length} arcanes</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
          <div className="space-y-1">
            {filtered.map((arcane) => {
              const isEquipped = equippedArcaneIds.includes(arcane.id);
              return (
                <button
                  key={arcane.id}
                  onClick={() => !isEquipped && onSelect(arcane)}
                  disabled={isEquipped}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    isEquipped
                      ? "border-border opacity-40 cursor-not-allowed"
                      : "border-border hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GameAssetImage src={getArcaneImage(arcane.name)} alt="" width={28} height={28} className="w-7 h-7 rounded object-contain bg-muted/20 shrink-0" hideOnError />
                      <span className="text-sm font-medium">{arcane.name}</span>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", rarityColors[arcane.rarity])}>
                      {arcane.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate pl-5.5">
                    {arcane.description.replace(/<[^>]+>/g, "").substring(0, 80)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
