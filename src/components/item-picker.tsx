"use client";

import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AccentColor } from "@/components/page-shell";
import { FilterChip, PageHero } from "@/components/page-shell";

const PICKER_ACCENT: Record<
  AccentColor,
  { rowHover: string; rowBorder: string; imageRing: string }
> = {
  blue: {
    rowHover: "hover:border-blue-500/45 hover:bg-blue-500/5 hover:shadow-blue-500/5",
    rowBorder: "group-hover:border-blue-500/30",
    imageRing: "ring-blue-500/20",
  },
  purple: {
    rowHover: "hover:border-purple-500/45 hover:bg-purple-500/5 hover:shadow-purple-500/5",
    rowBorder: "group-hover:border-purple-500/30",
    imageRing: "ring-purple-500/20",
  },
  cyan: {
    rowHover: "hover:border-cyan-500/45 hover:bg-cyan-500/5 hover:shadow-cyan-500/5",
    rowBorder: "group-hover:border-cyan-500/30",
    imageRing: "ring-cyan-500/20",
  },
  amber: {
    rowHover: "hover:border-amber-500/45 hover:bg-amber-500/5 hover:shadow-amber-500/5",
    rowBorder: "group-hover:border-amber-500/30",
    imageRing: "ring-amber-500/20",
  },
  indigo: {
    rowHover: "hover:border-indigo-500/45 hover:bg-indigo-500/5 hover:shadow-indigo-500/5",
    rowBorder: "group-hover:border-indigo-500/30",
    imageRing: "ring-indigo-500/20",
  },
  yellow: {
    rowHover: "hover:border-yellow-500/45 hover:bg-yellow-500/5 hover:shadow-yellow-500/5",
    rowBorder: "group-hover:border-yellow-500/30",
    imageRing: "ring-yellow-500/20",
  },
  red: {
    rowHover: "hover:border-red-500/45 hover:bg-red-500/5 hover:shadow-red-500/5",
    rowBorder: "group-hover:border-red-500/30",
    imageRing: "ring-red-500/20",
  },
  green: {
    rowHover: "hover:border-green-500/45 hover:bg-green-500/5 hover:shadow-green-500/5",
    rowBorder: "group-hover:border-green-500/30",
    imageRing: "ring-green-500/20",
  },
  orange: {
    rowHover: "hover:border-orange-500/45 hover:bg-orange-500/5 hover:shadow-orange-500/5",
    rowBorder: "group-hover:border-orange-500/30",
    imageRing: "ring-orange-500/20",
  },
  rose: {
    rowHover: "hover:border-rose-500/45 hover:bg-rose-500/5 hover:shadow-rose-500/5",
    rowBorder: "group-hover:border-rose-500/30",
    imageRing: "ring-rose-500/20",
  },
  teal: {
    rowHover: "hover:border-teal-500/45 hover:bg-teal-500/5 hover:shadow-teal-500/5",
    rowBorder: "group-hover:border-teal-500/30",
    imageRing: "ring-teal-500/20",
  },
  slate: {
    rowHover: "hover:border-slate-400/45 hover:bg-slate-500/5 hover:shadow-slate-500/5",
    rowBorder: "group-hover:border-slate-400/30",
    imageRing: "ring-slate-500/20",
  },
  emerald: {
    rowHover: "hover:border-emerald-500/45 hover:bg-emerald-500/5 hover:shadow-emerald-500/5",
    rowBorder: "group-hover:border-emerald-500/30",
    imageRing: "ring-emerald-500/20",
  },
  primary: {
    rowHover: "hover:border-primary/45 hover:bg-primary/5 hover:shadow-primary/5",
    rowBorder: "group-hover:border-primary/30",
    imageRing: "ring-primary/20",
  },
};

export function ItemPickerScreen({
  icon,
  accent,
  title,
  description,
  count,
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  children,
  className,
}: {
  icon: LucideIcon;
  accent: AccentColor;
  title: string;
  description?: string;
  count: number;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl", className)}>
      <PageHero icon={icon} accent={accent} title={title} description={description} />

      <div className="mb-4 overflow-hidden rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm ring-1 ring-border/30">
        {filters && <div className="mb-4 flex flex-wrap gap-2">{filters}</div>}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-border/60 bg-background/50 pl-9"
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{count}</span> results
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 ring-1 ring-border/30">
        <ScrollArea className="h-[60vh]">
          <div className="space-y-1.5 p-2 pr-3">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function ItemPickerFilter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <FilterChip active={active} onClick={onClick}>
      {children}
    </FilterChip>
  );
}

export function ItemPickerRow({
  accent,
  onClick,
  image,
  title,
  badge,
  meta,
  children,
  className,
}: {
  accent: AccentColor;
  onClick: () => void;
  image?: React.ReactNode;
  title: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const colors = PICKER_ACCENT[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border border-border/60 bg-background/30 p-3 text-left transition-all duration-200",
        "hover:-translate-y-px hover:shadow-md",
        colors.rowHover,
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {image && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30 ring-1",
              colors.imageRing,
              colors.rowBorder,
            )}
          >
            {image}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold transition-colors group-hover:text-foreground">
              {title}
            </span>
            {badge}
          </div>
          {meta && <div className="mt-1">{meta}</div>}
          {children}
        </div>
      </div>
    </button>
  );
}

export function BuilderItemHeader({
  onChange,
  changeLabel = "Change",
  image,
  title,
  subtitle,
  children,
}: {
  onChange: () => void;
  changeLabel?: string;
  image?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-3 shadow-sm backdrop-blur-sm ring-1 ring-border/30 sm:p-4">
        <button
          type="button"
          onClick={onChange}
          className="rounded-lg border border-border/70 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          ← {changeLabel}
        </button>
        {image}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-xs capitalize text-muted-foreground sm:text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function BuilderActionBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BuilderActionGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1 shadow-sm ring-1 ring-border/30">
      {children}
    </div>
  );
}
