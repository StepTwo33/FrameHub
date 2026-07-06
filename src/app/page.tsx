"use client";

import {
  Crosshair,
  Shield,
  Dog,
  FolderOpen,
  Dice5,
  BookOpen,
  Target,
  GitCompareArrows,
  Rocket,
  Hammer,
  Plane,
  ExternalLink,
  Users,
} from "lucide-react";
import {
  PageShell,
  PageMain,
  FeatureCard,
} from "@/components/page-shell";
import { CommunityBuildsSidebar } from "@/components/community-builds-sidebar";
import { SiteUpdatesSidebar } from "@/components/site-updates-sidebar";
import { HOME_SIDEBAR_ASIDE_CLASS } from "@/lib/home-sidebar-layout";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <PageShell>
      <PageMain maxWidth="full" className="max-w-none py-8 sm:py-12 lg:py-16 xl:px-5 2xl:px-6">
        {/* Equal side tracks keep the center grid centered; side panels pin to the outer edges. */}
        <div className="mx-auto grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,64rem)_minmax(0,1fr)] xl:items-start xl:gap-x-4 2xl:gap-x-6">
          {/* Left: site updates — outer edge */}
          <aside className={cn(HOME_SIDEBAR_ASIDE_CLASS, "xl:col-start-1 xl:justify-self-start xl:pl-0")}>
            <SiteUpdatesSidebar variant="sidebar" limit={10} />
          </aside>

          {/* Center: hero + feature grid */}
          <div className="min-w-0 xl:col-start-2">
            <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
                Build. Calculate. <span className="text-primary">Dominate.</span>
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                Plan and optimize your Warframe builds with real-time stat calculations, mod stacking, and DPS analysis.
              </p>
            </div>

            {/* Mobile / tablet: side columns stack above the grid */}
            <div className="mb-8 space-y-6 xl:hidden">
              <SiteUpdatesSidebar variant="inline" limit={4} />
              <CommunityBuildsSidebar variant="inline" limit={6} />
            </div>

            <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                href="/weapon-builder"
                title="Weapon Builder"
                description="Configure mods for 630 weapons with real-time DPS, crit, and status calculations."
                icon={Crosshair}
                accent="blue"
                badges={["630 Weapons", "Orokin Catalyst"]}
              />
              <FeatureCard
                href="/warframe-builder"
                title="Warframe Builder"
                description="Mod your Warframe, install Archon Shards, and see ability stats and survivability."
                icon={Shield}
                accent="purple"
                badges={["116 Warframes", "Archon Shards"]}
              />
              <FeatureCard
                href="/companion-builder"
                title="Companion Builder"
                description="Build sentinels, kubrows, kavats, MOAs, and more with companion-specific mods."
                icon={Dog}
                accent="cyan"
                badges={["41 Companions", "75 Mods"]}
              />
              <FeatureCard
                href="/riven-calculator"
                title="Riven Calculator"
                description="Generate, grade, and evaluate riven mods with disposition-adjusted stat ranges."
                icon={Dice5}
                accent="amber"
                badges={["596 Dispositions", "Grade System"]}
              />
              <FeatureCard
                href="/codex?section=mods&category=aura"
                title="Codex"
                description="Browse mods, arcanes, and archon shards — verify drain, effects, and data coverage."
                icon={BookOpen}
                accent="indigo"
                badges={["Mods", "Arcanes", "Shards"]}
              />
              <FeatureCard
                href="/archwing-builder"
                title="Archwing Builder"
                description="Mod Archwing frames and Necramechs with real-time stat preview and capacity tracking."
                icon={Plane}
                accent="yellow"
                badges={["Archwing", "Necramech"]}
              />
              <FeatureCard
                href="/damage-simulator"
                title="Damage Simulator"
                description="Simulate damage against enemies with level scaling, armor, and elemental combos."
                icon={Target}
                accent="red"
                badges={["15 Enemies", "Elemental Reference"]}
              />
              <FeatureCard
                href="/loadouts"
                title="Loadout Manager"
                description="Save and manage complete loadouts with warframe, weapons, and companion builds."
                icon={FolderOpen}
                accent="green"
                badges={["Local Storage", "Import/Export"]}
              />
              <FeatureCard
                href="/discover"
                title="Discover Builds"
                description="Browse community builds shared by other Tenno. Upvote, filter, and load shared loadouts."
                icon={Users}
                accent="primary"
                badges={["Community", "Upvotes"]}
              />
              <FeatureCard
                href="/modular-builder"
                title="Modular Builder"
                description="Assemble and mod Kitguns, Zaws, and Amps from individual components with stat preview."
                icon={Hammer}
                accent="orange"
                badges={["Kitguns", "Zaws", "Amps"]}
              />
              <FeatureCard
                href="/railjack-builder"
                title="Railjack Builder"
                description="Configure ship components, armaments, and Plexus mods for your Railjack."
                icon={Rocket}
                accent="rose"
                badges={["Components", "Plexus Mods"]}
              />
              <FeatureCard
                href="/compare"
                title="Build Compare"
                description="Compare two weapon builds side-by-side or pit full loadouts against each other."
                icon={GitCompareArrows}
                accent="teal"
                badges={["Build vs Build", "Loadout vs Loadout"]}
              />
            </div>

            <p className="mt-10 border-t border-border/30 pt-6 text-center text-xs leading-relaxed text-muted-foreground/80">
              Community shout-out:{" "}
              <a
                href="https://buff0000n.github.io/dojocad/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                DojoCAD
                <ExternalLink className="h-3 w-3 opacity-50" aria-hidden />
              </a>
              {" "}by buff0000n — clan dojo layout planning. Thanks for building this for the community.
            </p>
          </div>

          {/* Right: community builds — outer edge */}
          <aside className={cn(HOME_SIDEBAR_ASIDE_CLASS, "xl:col-start-3 xl:justify-self-end xl:pr-0")}>
            <CommunityBuildsSidebar variant="sidebar" limit={10} />
          </aside>
        </div>
      </PageMain>
    </PageShell>
  );
}
