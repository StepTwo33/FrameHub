"use client";

import { Header } from "@/components/header";
import Link from "next/link";
import { Swords, Shield, Bug, Wrench, BarChart3, Users, User } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            About <span className="text-primary">Frame</span><span className="text-muted-foreground">Hub</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            A community-built Warframe build planner and theorycrafting toolkit.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">What is Frame Hub?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Frame Hub is a free, open-source build planner for Digital Extremes&apos; Warframe.
                It lets you theorycraft weapon, warframe, companion, archwing, and modular weapon builds
                with real-time stat calculations, elemental combo resolution, damage simulation, and
                time-to-kill estimates against every enemy faction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Swords, title: "Weapon Builder", desc: "Full mod, arcane, riven, and Incarnon support with burst/sustained DPS, status proc breakdowns, and elemental combo resolution." },
                  { icon: Shield, title: "Warframe Builder", desc: "Mod slots, archon shards, Helminth abilities, ability scaling preview, augment detection, and survivability stats." },
                  { icon: BarChart3, title: "Damage Simulator", desc: "Post-Update 32 enemy scaling, per-faction TTK with Viral/Corrosive status effects, DoT accounting, and armor DR." },
                  { icon: Wrench, title: "Modular & Companion", desc: "Zaw, Kitgun, MOA, and companion builders with category-specific mod pools and riven support." },
                  { icon: Users, title: "Build Sharing", desc: "Save builds locally or to the cloud, generate shareable URLs, and compare builds side by side." },
                  { icon: Bug, title: "Riven Grader", desc: "Grade your rivens against disposition-scaled stat pools with tier rankings and reroll cost reference." },
                ].map((f) => (
                  <div key={f.title} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <f.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{f.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Sources</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All weapon stats, mod values, warframe abilities, arcane effects, and enemy data are sourced from the{" "}
                <a href="https://wiki.warframe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Official Warframe Wiki
                </a>{" "}
                and verified against in-game values. Frame Hub is not affiliated with or endorsed by Digital Extremes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contributing</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Found incorrect data or a missing weapon? Use the{" "}
                <Link href="/report-issue" className="text-amber-400 hover:underline">Report Issue</Link>{" "}
                page or contribute directly. Frame Hub is built with Next.js, TypeScript, and Tailwind CSS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contributors
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Frame Hub is made possible by the following contributors:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: "Step-Bro_Prime", role: "Lead Developer", profile: "/u/step-bro_prime" },
                  { name: "Axel Shade", role: "Data & Design", profile: "/u/axel-shade" },
                ].map((c) => (
                  <Link
                    key={c.name}
                    href={c.profile}
                    className="flex items-center gap-3 border border-border rounded-lg p-3 bg-card hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.role}</div>
                    </div>
                    <User className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="border-t border-border pt-6 text-xs text-muted-foreground">
              <p>
                Warframe and the Warframe logo are registered trademarks of Digital Extremes Ltd.
                Frame Hub is a fan-made tool and is not affiliated with, endorsed, or sponsored by Digital Extremes.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
