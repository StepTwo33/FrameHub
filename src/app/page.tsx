import Link from "next/link";
import { Crosshair, Shield, Dog, FolderOpen, Dice5, BookOpen, Wrench, Target, GitCompareArrows } from "lucide-react";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Build. Calculate. <span className="text-blue-400">Dominate.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Plan and optimize your Warframe builds with real-time stat calculations, mod stacking, and DPS analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <Link href="/weapon-builder" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Crosshair className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">Weapon Builder</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Configure mods for 630 weapons with real-time DPS, crit, and status calculations.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">630 Weapons</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Orokin Catalyst</span>
              </div>
            </div>
          </Link>

          <Link href="/warframe-builder" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-purple-400 transition-colors">Warframe Builder</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Mod your Warframe, install Archon Shards, and see ability stats and survivability.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">116 Warframes</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Archon Shards</span>
              </div>
            </div>
          </Link>

          <Link href="/companion-builder" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Dog className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-cyan-400 transition-colors">Companion Builder</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Build sentinels, kubrows, kavats, MOAs, and more with companion-specific mods.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">41 Companions</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">75 Mods</span>
              </div>
            </div>
          </Link>

          <Link href="/riven-calculator" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Dice5 className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-amber-400 transition-colors">Riven Calculator</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Generate, grade, and evaluate riven mods with disposition-adjusted stat ranges.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">596 Dispositions</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Grade System</span>
              </div>
            </div>
          </Link>

          <Link href="/mod-browser" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors">Mod Browser</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Browse all 1629 mods with filters for category, polarity, and rarity.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">1629 Mods</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Full Stats</span>
              </div>
            </div>
          </Link>

          <Link href="/forma-planner" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Wrench className="h-5 w-5 text-yellow-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-yellow-400 transition-colors">Forma Planner</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Plan polarity placements, calculate capacity costs, and get forma suggestions.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">Polarity Matching</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Auto Suggest</span>
              </div>
            </div>
          </Link>

          <Link href="/damage-simulator" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Target className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-red-400 transition-colors">Damage Simulator</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Simulate damage against enemies with level scaling, armor, and elemental combos.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">15 Enemies</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Elemental Reference</span>
              </div>
            </div>
          </Link>

          <Link href="/loadouts" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FolderOpen className="h-5 w-5 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-green-400 transition-colors">Loadout Manager</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Save and manage complete loadouts with warframe, weapons, and companion builds.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">Local Storage</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Import/Export</span>
              </div>
            </div>
          </Link>

          <Link href="/compare" className="group h-full">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <GitCompareArrows className="h-5 w-5 text-teal-400" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-teal-400 transition-colors">Build Compare</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">Compare two weapon builds side-by-side or pit full loadouts against each other.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">Build vs Build</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">Loadout vs Loadout</span>
              </div>
            </div>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Frame Hub — Warframe Build Planner. Not affiliated with Digital Extremes.
      </footer>
    </div>
  );
}
