"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

const MAX_WIDTH = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  full: "",
} as const;

export type PageMaxWidth = keyof typeof MAX_WIDTH;

export type AccentColor =
  | "blue"
  | "purple"
  | "cyan"
  | "amber"
  | "indigo"
  | "yellow"
  | "red"
  | "green"
  | "orange"
  | "rose"
  | "teal"
  | "slate"
  | "emerald"
  | "primary";

const ACCENT: Record<
  AccentColor,
  { icon: string; hoverBorder: string; hoverBg: string; hoverText: string; shadow: string; badge: string }
> = {
  blue: {
    icon: "bg-blue-500/10 text-blue-400",
    hoverBorder: "hover:border-blue-500/50",
    hoverBg: "hover:bg-blue-500/5",
    hoverText: "group-hover:text-blue-400",
    shadow: "hover:shadow-blue-500/10",
    badge: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  },
  purple: {
    icon: "bg-purple-500/10 text-purple-400",
    hoverBorder: "hover:border-purple-500/50",
    hoverBg: "hover:bg-purple-500/5",
    hoverText: "group-hover:text-purple-400",
    shadow: "hover:shadow-purple-500/10",
    badge: "bg-purple-500/10 text-purple-300 ring-purple-500/20",
  },
  cyan: {
    icon: "bg-cyan-500/10 text-cyan-400",
    hoverBorder: "hover:border-cyan-500/50",
    hoverBg: "hover:bg-cyan-500/5",
    hoverText: "group-hover:text-cyan-400",
    shadow: "hover:shadow-cyan-500/10",
    badge: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/20",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-400",
    hoverBorder: "hover:border-amber-500/50",
    hoverBg: "hover:bg-amber-500/5",
    hoverText: "group-hover:text-amber-400",
    shadow: "hover:shadow-amber-500/10",
    badge: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  },
  indigo: {
    icon: "bg-indigo-500/10 text-indigo-400",
    hoverBorder: "hover:border-indigo-500/50",
    hoverBg: "hover:bg-indigo-500/5",
    hoverText: "group-hover:text-indigo-400",
    shadow: "hover:shadow-indigo-500/10",
    badge: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/20",
  },
  yellow: {
    icon: "bg-yellow-500/10 text-yellow-400",
    hoverBorder: "hover:border-yellow-500/50",
    hoverBg: "hover:bg-yellow-500/5",
    hoverText: "group-hover:text-yellow-400",
    shadow: "hover:shadow-yellow-500/10",
    badge: "bg-yellow-500/10 text-yellow-300 ring-yellow-500/20",
  },
  red: {
    icon: "bg-red-500/10 text-red-400",
    hoverBorder: "hover:border-red-500/50",
    hoverBg: "hover:bg-red-500/5",
    hoverText: "group-hover:text-red-400",
    shadow: "hover:shadow-red-500/10",
    badge: "bg-red-500/10 text-red-300 ring-red-500/20",
  },
  green: {
    icon: "bg-green-500/10 text-green-400",
    hoverBorder: "hover:border-green-500/50",
    hoverBg: "hover:bg-green-500/5",
    hoverText: "group-hover:text-green-400",
    shadow: "hover:shadow-green-500/10",
    badge: "bg-green-500/10 text-green-300 ring-green-500/20",
  },
  orange: {
    icon: "bg-orange-500/10 text-orange-400",
    hoverBorder: "hover:border-orange-500/50",
    hoverBg: "hover:bg-orange-500/5",
    hoverText: "group-hover:text-orange-400",
    shadow: "hover:shadow-orange-500/10",
    badge: "bg-orange-500/10 text-orange-300 ring-orange-500/20",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-400",
    hoverBorder: "hover:border-rose-500/50",
    hoverBg: "hover:bg-rose-500/5",
    hoverText: "group-hover:text-rose-400",
    shadow: "hover:shadow-rose-500/10",
    badge: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
  },
  teal: {
    icon: "bg-teal-500/10 text-teal-400",
    hoverBorder: "hover:border-teal-500/50",
    hoverBg: "hover:bg-teal-500/5",
    hoverText: "group-hover:text-teal-400",
    shadow: "hover:shadow-teal-500/10",
    badge: "bg-teal-500/10 text-teal-300 ring-teal-500/20",
  },
  slate: {
    icon: "bg-slate-500/10 text-slate-300",
    hoverBorder: "hover:border-slate-400/50",
    hoverBg: "hover:bg-slate-500/5",
    hoverText: "group-hover:text-slate-200",
    shadow: "hover:shadow-slate-500/10",
    badge: "bg-slate-500/10 text-slate-300 ring-slate-500/20",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400",
    hoverBorder: "hover:border-emerald-500/50",
    hoverBg: "hover:bg-emerald-500/5",
    hoverText: "group-hover:text-emerald-400",
    shadow: "hover:shadow-emerald-500/10",
    badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  },
  primary: {
    icon: "bg-primary/10 text-primary",
    hoverBorder: "hover:border-primary/50",
    hoverBg: "hover:bg-primary/5",
    hoverText: "group-hover:text-primary",
    shadow: "hover:shadow-primary/10",
    badge: "bg-primary/10 text-primary ring-primary/20",
  },
};

/** Site-wide page wrapper with ambient background and header. */
export function PageShell({
  children,
  ambient = true,
  className,
}: {
  children: React.ReactNode;
  ambient?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen flex flex-col", ambient && "page-ambient", className)}>
      <Header />
      {children}
    </div>
  );
}

/** Standard main content area with optional animation and max-width. */
export function PageMain({
  children,
  maxWidth = "lg",
  animate = true,
  className,
}: {
  children: React.ReactNode;
  maxWidth?: PageMaxWidth;
  animate?: boolean;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative z-[1] flex-1 container mx-auto w-full px-4 py-6 sm:py-8",
        MAX_WIDTH[maxWidth],
        animate && "animate-in fade-in slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      {children}
    </main>
  );
}

/** Polished page title block for tool and content pages. */
export function PageHero({
  title,
  highlight,
  description,
  icon: Icon,
  accent = "primary",
  actions,
  centered = false,
  className,
}: {
  title: string;
  highlight?: string;
  description?: string;
  icon?: LucideIcon;
  accent?: AccentColor;
  actions?: React.ReactNode;
  centered?: boolean;
  className?: string;
}) {
  const colors = ACCENT[accent];
  return (
    <div
      className={cn(
        "mb-8",
        centered && "text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-4",
          centered ? "flex-col items-center" : "items-start justify-between",
          actions && !centered && "flex-wrap",
        )}
      >
        <div className={cn("flex gap-3.5", centered && "flex-col items-center")}>
          {Icon && (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-border/50",
                colors.icon,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className={cn(centered && "max-w-2xl")}>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="text-primary">{highlight}</span>
                </>
              )}
            </h1>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Homepage-style feature link card. */
export function FeatureCard({
  href,
  external,
  title,
  description,
  icon: Icon,
  accent,
  badges,
  subtitle,
}: {
  href: string;
  external?: boolean;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: AccentColor;
  badges?: string[];
  subtitle?: string;
}) {
  const colors = ACCENT[accent];
  const inner = (
    <div
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        colors.hoverBorder,
        colors.hoverBg,
        colors.shadow,
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className={cn("rounded-lg p-2 ring-1 ring-border/40", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className={cn("text-lg font-semibold transition-colors", colors.hoverText)}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {badges && badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium ring-1",
                colors.badge,
              )}
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block h-full">
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className="group block h-full">
      {inner}
    </Link>
  );
}

/** Filter / sort pill button. */
export function FilterChip({
  active,
  onClick,
  children,
  className,
  style,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
          : "border-border/70 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Elevated content panel for lists, forms, and tool areas. */
export function ContentPanel({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm ring-1 ring-border/30",
        padding && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Section heading inside content panels. */
export function PanelHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Highlight callout banner (e.g. open source on homepage). */
export function CalloutBanner({
  children,
  accent = "emerald",
  className,
}: {
  children: React.ReactNode;
  accent?: AccentColor;
  className?: string;
}) {
  const borderMap: Record<AccentColor, string> = {
    blue: "border-blue-500/25 bg-blue-500/5",
    purple: "border-purple-500/25 bg-purple-500/5",
    cyan: "border-cyan-500/25 bg-cyan-500/5",
    amber: "border-amber-500/25 bg-amber-500/5",
    indigo: "border-indigo-500/25 bg-indigo-500/5",
    yellow: "border-yellow-500/25 bg-yellow-500/5",
    red: "border-red-500/25 bg-red-500/5",
    green: "border-green-500/25 bg-green-500/5",
    orange: "border-orange-500/25 bg-orange-500/5",
    rose: "border-rose-500/25 bg-rose-500/5",
    teal: "border-teal-500/25 bg-teal-500/5",
    slate: "border-slate-500/25 bg-slate-500/5",
    emerald: "border-emerald-500/25 bg-emerald-500/5",
    primary: "border-primary/25 bg-primary/5",
  };
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-left sm:text-center",
        borderMap[accent],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Empty state block for lists and search results. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/70 bg-card/30 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/50">
        <Icon className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** Prose wrapper for legal / long-form pages. */
export function ProsePanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ContentPanel className={cn("prose prose-invert prose-sm max-w-none", className)} padding>
      {children}
    </ContentPanel>
  );
}
