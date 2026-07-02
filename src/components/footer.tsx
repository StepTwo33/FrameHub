"use client";

import Link from "next/link";
import { Github, Heart } from "lucide-react";
import { FRAME_HUB_GITHUB_URL } from "@/lib/site-links";

const FOOTER_LINKS = [
  { href: FRAME_HUB_GITHUB_URL, label: "Open Source", external: true },
  { href: "/about", label: "About" },
  { href: "/discover", label: "Discover" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/report-issue", label: "Report Issue" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-[1] mt-auto border-t border-border/60 bg-card/40 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-90">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-primary">Frame</span>
                <span className="text-foreground">Hub</span>
              </span>
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Fan-made Warframe build planner
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
              Built for the community <Heart className="h-3 w-3 text-rose-400/80" />
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {FOOTER_LINKS.map((link) =>
              "external" in link ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                >
                  <Github className="h-3 w-3" />
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <p className="mt-5 border-t border-border/40 pt-4 text-[10px] leading-relaxed text-muted-foreground/60">
          Warframe and the Warframe logo are registered trademarks of Digital Extremes Ltd.
          Frame Hub is not affiliated with Digital Extremes.
        </p>
      </div>
    </footer>
  );
}
