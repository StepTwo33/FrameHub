# FrameHub Accuracy Hole Checklist

Baseline captured 2026-07-21 (Phase 0). Updated as phases complete.

## Baseline run

| Check | Result |
|-------|--------|
| `npm test` (vitest) | Green at Phase 0 (190); expanded with phase audit suites |
| `scripts/audit_item_behavior_coverage.py` | **1556/1556** after removing hallucinated catalog stubs |

### Coverage counts (post Phase 2b)

| Kind | Count |
|------|------:|
| Mod lines → `weapon_dps` | 514 |
| Mod lines → `warframe_totals` | 181 |
| Mod lines → `mod_panel` | 1355 |
| Arcane lines → `weapon_dps` | 20 (+ Cascadia Overcharge) |
| Arcane lines → `warframe_totals` | 30 |
| Arcane lines → `arcane_panel` | 224 |
| Arcane lines → custom handler | 81 |

---

## Tier A — Must be exact

| ID | Area | Notes | Status |
|----|------|-------|--------|
| A1 | Core weapon math | Crit/IPS/elements/MS/FR goldens | **Locked** Phase 1 (`warframe-math-audit` bare weapons) |
| A2 | `biting_frost` | Was missing behavior; bad maxRank | **Fixed** Phase 2b (R3, +200% CC/CD, mod_panel conditional) |
| A3 | Audit regex `&` | False missing `push_&_pull` | **Fixed** Phase 2b |
| A4 | Amprex innate | Has `electricity` on weapon row | **Verified** Phase 1 |
| A5 | High-use gun mods | Serration…Blaze / Hornet…Primed TC | **Locked** Phase 2a (`gun-mod-audit.test.ts`) |
| A6 | High-use melee mods | PP/TS/OS/60-60s; Volcanic Edge heat | **Fixed+locked** Phase 2b (`melee-mod-audit.test.ts`) |
| A7 | Warframe power mods | Intensify…Primed Flow post-U34 | **Locked** Phase 2c (`warframe-mod-audit.test.ts`) |
| A8 | Passive weapon arcanes | Gated behind `arcaneStacks>0` | **Fixed** Phase 6 (`effectiveArcaneStacks` + Cascadia Overcharge → `weapon_dps`) |
| A9 | TTK shield overflow | Was `overflowFrac * 0` (no-op) | **Fixed** Phase 4 |

---

## Tier B — Best-effort modeled

| ID | Area | Notes | Status |
|----|------|-------|--------|
| B1 | Stance DPS | PvE Neutral hit avgs wiki-locked across stance table; Conclave→1.0; fake catalog stances remain defaulted | **Improved** — still not full combo strings |
| B2 | TTK shield overflow | Health-mod overflow | **Improved** Phase 4 |
| B3 | TTK DoT end-time | 0.25s step instead of +3s guess | **Improved** Phase 4 |
| B4 | Set effects not in DPS | Augur/Hunter **panel %** locked (40%/piece, 25%/piece); Mecha mark/spread summary only; shield-cast / companion timing / Mecha burst still unmodeled in DPS | Panel goldens in `set-bonus-audit.test.ts`; DPS remains C |
| B5 | Ability scaling sparse | Full kits through mechs/Nokko + heat/battery/absorb sims | **Improved** — Contagion + EFF + armor-pool invuln + Vitrify enemy absorb + Gauss battery + Ember heat |
| B6 | Arcane custom handlers | Kinship + Hot Shot stack→DPS; Merciless | **Improved** |
| B7 | Galv / CO / BR / WW | paper vs stacks | **Locked** Phase 3 |
| B8 | Incarnon + radials | … + Mk1-Furis/Kunai forms + Kunai Genesis + **Vasto Prime Deathtrap +0.8× CM** | **Improved** — Contagion Cloud + PT/projSpeed/followThrough panel; remain: aim-feel / holster / reload procs |

---

## Tier C — Documented out of scope

| ID | Area | Notes |
|----|------|-------|
| C1 | Most `mod_panel` lines | Precepts / utility |
| C2 | Most `arcane_panel` lines | Display / non-auto DPS |
| C3 | Weapon passives text | Not wired into DPS |
| C4 | Full mission AI / unlisted team buffs | Disclaimer |
| C5 | `biting_frost` paper DPS | Conditional on 10 Cold freeze — panel only |

---

## Phase completion log

| Phase | Date | Outcome |
|-------|------|---------|
| 0 Baseline | 2026-07-21 | Tests green; checklist written |
| 1 Core math | 2026-07-21 | Bare Braton/Lex/Skana/Amprex goldens |
| 2a Gun mods | 2026-07-21 | 20 wiki max-rank apply tests |
| 2b Melee + biting_frost | 2026-07-21 | Volcanic Edge heat restore; biting_frost; coverage 1600/1600 |
| 2c Warframe mods | 2026-07-21 | Post-U34 survivability + power mod goldens |
| 3 Conditionals | 2026-07-21 | Galv Chamber/Aptitude, CO, BR, WW stack goldens |
| 4 TTK | 2026-07-21 | Shield overflow + DoT end-time improvements |
| 5–9 Satellite | 2026-07-21 | Stance type fallbacks; Cascadia Overcharge DPS; Roar registry; companion/RJ smoke |
| 5–9 deepen | 2026-07-21 | Kinship/Hot Shot stack DPS; Mirage+Helminth Eclipse; Umbral set; Helminth buff fallback |
| Sets + abilities + Incarnon | 2026-07-21 | Augur/Hunter panel scaling; Breach Surge not weapon buff; Electric Shield gun buff; Laetum form golden |
| Ability Extra Hits + Felarx | 2026-07-21 | Nourish/Toxic Lash/Xata/Vex loadout buffs; Helminth Nourish/Xata data fix; Felarx form golden |
| Helminth + SG + Augur Seeker | 2026-07-21 | Helminth Roar 30%; SG additive; Empower not weapon buff; Augur Seeker→pistol |
| Parasitic Link + Incarnon forms | 2026-07-21 | PL mult golden; Braton/Latron/Onos/Dread forms; Celestial Twin health STR |
| Misc multiplier display | 2026-07-21 | Fixed bare multipliers misread as seconds/percent (Celestial Twin 2×) |
| Spores + more Incarnons + Ruvox | 2026-07-21 | Spores growth×STR; Paris/Lato/Gorgon/Despair forms; Ruvox trigger Melee |
| Melee triggers + Miasma + Genesis | 2026-07-21 | Dual Viciss/Ekhein→Melee; Miasma 4× Spores misc; Bronco/Cestra/Sicarus/Kunai/Zylok forms |
| Mk1 melee triggers + more forms | 2026-07-21 | Mk1-Bo/Mk1-Furax→Melee; Gammacor/Miter form goldens |
| Prova/Venato data | 2026-07-21 | Prova(s)→Melee; Venato(+Prime) stance scythe + Venato trigger Melee |
| Strun form golden | 2026-07-21 | Impact 100 Semi / mag 40 + Blast/Puncture/Slash AoE |
| Synoid/Bo/Nami/Pillage | 2026-07-21 | Synoid form override; Bo +4 / Nami +3 form range; Pillage strip×STR |
| Native melee form range | 2026-07-21 | Innodem/Praedos +3 Range; Ruvox +3 Range/−35% AS |
| Ruvox IPS + Terrify | 2026-07-21 | Ruvox form Impact→Puncture; Terrify 15m/25s/60% strip + enemy count×STR |
| TL dip + Vex fill + Onos charge | 2026-07-21 | Extra Hit × (1+elem mods); Vex Fury 0–1; Onos charge Heat 2200 mode |
| TL DoT + Thalys T1 | 2026-07-21 | Guaranteed TL Toxin DoT + Extra Hit faction² / DoT faction³; Thalys +3 Range/+40% AS |
| Spores TL + stances + combo evos | 2026-07-21 | Spores 2× Extra Hit (1 DoT); stance avg fill-ins; Adept Reflexes/Resolute Force/Magistar IC |
| Genesis HAE/windup/reload + Tharros | 2026-07-21 | Obex +50/+10; Overhand set HAE; Swift Break windup; Ready Retaliation reload; Tharros/Gravitic misc |
| Sicarus SE + max-stack Genesis | 2026-07-21 | Sicarus SE/EV variants; Edge of Justice +40% AS; Avalanche/Headcracker/Accel/Resonant; PL 0.25 |
| Genesis conditionals | 2026-07-21 | Fatal Affliction×statusTypes; Wiseman/High Ground/Decisive cross-stats; Prelude CM gate |
| Genesis bleed/HS/status | 2026-07-21 | Flashing Bleed; Caput/Deadhead; Carnage; Alchemy dur; Fevered MS; Reaver; Neurotoxin |
| Genesis max-stack paper | 2026-07-21 | Kill Joy/Stormburst/Infused/Crimson/Paragon/Riddled/Blazing/Synergist/Skullbuster/Gun&Blade; sprint FA/FR |
| Genesis conditional uptime | 2026-07-21 | Haven/Paladin/Guardian/Daring/Deathtrap/Red Right/Dawn/half-HP/Hoplite/Swooping/Impaler/Zylok stacks |
| Contagion Cloud panel | 2026-07-21 | R3 300/s×STR, 5m×RNG, 12s×DUR on Toxic Lash miscStats; mod stats absolutes |
| Contagion Cloud DPS | 2026-07-21 | Sim-gated enemies (0–8) × ability toxin DPS × STR (×2 melee) when Contagion Cloud augment + Toxic Lash active; separate panel row; not in TTK |
| Lavos Probe CDR×EFF | 2026-07-21 | Transmutation Probe cooldownReduction × Ability Efficiency (1.5s×EFF); EFF scale attr + badge wired for misc panel |
| Garuda Bloodletting×EFF | 2026-07-21 | energyGainPercent × Ability Efficiency (40%×EFF); health deduct / min HP Misc-fixed |
| Inverse-DUR misc | 2026-07-21 | EV pulseInterval÷DUR (floor 0.5s); Shadows healthDecay÷DUR; Navigator growth÷DUR; Prowl stealTime÷DUR; stealTime display as seconds |
| Equinox Pacify DR | 2026-07-21 | pacifyDamageReduction = 1−(0.5÷STR); wiki Intensify 130% → ~61.5% (panel 62%) |
| Sol Gate channeled drain | 2026-07-21 | energyDrain/boostedEnergyDrain × max((2−EFF)÷DUR, 0.25); 12→8.4 at 130% EFF |
| Nyx Absorb convert×STR | 2026-07-21 | weaponDamageConvert 0.025%×STR (cap 400% Misc) |
| Nyx Absorb √buff DPS | 2026-07-21 | Sim-gated absorbed damage (0–64k) → additive weapon buff √(0.025%×STR×absorbed) cap 400%; wiki 20k@130% STR → +255% |
| Nourish energy×STR | 2026-07-21 | energyMultiplier 1+((base−1)×STR); native 2→2.3 / Helminth 1.6→1.78 at 130% STR |
| Gloom channeled drain | 2026-07-21 | energyDrainPerEnemy × max((2−EFF)÷DUR, 0.25); fixed 0.75→75% / cap→10% display bugs |
| Equinox channeled drains | 2026-07-21 | Pacify 0.5/s/enemy + Mend & Maim 3.5/s × max((2−EFF)÷DUR, 0.25) |
| Channeled drain batch | 2026-07-21 | Peacemaker/Hysteria/Spectral Scream/Effigy/Exalted Blade(+Umbra family)/Elude/Sound Quake/Danse/Razorwing/Primal Fury/Prism/Navigator/Prowl/Renewal/Mass Vitrify/Glory/Pulverize/Silken Stride/Mach Rush/Tail Wind/Guard Mode/Ironbride × EFF/DUR |
| Hildryn shield costs | 2026-07-21 | Haven/Aegis drains × EFF/DUR; Haven recharge × DUR; Haven/Aegis/Balefire shieldCost cast × EFF (25% floor) |
| Genesis leftovers paper | 2026-07-21 | Boar Reified 24; Steadfast ×3 CM; Felarx MM +60% FR; Kinetic CM set 4; Lethal +90% reload; OA +1200%; Sawblades +70% FR; Gambit +150% CC |
| Genesis P0 + Shroud + stance | 2026-07-21 | Bo +50% HAE; Templar +70% HAE; Ballistica FR/CC stacks; Ruvox Impetus/Brutal; Phenmor Spiteful/Lingering; Praedos TM; Shroud CD/SC×STR; Coiling Viper 1.85 |
| Ammo efficiency sustained | 2026-07-21 | AE extends mag cycle; Daring/Trusty/Enough/Feather/Agile/Reaper paper; arcane AE no longer no-op |
| Flensing + stances + Shroud fix | 2026-07-21 | Latron −20% armor/Puncture in TTK; stance avgs; Shroud SC/speed no longer ×STR; Felarx/Lato AE |
| Cascade + Bolts + range paper | 2026-07-21 | Onos +250% CC/CM; Psychic Bolts 80%×STR; Ulfrun speed fixed; Thalys/Skyborne/Brigand/Reaching; Flensing→damage-sim |
| Boltor variants + Genesis paper | 2026-07-21 | Prime/Telos form overlays; Crimson Overture AE stacks; Vendetta +30% MS; Torid Plentiful +60%; Gnashing Payara 1.85 |
| Cyclone + Chroma panel + Genesis | 2026-07-21 | Cyclone Kraken 2.4; EW/Vex misc×STR/DUR/RNG; Larva mutation×STR; Destreza SC/windup; Ronin +30% AS |
| Variant forms + Contempt stance | 2026-07-21 | Latron Prime/Wraith, Lex Prime, Strun Prime/Wraith form overlays; Sinking Talon 1.7; Archon Contempt 1.0 |
| Gorgon/Soma forms + Effigy | 2026-07-21 | Gorgon Wraith/Prisma + Soma Prime form overlays; Atlantis Vulcan 1.7; Effigy misc camelCase (Misc fixed) |
| More variant forms + Fangs | 2026-07-21 | Braton Prime/Vandal, Lato/Sybaris/Paris Prime, Dera Vandal forms; Butcher's Revelry 1.9; Fangs counts |
| Sibling forms + Sybaris ED | 2026-07-21 | Lato Vandal, Dex Sybaris, Mk1-Braton forms; Burston Prime 28% CC; Sybaris Prime ED form +23% SC |
| More sibling Incarnon forms | 2026-07-21 | Sicarus Prime, Prisma Angstrum, Mk1-Strun, Boar Prime forms; Boar form MS 1 |
| Zylok/Ballistica/Bronco Prime | 2026-07-21 | Zylok Prime 500 IPS + Heat 700; Ballistica Prime Slash 830 MS 1; Bronco Prime 34 IPS |
| Vasto/Paris/Vectis/Rakta forms | 2026-07-21 | Vasto Prime IPS 70; Mk1-Paris 50+250; Vectis Prime Cold 150; Rakta Ballistica Slash 734 |
| Mk1 Furis/Kunai + stances | 2026-07-21 | Mk1-Furis Heat 60; Mk1-Kunai IPS 24; Kunai SC/Deathtrap variants; Stinging Thorn + Astral Twilight 2.2 |
| Vasto Deathtrap + dagger/glaive stances | 2026-07-21 | Vasto Prime Deathtrap +0.8× CM; Gleaming Talon 2.6; Homing Fang / Pointed Wind 2.4 |
| Stance Neutral avgs batch | 2026-07-21 | Iron Phoenix 2.3; Crossing Snakes 1.8; Flailing Branch / Fracturing Wind 3.0; Eleventh Storm 2.7; Rising Steel / Celestial Nightfall Conclave 1.0 |
| Gemini Cross Neutral avg | 2026-07-21 | Vagrant Blight hit avg ~1.2× (was 1.65; many 50% hits) |
| Swirling Tiger Neutral avg | 2026-07-21 | Winding Claws hit avg ~1.4× (was 1.6) |
| Carving Mantis Neutral avg | 2026-07-21 | Rapid Incisions hit avg ~2.4× (was 1.65) |
| Stance Neutral batch 2 | 2026-07-21 | Crimson Dervish 2.8; Bleeding Willow 1.3; Sovereign Outcast 1.5; Seismic Palm / Four Riders 2.6; Clashing Forest 1.7 |
| Stance Neutral batch 3 | 2026-07-21 | Blind Justice / Swooping Falcon 2.4; Stalking Fan 3.0 |
| Stance Neutral batch 4 | 2026-07-21 | Reaping 3.2; Twirling/Vengeful 2.8; Crushing Ruin 3.0; Defiled 2.3; Vermillion 2.2; Shimmering 1.3; Brutal Tide 1.8 |
| Stance Neutral batch 5 | 2026-07-21 | Shattering Storm 3.5; Tranquil Cleave 2.2; Slicing Feathers 2.4; Fateful Truth / Crashing Havoc Conclave 1.0 |
| Stance Neutral batch 6 | 2026-07-21 | Galeforce/Mountain's Edge 3.0; Rending Crane 2.8; Grim Fury 2.6; Votive 2.0; Noble Cadence Conclave 1.0 |
| Stance Neutral batch 7 | 2026-07-21 | Tempo Royale 2.3; High Noon 1.6; Bullet Dance 1.7 |
| Stance Neutral batch 8 | 2026-07-21 | Cleaving Whirlwind 3.3; Gaia's Tragedy 3.0; Decisive Judgement / Wise Razor 2.8 |
| Stance Neutral batch 9 | 2026-07-21 | Burning Wasp / Sundering 3.0; Spinning/Gnashing/Butcher 2.8; Vulpine 2.3; Coiling 2.0; Harbinger 1.9; Sinking 1.0; Atlantis 0.7 |
| Conclave stance paper | 2026-07-21 | Remaining Conclave stances (Quaking Hand, Rending Wind, Argent Scourge, …) → 1.0; Argent mapped in stances.ts |
| B5 Ember + Prismatic | 2026-07-21 | Prismatic placementDistance not ×RNG; Immolation 85%/40% DR×STR; Fire Blast 200/25m + strip×STR; Effigy/Lycath/Ulfrun/Shroud fixed-misc goldens |
| Catalog hallucination purge | 2026-07-21 | Removed 44 wiki-missing stubs (fake stances, misnamed dups, junk); kept real dups under correct names |
| Jade Ophanim + Symphony | 2026-07-21 | Wiki-fixed Ophanim Eyes 50/20m/30s/Heat+strip; Symphony Deathbringer additive DPS; Jade's Judgment → augment + warframeId |
| Jade Judgment + Glory | 2026-07-21 | Light's Judgment 500 Heat/6m/10s + heal×STR; Glory 25+5/s, 150/1500 Heat, DR 35%×STR (cap 50%) |
| B5 Gauss kit | 2026-07-21 | Thermal Sunder 750/1500 + radii×RNG; Helminth 450/900; Plating DR×STR; Redline buffs×DUR + loadout FR |
| B5 Gyre kit | 2026-07-21 | Arcsphere/Coil/Rotorswell wiki numbers; Cathode Grace 75/8s/+50% CC×STR; Helminth→Coil Horizon (was wrong Cathode) |
| B5 Protea kit | 2026-07-21 | Fan 500 Slash/5m/13s + satellites; Artillery 50/500 Heat; Dispensary 75/25s (Helminth 12.5s); Anchor 100/8s/15m |
| B5 Dante kit | 2026-07-21 | Noctua 5+2/shot 250/2750; Light/Dark 25 energy; Final 50/45s/30m; Helminth→Dark Verse (was wrong Noctua) |
| B5 Qorvex kit | 2026-07-21 | Pillar 1000/8m/35s; Wall 50/3500 Impact+200 Rad tick; Guard 75/5–10 stacks×STR; Blast 100/10k DPS; Helminth→Pillar |
| B5 Lavos kit | 2026-07-21 | Bite 1000/10m/8s CD +15% heal×STR; Vial 250/s 30m/8s/5s CD; Probe 250/s 6m/10s CD +1.5s CDR×EFF; Catalyze 2000/25m/30s CD |
| B5 Kullervo kit | 2026-07-21 | WA +200% flat final melee CC×STR (Helminth +100%/12.5m); Recompense 500/8m; Curse 50% redirect; Ukko 2500/s/10m/15s |
| B5 Sevagoth kit | 2026-07-21 | Reap 250 Rad/8m +50% vuln; Sow 50/250 True DPS; Gloom 50+0.75/s/enemy×EFF/DUR slow/lifesteal×STR; Shadow Death Well 75%/1%/s |
| B5 Dagath kit | 2026-07-21 | Wyrd 500/1000 Viral +35% slow; Doom 500/15m; Grave +50% CD×STR; Cavalry 30k/strip; Helminth→Wyrd (was Doom) |
| B5 Caliban kit | 2026-07-21 | Gyre 500 Tau/s; Wrath 2000/+35% vuln; Progeny 50/45s; Fusion 15k/s +50% strip; Helminth Wrath filled |
| B5 Baruuk kit | 2026-07-21 | Elude 25+2.5/s 180°; Lull 50/20s/25m; Hands 250 Blast/8 daggers×STR; Storm 250 +25% DR (cap 40%) |
| B5 Harrow kit | 2026-07-21 | Condemn 150 shields/enemy×STR (flat); Penance +35% FR/+70% reload×STR; Thurible EPK; Covenant Retaliation CC absorb sim |
| B5 Garuda kit | 2026-07-21 | Mirror 2× capture/20s/30m; Altar 25%/s heal; Bloodletting 40% energy×EFF; Talons 300/75% SC |
| B5 Nezha kit | 2026-07-21 | Walker 200 Heat/s +1250 blast; Chakram 250/+100% vuln; Halo 1000 HP/2.5× armor+absorb Misc + Initial=(base+mult×armor)×STR; Spears 600/19m/12s |
| B5 Styanax Helminth | 2026-07-21 | Helminth→Tharros Strike (was wrongly Rally Point); native Tharros 1000 Impact / 50% strip / 100 heal |
| B5 Voruna kit | 2026-07-21 | Shroud flat melee CD×STR buff; Helminth→Lycath's Hunt 50% orbs (was wrongly Shroud); Ulfrun kill CD numeric |
| B5 Nekros kit | 2026-07-21 | Soul Punch mark/threshold; Desecrate 25m/60% orb/10e/corpse×EFF; Shadows +150% dmg/+100% HP/SP +3% decay÷DUR; Helminth Terrify 75 |
| B5 Hydroid kit | 2026-07-21 | Barrage 300 Corrosive; Plunder 75/25m armor+Corrosive bonus; Tentacle 50/200 DPS (was 100 energy) |
| B5 Limbo kit | 2026-07-21 | Banish 250 Impact/35m/25s; Stasis 15s; Surge 25m/18s banish; Cataclysm 500 Blast/16→5m |
| B5 Loki kit | 2026-07-21 | Decoy 25s/15% absorb; Invis 12s (was 30); Switch 75m/+50% speed; Disarm 500 Impact/20m |
| B5 Mag kit | 2026-07-21 | Pull 300/25m; Magnetize 300 Blast/2×/15s; Polarize 400/8m; Crush 1500/18m |
| B5 Frost kit | 2026-07-21 | Freeze 350/150 area/5m; Ice Wave 700/20m/45°; Globe 3500/5m/5× Misc + Initial HP=(base+mult×armor)×STR; Avalanche 1500/15m/60% strip |
| B5 Gara kit | 2026-07-21 | Lash 400/12m; Storm 250/s 70% DR/2.5m; Spectrorage 800/1500; Vitrify 75/11m/50% vuln/1600 seg/5× Misc + Initial seg pool + crystallized absorb |
| B5 Equinox kit | 2026-07-21 | Meta 25s Night/Day +150 Night Shields×STR (flat); Rest&Rage 25/50m/22s; Pacify 50% DR via 1−(0.5÷STR)/16m +0.5/s/enemy×EFF/DUR +3e/ability×EFF; Mend&Maim 50/150 Slash/18m +3.5/s×EFF/DUR |
| B5 Ivara kit | 2026-07-21 | Quiver Cloak 12s/2.5m; Navigator 5× +growth÷DUR +drain/growth×EFF/DUR; Prowl +40% HS/stealTime÷DUR +melee/dmg energy×EFF; Artemis 240×7 |
| B5 Ash kit | 2026-07-21 | Shuriken 750×5; Smoke 12s/10m; Teleport +200% finisher; Blade Storm 1500 True/12e/mark×EFF |
| B5 Atlas kit | 2026-07-21 | Landslide 350/12m; Tectonics 1500 HP/5× Misc + Initial=(base+mult×armor)×STR; Petrify 20s/14m/+50% vuln; Rumblers 2000/1200 HP |
| B5 Banshee kit | 2026-07-21 | Boom 50 Impact/15m; Sonar 5×/35m/30s; Silence 30s/20m; Quake 200 Blast/s/20m |
| B5 Revenant kit | 2026-07-21 | Enthrall 1000/30s; Mesmer 6 charges; Reave 50/8%/6m (was 75); Danse 1250/s |
| B5 Oberon kit | 2026-07-21 | Smite 500/35%/50m; Ground 100 Rad/15m; Renewal 25/50% armor/40 HPS; Reckoning 7500/60% strip |
| B5 Octavia kit | 2026-07-21 | Mallet 2.5×/10m/20s; Resonator 125/6→15m; Metronome 12m/20s buffs; Amp 25–200%/14m |
| B5 Trinity kit | 2026-07-21 | Well 100 HPS/1% LS/20s; Vampire 25 energy/pulse×STR +interval÷DUR (floor 0.5s); Link 3/75% redirect; Blessing 80%/50% DR |
| B5 Nova kit | 2026-07-21 | Null Star 200 Blast/12/10m/5% DR; AMD 200/8×; Wormhole 50m/4; MP 800/50% slow/30s |
| B5 Volt kit | 2026-07-21 | Shock 15/200/5 chains; Speed 75%/25% reload; Shield +50% Elec; Discharge 1200/s |
| B5 Excalibur kit | 2026-07-21 | Slash Dash 20m/7m chain (dmg via Exalted); Blind/Howl 25m/15s; Javelin 1000/25m; Blade 250/2.5/s +5m/6s slide blind +25 slide×EFF |
| B5 Wisp kit | 2026-07-21 | Reservoirs 5m/30s motes (300 HP/30 HPS/20% haste/10 Shock); Wil-O 4s; Breach 2×/18m/16s; Sol Gate 1500/s +drain×EFF/DUR; Helminth 18m |
| B5 Zephyr kit | 2026-07-21 | Tail Wind 750/4500 dive/2m/7m +12.5 air×EFF; Airburst 500/8m/+35% +25 air×EFF; Turbulence 6m/20s; Tornado 160/0.25s (640 DPS)/25m/3 |
| B5 Nyx kit | 2026-07-21 | Mind Control 60m/60s; Bolts 80% strip/6/11s; Chaos 25m/25s/10 Rad; Absorb 1500/15m→50m/5s +0.025% convert×STR; Helminth MC 60s |
| B5 Mesa kit | 2026-07-21 | Battery 70%/140/5k; Gallery 25%/16m/30s; Shatter 80% DR (cap 95%); Peacemaker 50/+150%/15/s/50m |
| B5 Mirage kit | 2026-07-21 | Hall 4 clones/25s; Sleight 200/40m/18s; Eclipse 75% DR/200% dmg/25s (cap 90%); Prism 250/12s/20 lasers; Helminth Eclipse 25s |
| B5 Nidus kit | 2026-07-21 | Virulence 200 Puncture/16m × Mutation stacks panel; Larva 12m (Helminth 8m); Link 1 stack/40m; Ravenous 150/20 HPS/8m |
| B5 Rhino kit | 2026-07-21 | Charge 650/12m/2m; Iron Skin 1200 OG/2.5× Misc + Initial OG=(base+mult×armor)×STR; Roar 50%/25m/30s; Stomp 800/97.5% slow; Helminth Roar 30% |
| B5 Valkyr kit | 2026-07-21 | Rip Line 600/75m; Warcry 50% AS/50% armor/20s (Affinity); Paralysis 400/10m/30% slow; Hysteria 250/5/s; Helminth Warcry AS 30% |
| B5 Grendel kit | 2026-07-21 | Feast 500 Toxin/25m/5; Nourish +75% Viral/2× energy/1000 heal/25s; Pulverize 500–2000/50% strip; Regurgitate 2000/6m/75% strip; Helminth Nourish 45%/1.6×/no heal; energy 1+((mult−1)×STR) |
| B5 Hildryn kit | 2026-07-21 | Balefire 500–1500/3m/50 shields×EFF; Pillage 8m/25% strip/150 shields×EFF; Haven 500 ally shields/80% recharge×DUR/drains×EFF/DUR; Aegis Storm 200 DPS/500 Impact/drains×EFF/DUR/50 dodge×EFF |
| B5 Titania kit | 2026-07-21 | Spellbind 50m/5m/16s; Tribute 500/12s +120s aura; Lantern 350 DPS/2500/25s; Razorwing 160/Diwata 200/5/s; Helminth→Spellbind (was wrongly Tribute) |
| B5 Saryn kit | 2026-07-21 | Spores 10/60m/16m spread/+2 growth; Molt 500 HP/400 Toxin/40s/50% speed; Toxic Lash 30%/60%/45s; Miasma 150 Viral/s ×4 Spores; Helminth Molt 40s |
| B5 Wukong kit | 2026-07-21 | Twin 2× HP/0.5×/3× mark; Cloud 8m/1%/m; Defy 7.5×/1.5× armor/1500 cap; Primal Fury/Iron Staff 300/5/s; Helminth Defy armorCap 750 |
| B5 Xaku kit | 2026-07-21 | Xata +26% Void/35s; Grasp 50/15m/6 targets; Lost Deny 4000/Gaze 50% strip; Vast Untime 1200/25% slow (cap 95%)/50% Void vuln |
| B5 Yareli kit | 2026-07-21 | Sea Snares 250 Cold/s/+125/s/100% vuln/12s; Merulina 7500 HP/90% redirect; Aquablades 750/45s/75e/5m; Riptide 500/2500 burst; Helminth Aquablades 75e |
| B5 Khora kit | 2026-07-21 | Whipclaw 150/10m/5m; Ensnare 30m/15s/10m spread; Venari 1.15× speed/350 snare/50 HPS; Strangledome 250/5m/10m grab; Helminth Ensnare 30m |
| B5 Inaros kit | 2026-07-21 | Desiccation 150 True/8 DPS/15m/8s/25% LS; Sandstorm 500 Slash DPS/7.5m; Scarab Shell 350 armor/0e; Scarab Swarm 100e/10% HP/tick; Helminth Desiccation filled |
| B5 Vauban kit | 2026-07-21 | Tesla 150/25 DPS/6m/10 charges; Minelayer 25e/250 tether/300 flechette/25% Overdrive; Photon 2500 Blast/7m/50e; Bastille 10m/10%/s strip/1500 armor cap |
| B5 Chroma kit | 2026-07-21 | Spectral 400 DPS/3/s; Ward Heat +55%/100 DPS / Cold +145% armor; Vex Scorn 350%/Fury 275%/18m; Effigy 8k HP/2000 DPS/10/s; Helminth Ward |
| B5 Ember kit | 2026-07-21 | Fireball 800/300 area/3m; Immolation 40–85% DR (cap 90%); Fire Blast 200/25m/100% strip; Inferno 2500/350–700 DPS/15s/0+10e/enemy; Helminth Fire Blast 25m |
| B5 Citrine kit | 2026-07-21 | Fractured 500/14m/50%/20% orbs; Shell 40% DR (cap 90%, Affinity); Gem 1000/15m/30s; Crystallize 500 Impact/300% crit; Helminth→Fractured Blast 250/25%/10% (was wrongly Preserving Shell) |
| B5 Jade kit | 2026-07-21 | Judgment 500 Heat/tick/8% HPS/6m; Symphony +25% STR/+100% weapon/10% shield regen; Eyes 50/10% strip/s/20m; Glory 150/1500/35% DR (cap 50%) |
| B5 Styanax kit | 2026-07-21 | Axios 1250/1250/50m/15m; Tharros 1000/50% strip/100 heal; Rally 50 shields/kill/3 EPS/30m; Final Stand 1500×30 javelins×DUR |
| B5 Cyte-09 kit | 2026-07-21 | Seek 60m/75% WP/35s; Resupply +25%/+50% sniper/2–6 packs; Evade 75e/10s/cap 30/100 heal×STR (flat); Neutralize 1.25×/10m ricochet; Helminth→Evade cap 25 (was wrongly Resupply) |
| B5 Temple kit | 2026-07-21 | Pyrotechnics 1000 IPS/25m/20m/5 pillars; Overdrive 750 Heat/25% crit vuln/20m; Ripper's Wail 50e/+75% Heat (cap 750%)/30s; Exalted Solo 75e/1.25× Lizzie; Helminth Pyro 1000 |
| B5 Koumei kit | 2026-07-21 | Kumihimo 25×dice/30m/12s/15 threads; Omikuji rare 15%/CD cap 150; Omamori 75e/heal×1/50% block (no duration); Bunraku 500 Puncture/20s/30m; Helminth Omamori 75e/10–20 charms |
| B5 Oraxia kit | 2026-07-21 | Mercy's Kiss 4000 Toxin/40m/200% HP orb/50% energy/50% threshold; Embrace 250/50% vuln/10m/25s; Brood 750/25m/45s Scuttlers; Stride 2× HP/+40% Toxin/5eps; Helminth Embrace 6.67m |
| B5 Uriel kit | 2026-07-21 | Infernalis 1500 cast/250 DPS/2m/35s; Remedium 50e/50% heal; Demonium 75e/250/50% vuln/6m; Brimstone 75e/1500/15m/10s; Helminth Remedium 35% (no demons) |
| B5 Follie kit | 2026-07-21 | Forced Perspective 750/5m/3.5s invuln; Shadowgraph 250/4m/20s; Self Portrait 550/50% DR (cap 90%)/8→20m; Plein Air 250–25k/50% strip/18m; Helminth Portrait DR cap 75% |
| B5 Sirius & Orion kit | 2026-07-21 | Coronal 1500 Heat/5m; Gravitic 2000 Slash/50% strip/8m; Jade Stars 500/35s/7 motes; Astral Shell 35s/200 Blast decoy; Sanctuary 30s/25–55 HPS/45% DR (cap 75%); Event Horizon 750/8m→12m; Clash 10k Blast/26m; Helminth→Jade Stars 500/35s |
| B5 Nokko kit | 2026-07-21 | Stinkbrain 250 Viral/5m/25s/4 cap; Brightbonnet 15 energy×STR/+30% STR (cap 150%)/15m/25s; Reroot 50e/10s/10 HPS/80 pickup; Sporespring 75e/2500 Toxin/3m/10 bounces×1.5; Helminth Brightbonnet 10e/+20% STR (cap 100%) |
| B5 Voidrig kit | 2026-07-21 | Necraweb 2000 Blast/20m mire/25m explode/50% slow; Storm Shroud 50e/1200 HP/2× absorb/100% reflect; Gravemines 75e/200 Heat×24/8m; Guard Mode 50e/500/5eps (Arquebex) |
| B5 Bonewidow kit | 2026-07-21 | Meathook 20% HP/s/40% LS/50% throw; Shield Maiden 25e/2000 HP Misc/2× reflect×STR/2.5× armor Misc + Initial pool/Kiss 15e×EFF; Firing Line 50e/25m/5s Lifted/+50% vuln; Ironbride 50e/1500/2.5eps |
| B5 Helminth unique | 2026-07-21 | Infested Mobility +60% sprint/+30% parkour/8s; Energized Munitions 75% ammo/5s; Empower +50% next STR; Marked for Death 75% spread; Rebuild Shields 12s CD |
| Misc flat≠% root fix | 2026-07-21 | Bare numbers ≥1 no longer auto-% (was Shuriken 5%, AMD 25000%, angles…); true fraction keys + cooldown/angles/× growth; Plunder/Covenant caps 200% |
| Exalted/Inferno cast costs | 2026-07-21 | Artemis/Noctua/Neutralize energyPerShot (+ altFire) × EFF; Inferno energyPerEnemy × EFF; combo/kill windows + kavat lifespan as seconds |
| Fire Blast max-heat + Glory alt | 2026-07-21 | Ember Fire Blast maxHeatEnergyCost 25 × EFF (heat energy/strip later panel-lerped); Jade Glory altFireEnergy 25 × EFF |
| Virulence energy refund × EFF | 2026-07-21 | energyRefundPerHit follows cast_cost (¼ of ability cost); low EFF increases refund |
| Armor-pool invuln absorb | 2026-07-21 | Sim-gated Invuln Absorb (k): Iron Skin/Globe/Tectonics/Maiden +absorb; Halo absorb×2.5 inside STR |
| Storm Shroud + FB heat | 2026-07-21 | Shroud Initial=(base+absorb×mult)×STR; absorbMult×STR; Fire Blast Immolation Heat% lerps 75→25 × EFF |
| Ember heat lerps | 2026-07-21 | Inferno ring DPS×(1+heat)×STR; Immolation DR wiki blend (75%@130%→80%); Fire Blast strip 50–100%×STR cap |
| Fireball heat + Gauss battery | 2026-07-21 | Fireball ×(1+2×heat)×STR (×3 at max heat); Kinetic Plating DR at battery (wiki 80%→84%) |
| Gauss Redline + Sunder battery | 2026-07-21 | Redline FR/AS/reload/cast lerp min→max (÷5) × battery × DUR; Thermal Sunder Cold/Heat dmg + status dur × battery (not radius; Helminth fixed) |
| Genesis PT + projectileSpeed | 2026-07-21 | CalculatedStats punchThrough/projectileSpeed; Swift Deliverance/Frictionless; Fortress Salvo/Hunter's Mantra/Tenno/Inciting PT; Speeding Bullet (assume uptime) |
| Genesis followThrough panel | 2026-07-21 | Magistar Crushing Verdict +40% (channel); Nami Solo Lone Blade +60% (melee equipped) |
| Gauss passive battery shields | 2026-07-21 | Shield recharge +delay reduction × battery (wiki 80%→96%/64%; full 120%/80%); not × STR |
| Thermal Sunder Redline strip | 2026-07-21 | Blast armor strip 0% at ≤80% battery → 100% at full (Redline synergy; not × STR) |
| Mass Vitrify enemy absorb | 2026-07-21 | Segment += N×max((320+5×armor)×STR, enemyEHP÷10); wiki 4160+2496; Enemy HP+Shields (k) for max path |
| Thurible energy per kill | 2026-07-21 | EPK = 1+[channel×0.15÷(2−EFF)]×STR; HS ×4; wiki 25/130%/130% → ≈7.96 / ≈31.86 |
| Metamorphosis linear decay | 2026-07-21 | Peak×STR decays linearly to 0 over duration×DUR; wiki mid-duration half peak (250→162.5 @130% STR) |
| Covenant Retaliation CC | 2026-07-21 | CC=(5%+absorb÷100×1.5%)×STR; body cap 50% / HS ×4 cap 200%; wiki 3k→cap, 2k@130%→45.5%/182% |
| Baruuk Restraint passive DR | 2026-07-21 | DR = eroded×50% (full erosion → 50%); passive text 50%; not × STR |
| Virulence × Mutation stacks | 2026-07-21 | floor(base×STR×(1+stacks)); wiki 200×1.45×101=29290; Field DPS = half base × same |
| Valkyr Rage passive | 2026-07-21 | Melee dmg bonus = Rage% (cap 300%); death prevention ≥150%; passive text filled |
| Passive placeholder hygiene | 2026-07-22 | Filled wiki-known \|PLACEHOLDER\| passives (Ash→Zephyr batch); Ember Heat-enemy STR + Garuda kill-stack panel sims |
| Fireball combo×heat | 2026-07-22 | Chain 1/2/4/8 + 4×heat; dmg=(base÷2)×(combo+1)×STR; wiki 3600/5200 goldens + Prior Casts slider |
| Frost Fortifying Freeze | 2026-07-22 | +50 Armor × Cold enemies in Affinity Range (panel; after mods, not × STR) |
| Cyte-09 + Grendel passives | 2026-07-22 | Practiced Aim +1% WP CC/kill cap 300%; Grendel +250 Armor/gut enemy cap 5 (+1250) |
| Caliban + Protea passives | 2026-07-22 | Adaptive Armor +5%/hit cap 50% (panel DR/EHP); Protea 4th cast +100% STR at 3 power bars |
| Styanax + Yareli passives | 2026-07-22 | Hoplite +1% CC / 40 shields (×2 Speargun); Critical Flow +200% secondary CC while moving |
| Zephyr + Xaku passives | 2026-07-22 | Airborne +150% weapon CC; Xaku 25% dodge/AoE DR → 75% during Vast Untime |
| Volt + Trinity passives | 2026-07-22 | Static Discharge 10/m Electric cap 1000; Lifegiver allies +50% of max Energy as Health |
| Mesa + Qorvex passives | 2026-07-22 | Mesa dual FR +15% / single reload +25% / +50 HP no melee; Qorvex Core Exposure +3 PT |
| Excalibur + Saryn passives | 2026-07-22 | Swordsmanship +10% dmg/AS with swords; Saryn status duration ×1.25 (+25%) |
| Kullervo + Vauban passives | 2026-07-22 | Kullervo +75% HAE / +100% Heavy Wind Up; Vauban +25% mult dmg vs incapacitated |
| Ash + Hydroid passives | 2026-07-22 | Ash Slash status +25% dmg / +50% dur; Hydroid Corrosive 1st/full strip 50%/100% |
| Dante + Dagath passives | 2026-07-22 | Chronicler's Mark SC ×1.5 on scanned; Abundant Abyss 35% ×4 orb yield (E[×]=2.05) |
| Equinox + Revenant passives | 2026-07-22 | Equinox 10% orb cross-convert; Revenant shield-break 100 Impact / 7.5m (75% edge falloff) |
| Octavia + Nekros passives | 2026-07-22 | Inspiration 1 energy/s × 30s @ 15m; Nekros +5 Health per death within 10m |
| Nova + Ivara passives | 2026-07-22 | Nova 15% Health/Energy orb on slow/sped kills; Ivara 50m radar (+ extras) |
| Nezha + Mirage passives | 2026-07-22 | Nezha +60% slide speed / +35% distance; Mirage +85% slide dur / +50% maneuvers |
| Loki + Lavos passives | 2026-07-22 | Loki wall latch 60s (×10); Lavos Valence Block 10s status immunity / 5s orb CD |
| Khora + Oberon passives | 2026-07-22 | Venari +15% move speed / 45s respawn; Righteous Negation cap 3 (0.25s / 0.5s final invuln) |
| Jade + Temple passives | 2026-07-22 | Judgments +50% vuln / 10s + 2 Aura slots; Backbeat +50% Ability Efficiency on beat |
| Oraxia + Rhino passives | 2026-07-22 | Predator's Lurk 8s wall-latch invis; Rhino hard-landing 100 Impact / 6m (90% edge falloff) |
| Gara + Limbo passives | 2026-07-22 | Gara blind 15%+20%/miss / 10s / 12m; Limbo Rift +10 Energy/kill + 2 Energy/s |
| Mag + Koumei passives | 2026-07-22 | Mag 8m pickup vacuum; Koumei Fate random status 60s every 60s |
| Banshee + Atlas passives | 2026-07-22 | Banshee all weapons silent; Atlas knockdown immune while grounded |
| Nyx + Harrow passives | 2026-07-22 | Nyx +40% gun CC/Confused (cap +200%); Harrow overshield ×2 (2400) + start max Energy |
| Gyre + Citrine passives | 2026-07-22 | Gyre +10% ability CC/Electric (tiers/cap 300%); Citrine Geoluminesence 5→25 HP/s @ 50m |
| Chroma + Titania + Hildryn passives | 2026-07-22 | Chroma extra jump + element cycle; Titania +25% parkour / Upsurge 4HP/s 20s 15m; Hildryn 3.5s gate |

## New / extended test files

- `src/lib/calc/warframe-math-audit.test.ts` — Phase 1 bare-weapon block
- `src/lib/calc/gun-mod-audit.test.ts`
- `src/lib/calc/melee-mod-audit.test.ts`
- `src/lib/calc/warframe-mod-audit.test.ts`
- `src/lib/calc/conditional-stack-audit.test.ts`
- `src/lib/calc/phase5-9-audit.test.ts`
- `src/lib/calc/set-bonus-audit.test.ts` — Augur/Hunter/Mecha + damageBuff gating
- `src/lib/calc/ttk-discrete.test.ts` — shield overflow case
