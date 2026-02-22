"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="font-semibold hover:text-foreground transition-colors">
              <span className="text-primary">Frame</span><span>Hub</span>
            </Link>
            <span className="text-border">|</span>
            <span>Fan-made Warframe build planner</span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link href="/report-issue" className="hover:text-foreground transition-colors">Report Issue</Link>
          </nav>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50 text-center text-[10px] text-muted-foreground/60">
          Warframe and the Warframe logo are registered trademarks of Digital Extremes Ltd. Frame Hub is not affiliated with Digital Extremes.
        </div>
      </div>
    </footer>
  );
}
