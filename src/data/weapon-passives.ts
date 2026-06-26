/**
 * Weapon passive descriptions (codex-style), merged onto weapons in use-data.
 *
 * Primary source: https://wiki.warframe.com/w/Passives/Weapon
 * Kuva/Tenet/Coda: progenitor bonus (25–60% extra element) is universal; entries below add
 * variant-specific mechanics from the wiki or in-game behavior where documented.
 */

const PROGENITOR_LINE =
  "Progenitor bonus: extra elemental damage (typically 25–60% of base damage; set element and % in the builder).";

/** Kuva / Tenet / Coda — always include progenitor; add unique mechanics where known. */
const KUVA_TENET_CODA: Record<string, string> = {
  kuva_kohm: `${PROGENITOR_LINE} Fires pellets with increasing fire rate the longer the trigger is held.`,
  tenet_envoy: `${PROGENITOR_LINE} Manual reload throws a ricocheting disk that damages enemies.`,
  tenet_arca_plasmor: `${PROGENITOR_LINE} Pellets narrow into a tighter beam when aimed.`,
  tenet_ferrox: PROGENITOR_LINE,
  tenet_glaxion: `${PROGENITOR_LINE} Beam chains to additional enemies while the beam is active on a target.`,
  kuva_tonkor: `${PROGENITOR_LINE} Fires sticky grenades that detonate after a short delay.`,
  kuva_zarr: `${PROGENITOR_LINE} Alt-fire switches between cannon barrage and shotgun-style volley.`,
  coda_hema: `${PROGENITOR_LINE} Headshots restore health equal to 10% of damage dealt; reloading drains 3% of max health.`,
  coda_synapse: `${PROGENITOR_LINE} Deals +20% bonus damage on headshots.`,
  tenet_flux_rifle: PROGENITOR_LINE,
  tenet_tetra: PROGENITOR_LINE,
  coda_bassocyst: PROGENITOR_LINE,
  kuva_drakgoon: `${PROGENITOR_LINE} Flak barrage; alt-fire tightens spread.`,
  kuva_sobek: PROGENITOR_LINE,
  coda_sporothrix: PROGENITOR_LINE,
  kuva_bramma: `${PROGENITOR_LINE} Arrows embed then explode; explosion chains from surfaces and enemies.`,
  kuva_chakkhurr: `${PROGENITOR_LINE} Deals +50% bonus damage on headshots.`,
  kuva_hek: PROGENITOR_LINE,
  kuva_hind: PROGENITOR_LINE,
  kuva_karak: PROGENITOR_LINE,
  kuva_ogris: PROGENITOR_LINE,
  kuva_quartakk: `${PROGENITOR_LINE} Burst-fire; alt-fire toggles semi-auto.`,
  kuva_ghoulsaw: `${PROGENITOR_LINE} Faster attack cadence than the standard Ghoulsaw; Kuva Lich riders use a saw charge.`,
  tenet_quanta: `${PROGENITOR_LINE} Alt-fire launches explosive cubes; beam fire benefits from innate multishot.`,
  coda_bubonico: `${PROGENITOR_LINE} Larger magazine; primary fire rate ramps with sustained fire.`,
  coda_catabolyst: PROGENITOR_LINE,
  coda_pox: PROGENITOR_LINE,
  coda_tysis: PROGENITOR_LINE,
  kuva_brakk: PROGENITOR_LINE,
  kuva_kraken: PROGENITOR_LINE,
  kuva_nukor: `${PROGENITOR_LINE} Beam chains to nearby enemies within range.`,
  kuva_seer: PROGENITOR_LINE,
  kuva_twin_stubbas: PROGENITOR_LINE,
  tenet_cycron: PROGENITOR_LINE,
  tenet_detron: PROGENITOR_LINE,
  tenet_diplos: `${PROGENITOR_LINE} Lock-on burst alt-fire when aimed.`,
  tenet_plinx: PROGENITOR_LINE,
  tenet_spirex: PROGENITOR_LINE,
  coda_caustacyst: `${PROGENITOR_LINE} Heavy attacks release a toxic stream up to 20m with a ground trail; enemies hit can be finished.`,
  coda_hirudo: `${PROGENITOR_LINE} Critical hits grant 5% lifesteal and stacking max health (up to 5 stacks). Heavy attack kills grant Harmonic Resonance (+30% status duration for allies in Affinity Range, 30s).`,
  coda_mire: `${PROGENITOR_LINE} Slam attacks have a forced Corrosive status.`,
  coda_motovore: `${PROGENITOR_LINE} +Impact, +Puncture, and +Slash mods have 6× listed potency on this weapon. Highest physical mod type grants a bonus effect (Attack Speed, Range, or Status Chance).`,
  coda_pathocyst: `${PROGENITOR_LINE} Attacks and throws spawn maggots that seek and damage nearby enemies.`,
  kuva_shildeg: `${PROGENITOR_LINE} Heavy slam-focused melee with a unique slam profile.`,
  tenet_agendus: PROGENITOR_LINE,
  tenet_exec: PROGENITOR_LINE,
  tenet_grigori: `${PROGENITOR_LINE} Heavy slide attack releases a spinning energy disk (up to ~10m, ricochets, punch-through on bodies).`,
  tenet_livia: `${PROGENITOR_LINE} Blocking attacks has a 20% chance to add +5° block angle, stacking up to 5 times (permanent).`,
  kuva_ayanga: `${PROGENITOR_LINE} Alt-fire launches grenades in an arc.`,
  kuva_grattler: `${PROGENITOR_LINE} Archgun; alt-fire sticky grenades detonate for area damage.`,
};

/**
 * Passives from https://wiki.warframe.com/w/Passives/Weapon (and primes/variants sharing behavior).
 * Keys must match `id` in weapons.ts.
 */
const WIKI_PASSIVES: Record<string, string> = {
  // Primary
  acceltra: "Reloads 25% faster while sprinting.",
  attica: "On kill, bodies follow the bolt, damaging enemies along the path and pinning corpses to walls.",
  ax_52: "Hip-fire: +60% ammo efficiency. Aimed: headshots gain +400% critical chance.",
  basmu: "Emptying the magazine emits three 10m pulses (True damage); each pulse heals you for 10× damage dealt to enemies per pulse.",
  cedo: "Deals +60% additive damage for each distinct status effect on the target (additive with multiple procs).",
  cernos_prime: "Deals +50% bonus damage on headshots.",
  hema: "Headshots restore health equal to 10% of damage dealt. Reloading drains 3% of max health.",
  lenz: "Innate Arrow Mutation: non Sniper/Bow ammo packs convert to 1 round each.",
  perigale: "4 headshots in a burst or a headshot kill grants Gale Force: +100% ammo efficiency for 4s (refreshable).",
  perigale_prime: "4 headshots in a burst or a headshot kill grants Gale Force: +100% ammo efficiency for 4s (refreshable).",
  shedu: "Emptying the magazine emits a 20m pulse that staggers with guaranteed Impact and strips Sentient / Shadow Stalker adaptations. +30% movement speed while aiming.",
  stahlta: "Primary fire has an independent extra chance to proc Radiation (separate from normal status chance).",
  synapse: "Deals +20% bonus damage on headshots.",
  haalvu:
    "Alt-fire splits the weapon into 8 rifles, tracking up to 4 targets at once while consuming more ammo per shot.",
  fulmin: "Silent semi-auto; full-auto emits a close-range shockwave.",
  phenmor: "Alternate fire charges a gauge that empowers primary fire.",
  laetum: "Alternate fire charges shots that build Overcharge for explosive rounds.",

  // Secondary
  akarius: "Reloads 50% faster while sprinting.",
  arca_scisco:
    "Target Analysis: each hit grants +4% critical and status chance, stacking to +20%; decays one stack at a time; 2s duration, refreshable.",
  athodai: "Overdrive on headshot kill: +100% fire rate and unlimited ammo for 8s.",
  athodai_prime: "Overdrive on weakpoint kill: +100% fire rate, -100% recoil, and unlimited ammo for 8s (disables alt-fire).",
  afentis: "Thrown spear impales enemies or creates a Ballistarii Might field (+50% reload, +20% fire/attack speed, +100% reserve ammo, -50% recoil).",
  afentis_prime: "Thrown spear impales enemies or creates a Ballistarii Might field (+50% reload, +20% fire/attack speed, +100% reserve ammo, -50% recoil). Reloads 33% of magazine per second while holstered.",
  ballistica_prime: "Charged shot kills within 50m spawn a scannable 7s ghost of the enemy.",
  dual_toxocyst:
    "Frenzy on headshot (3s): +150% fire rate, +100% additive damage, less recoil, no ammo use while firing.",
  knell: "Death Knell on headshot: stacking crit damage and status chance, unlimited ammo 3s; status bonus 20%/40%/60% by stacks.",
  pyrana_prime:
    "3 kills in 3s summons a second ethereal Pyrana for 6s (larger magazine, +40% fire rate).",
  velox: "First shot of each 5-shot burst costs no ammo. Reloads 50% faster from empty.",
  zhuge_prime: "Reloads 50% faster from an empty magazine.",

  // Melee — wiki Passives/Weapon
  "ack_&_brunt": "Blocking elemental damage stores stacks (up to 4); each stack adds ~17.5% elemental damage.",
  amanata: "Mission start rolls a d6 for a buff; buffs reroll every 30 hits (crit, status, range, attack speed, or all at once).",
  arca_titron: "Kills store charges (up to 5): each adds +200% slam attack damage.",
  "argo_&_vel": "Unique heavy attack throws a glaive projectile that bounces once before returning.",
  arum_spinosa: "Heavy attacks throw toxic spines (70 base damage each).",
  azothane: "Unique block combo releases a 10m shockwave (85 damage, forced Impact).",
  broken_scepter: "Drain corpses to spawn Health or Energy orbs; two orbital orbs limit consecutive drains.",
  caustacyst: "Heavy attacks release a toxic stream (20m) with a ground trail; opens enemies to finishers.",
  corufell: "Heavy attack switches to gunblade mode to fire up to two energy shots.",
  dex_nikana: "Gains combo every 11 hits (instead of 20); max combo multiplier capped at 11× (instead of 12×).",
  dorrclave: "Every 10 kills/assists: Rising Vendetta — next 10 attacks gain +0.5 follow-through and +100% status after mods.",
  dual_viciss: "Inflicting status grants +8% move speed and +7% attack speed for 10s, stacks 5×.",
  dual_zoren_prime: "Airborne slide attack grants movement speed until landing.",
  edun: "Unique heavy throws the weapon (480 physical) then 400 Blast in 5m.",
  ekhein: "Heavy attack grants Heavy Insight 8s: +80% damage, +20% attack speed.",
  gazal_machete: "Bonus damage briefly after consecutive casts of Djinn’s Fatal Attraction.",
  halikar: "Thrown hits can disarm enemies.",
  harmony:
    "Heavy vs enemies with Slash/Heat/Toxin/Elec/Gas procs applies all remaining DoT instantly; removes those procs.",
  heliocor: "Kills scan enemies if a Codex Scanner is equipped.",
  hirudo: "Crits: 5% lifesteal and stacking max health (5 stacks). Heavy kill: Harmonic Resonance (+30% status duration to allies, 30s).",
  korumm: "Unique block combo: slam shockwave with forced status procs and ragdoll follow-up.",
  kronen_prime: "+10% Bullet Jump velocity while equipped.",
  lesion: "On status proc: +15% attack speed and +100% additive damage for 6s.",
  mire: "Slam attacks have a forced Corrosive proc.",
  orvius:
    "Thrown while blocking: homes, suspends target ~5s, then explodes; ticks damage with high status chance.",
  pangolin_sword: "Slam radial damage has a guaranteed Impact proc in addition to other effects.",
  pangolin_prime: "Slam radial damage has a guaranteed Impact proc in addition to other effects.",
  pathocyst: "Attacks and throws spawn maggots that damage nearby enemies.",
  pennant: "Heavy attack kill: +50% attack speed for 2–46s (scales with combo counter).",
  quassus: "Heavy attack throws a spread of ethereal daggers (76 base each).",
  rakta_dark_dagger:
    "Held: −33% enemy detection range. Damaging enemies with Radiation proc restores shields (can overshield).",
  sampotes: "Unique slam sends lines of explosions; heavy slam sends a fan of explosion lines.",
  sancti_magistar:
    "Heavy attack heals allies in 15m; you gain ~20% status resistance while wielded.",
  secura_lecta: "Killed enemies drop bonus credits.",
  sibear: "Heavy attacks: +50% status chance for 4s.",
  "sigma_&_octantis": "Aerial attacks throw the shield 25–30m; hits open enemies to finishers.",
  "silva_&_aegis":
    "Blocking grants +15% additive crit and status to the next attack, stacks to 4.",
  "silva_&_aegis_prime":
    "Blocking grants +15% additive crit and status to the next attack, stacks to 4.",
  skiajati: "Finisher attacks grant 5s invisibility (broken by attacks/abilities; refreshable).",
  slaytra: "Innate +100% Slash proc duration.",
  enkaus: "Ink-stained enemies below 35% health are dissolved on hit. Alt-fire stains enemies with ink; Follie's Inkblot counts as stained.",
  war: "Every hit on enemies that are not ragdolled procs an Impact status effect.",
  war_prime: "Every hit on enemies that are not ragdolled procs an Impact status effect.",
  scyotid: "Thrown darts apply Toxin; kills can spread Toxin stacks to nearby enemies.",
  spinnerex: "Enemies hit then killed may explode per Toxin stack, spreading Toxin.",
  syam: "Unique heavy attacks fire long-range piercing Heat shockwaves (scales with mods and combo).",
  synoid_heliocor:
    "Heavy attack kills spawn a specter of the enemy for 30s (requires full Codex scans). Kills scan enemies when a Codex Scanner is equipped.",
  "tak_&_lug": "Heavy attack throws the shield ~15m with multi-hit explosions before return.",
  tatsu: "On kill, stores up to 5 charges; slide attack releases seeking stunning projectiles.",
  telos_boltace:
    "Slide attack: 14m pull vortex; second slide ends vortex with ragdoll blast. +20% Bullet Jump, Wall Latch, Aim Glide.",
  tonkkatt: "Increasing combo multiplier grants +4% damage for 15s, stacks up to 30× (refresh per stack).",
  vaykor_sydon: "After 15 blocked hits: radial blind (15m, 5s blind). +50% resist knockback/knockdown while blocking.",
  venato_prime: "Applying a status has 100% chance to also proc Slash.",
  venka_prime: "Can reach 13.0× melee combo multiplier after 240 hits.",
  verdilac: "Unique block combo fires up to three 2m-wide Toxin projectiles (30% CC, 2.5× CD).",
  wolf_sledge:
    "Hold melee to throw like a glaive (40m); bounces off enemies; recall anytime.",
  xoris: "Infinite melee combo duration.",
};

/** Wiki passives override same `id` last; Kuva/Tenet/Coda uniques live in `KUVA_TENET_CODA` (do not duplicate tenet_grigori / tenet_livia here). */
export const WEAPON_PASSIVES: Record<string, string> = {
  ...KUVA_TENET_CODA,
  ...WIKI_PASSIVES,
};
