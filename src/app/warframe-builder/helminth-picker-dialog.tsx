"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allHelminthAbilities, type HelminthAbility } from "@/data/helminth";

export function HelminthPickerDialog({
  open,
  onOpenChange,
  pickerSlot,
  hasCurrentHelminth,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickerSlot: number;
  hasCurrentHelminth: boolean;
  onSelect: (ability: HelminthAbility, slot: number) => void;
}) {
  const [search, setSearch] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {hasCurrentHelminth
              ? `Change Helminth ability (slot ${pickerSlot + 1})`
              : `Replace ability ${pickerSlot + 1} with Helminth`}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Helminth abilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-1">
            {allHelminthAbilities
              .filter((a) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                  a.name.toLowerCase().includes(q) ||
                  a.description.toLowerCase().includes(q) ||
                  (a.sourceWarframe || "").toLowerCase().includes(q)
                );
              })
              .map((ability) => (
                <button
                  key={ability.id}
                  onClick={() => {
                    onSelect(ability, pickerSlot);
                    setSearch("");
                    onOpenChange(false);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{ability.name}</span>
                    <span className="text-[10px] text-green-400/70">
                      {ability.sourceWarframe ? ability.sourceWarframe : "Helminth"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    {ability.description}
                  </p>
                  <span className="text-[9px] text-muted-foreground">⚡ {ability.energyCost} energy</span>
                </button>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
