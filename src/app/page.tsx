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
  Landmark,
  ExternalLink,
  Github,
  Users,
} from "lucide-react";
import {
  PageShell,
  PageMain,
  FeatureCard,
  CalloutBanner,
} from "@/components/page-shell";
import { FRAME_HUB_GITHUB_URL } from "@/lib/site-links";

export default function Home() {
  return (
    <PageShell>
      <PageMain maxWidth="xl" className="py-8 sm:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Build. Calculate. <span className="text-primary">Dominate.</span>
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Plan and optimize your Warframe builds with real-time stat calculations, mod stacking, and DPS analysis.
          </p>
          <CalloutBanner accent="emerald" className="mx-auto mt-6 max-w-xl">
            <p className="text-sm leading-relaxed text-foreground/90">
              <span className="font-medium text-emerald-400">Frame Hub is open source.</span>{" "}
              Contribute, report bugs, or fork the project on GitHub.
            </p>
            <a
              href={FRAME_HUB_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              <Github className="h-4 w-4" />
              StepTwo33/FrameHub
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
            </a>
          </CalloutBanner>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:grid-cols-3">
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
            href="/mod-browser"
            title="Mod Browser"
            description="Browse all 1629 mods with filters for category, polarity, and rarity."
            icon={BookOpen}
            accent="indigo"
            badges={["1629 Mods", "Full Stats"]}
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
          <FeatureCard
            href="https://buff0000n.github.io/dojocad/"
            external
            title="DojoCAD"
            description="Plan clan dojo layouts: room placement, capacity, and multi-floor design. Opens their site in a new tab."
            icon={Landmark}
            accent="slate"
            subtitle="By buff0000n — thanks for building this for the community."
            badges={["DojoCAD", "External"]}
          />
        </div>
      </PageMain>
    </PageShell>
  );
}
