"use client";

import Link from "next/link";
import { LogIn, User, Menu, X, ChevronDown, Swords, Wrench, LayoutGrid, Flag, Shield } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { ThemePicker } from "@/components/theme-picker";

interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role?: string;
}

const NAV_GROUPS = [
  {
    label: "Builders",
    icon: Swords,
    links: [
      { href: "/weapon-builder", label: "Weapons", desc: "Build & optimize weapons" },
      { href: "/warframe-builder", label: "Warframes", desc: "Warframe modding" },
      { href: "/companion-builder", label: "Companions", desc: "Companion loadouts" },
      { href: "/modular-builder", label: "Modular", desc: "Kitguns, Zaws & more" },
      { href: "/archwing-builder", label: "Archwing", desc: "Archwing & Necramech" },
    ],
  },
  {
    label: "Tools",
    icon: Wrench,
    links: [
      { href: "/mod-browser", label: "Mod Browser", desc: "Search all mods" },
      { href: "/riven-calculator", label: "Riven Calculator", desc: "Riven stat ranges" },
      { href: "/forma-planner", label: "Forma Planner", desc: "Plan your forma" },
      { href: "/damage-simulator", label: "Damage Simulator", desc: "Simulate damage output" },
    ],
  },
  {
    label: "Builds",
    icon: LayoutGrid,
    links: [
      { href: "/loadouts", label: "Loadouts", desc: "Saved builds & loadouts" },
      { href: "/compare", label: "Compare", desc: "Compare items side-by-side" },
      { href: "/import-export", label: "Import / Export", desc: "Share build codes" },
    ],
  },
];

const DISCORD_SVG = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>
);

function NavDropdown({ group }: { group: typeof NAV_GROUPS[number] }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const Icon = group.icon;

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
        onClick={() => setOpen(!open)}
      >
        <Icon className="h-3.5 w-3.5" />
        {group.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-1 z-50" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <div className="w-56 bg-card border border-border rounded-xl shadow-xl shadow-black/20 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex flex-col gap-0.5 px-3 py-2 rounded-lg hover:bg-secondary/70 transition-colors group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {link.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => { setUser(data.user ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
          <span className="text-primary">Frame</span>
          <span className="text-muted-foreground">Hub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_GROUPS.map((group) => (
            <NavDropdown key={group.label} group={group} />
          ))}

          <span className="w-px h-5 bg-border mx-2" />

          <Link
            href="/report-issue"
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-amber-400/70 hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-500/5"
          >
            <Flag className="h-3.5 w-3.5" />
            Report
          </Link>

          {isAdmin && (
            <Link
              href="/admin/reports"
              className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-red-400/70 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <a
            href="https://discord.gg/bqQXaYdTjS"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-muted-foreground hover:text-[#5865F2] transition-colors rounded-lg hover:bg-secondary/50"
            title="Join Discord"
          >
            {DISCORD_SVG}
          </a>

          <span className="w-px h-5 bg-border mx-1" />
          <ThemePicker />

          {loading ? (
            <span className="w-7 h-7 rounded-full bg-muted animate-pulse ml-1" />
          ) : user ? (
            <Link href="/profile" className="flex items-center gap-2 ml-1 hover:opacity-80 transition-opacity">
              {user.image ? (
                <img src={user.image} alt="" className="w-7 h-7 rounded-full border border-border" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                {user.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <a
              href="/signin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all ml-1"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </a>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemePicker />
          {loading ? (
            <span className="w-7 h-7 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <Link href="/profile" className="hover:opacity-80 transition-opacity">
              {user.image ? (
                <img src={user.image} alt="" className="w-7 h-7 rounded-full border border-border" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </Link>
          ) : (
            <a href="/signin" className="text-muted-foreground hover:text-foreground">
              <LogIn className="h-5 w-5" />
            </a>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-card px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            const isExpanded = mobileExpanded === group.label;
            return (
              <div key={group.label}>
                <button
                  onClick={() => setMobileExpanded(isExpanded ? null : group.label)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left font-medium">{group.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="ml-4 border-l border-border pl-2 space-y-0.5 py-1">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="border-t border-border pt-1 mt-1">
            <Link
              href="/report-issue"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-amber-400/70 hover:text-amber-400 hover:bg-secondary transition-colors"
            >
              <Flag className="h-4 w-4" />
              Report Issue
            </Link>
            {isAdmin && (
              <Link
                href="/admin/reports"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-secondary transition-colors"
              >
                <Shield className="h-4 w-4" />
                Admin Reports
              </Link>
            )}
            <a
              href="https://discord.gg/bqQXaYdTjS"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-[#5865F2] hover:bg-secondary transition-colors"
            >
              {DISCORD_SVG}
              Discord
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
