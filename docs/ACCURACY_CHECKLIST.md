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
| B5 | Ability scaling sparse | … + Nezha + **Voruna/Nekros kits** (Helminth→Lycath) | **Improved** — Contagion kill-AoE; Probe EFF→CDR + Bloodletting EFF→energy + Shadows decay inverse-DUR unmodeled |
| B6 | Arcane custom handlers | Kinship + Hot Shot stack→DPS; Merciless | **Improved** |
| B7 | Galv / CO / BR / WW | paper vs stacks | **Locked** Phase 3 |
| B8 | Incarnon + radials | … + Mk1-Furis/Kunai forms + Kunai Genesis + **Vasto Prime Deathtrap +0.8× CM** | **Improved** — Contagion kill-AoE DPS still out; utility Genesis remain |

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
| Contagion Cloud panel | 2026-07-21 | R3 300/s×STR, 5m×RNG, 12s×DUR on Toxic Lash miscStats; mod stats absolutes; kill-AoE DPS still out |
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
| B5 Lavos kit | 2026-07-21 | Bite 1000/10m/8s CD +15% heal×STR; Vial 250/s 30m/8s/5s CD; Probe 250/s 6m/10s CD; Catalyze 2000/25m/30s CD |
| B5 Kullervo kit | 2026-07-21 | WA +200% flat final melee CC×STR (Helminth +100%/12.5m); Recompense 500/8m; Curse 50% redirect; Ukko 2500/s/10m/15s |
| B5 Sevagoth kit | 2026-07-21 | Reap 250 Rad/8m +50% vuln; Sow 50/250 True DPS; Gloom 50+0.75/s slow/lifesteal×STR; Shadow Death Well 75%/1%/s |
| B5 Dagath kit | 2026-07-21 | Wyrd 500/1000 Viral +35% slow; Doom 500/15m; Grave +50% CD×STR; Cavalry 30k/strip; Helminth→Wyrd (was Doom) |
| B5 Caliban kit | 2026-07-21 | Gyre 500 Tau/s; Wrath 2000/+35% vuln; Progeny 50/45s; Fusion 15k/s +50% strip; Helminth Wrath filled |
| B5 Baruuk kit | 2026-07-21 | Elude 25+2.5/s 180°; Lull 50/20s/25m; Hands 250 Blast/8 daggers×STR; Storm 250 +25% DR (cap 40%) |
| B5 Harrow kit | 2026-07-21 | Condemn 150 shields/enemy; Penance +35% FR/+70% reload×STR; Thurible 15% convert; Covenant 5%+1.5%/100 CC |
| B5 Garuda kit | 2026-07-21 | Mirror 2× capture/20s/30m; Altar 25%/s heal; Bloodletting 40% energy (EFF unmodeled); Talons 300/75% SC |
| B5 Nezha kit | 2026-07-21 | Walker 200 Heat/s +1250 blast; Chakram 250/+100% vuln; Halo 1000 HP/125 Slash; Spears 600/19m/12s |
| B5 Styanax Helminth | 2026-07-21 | Helminth→Tharros Strike (was wrongly Rally Point); native Tharros 1000 Impact / 50% strip / 100 heal |
| B5 Voruna kit | 2026-07-21 | Shroud flat melee CD×STR buff; Helminth→Lycath's Hunt 50% orbs (was wrongly Shroud); Ulfrun kill CD numeric |
| B5 Nekros kit | 2026-07-21 | Soul Punch mark/threshold; Desecrate 25m/60% orb; Shadows +150% dmg/+100% HP/SP; Helminth Terrify 75 |

## New / extended test files

- `src/lib/calc/warframe-math-audit.test.ts` — Phase 1 bare-weapon block
- `src/lib/calc/gun-mod-audit.test.ts`
- `src/lib/calc/melee-mod-audit.test.ts`
- `src/lib/calc/warframe-mod-audit.test.ts`
- `src/lib/calc/conditional-stack-audit.test.ts`
- `src/lib/calc/phase5-9-audit.test.ts`
- `src/lib/calc/set-bonus-audit.test.ts` — Augur/Hunter/Mecha + damageBuff gating
- `src/lib/calc/ttk-discrete.test.ts` — shield overflow case
