/**
 * Verified ability stat scaling rules.
 *
 * Each entry is confirmed against https://wiki.warframe.com ability pages
 * (see `scripts/verify-ability-scaling.py` to re-fetch wikitext).
 *
 * Only stats listed here are scaled with the build. Everything else shows
 * base values until verified for that specific ability.
 *
 * Keys use `warframeFamily::Ability Name` where warframeFamily strips `_prime`.
 */

export type AbilityScaleAttribute = "strength" | "duration" | "range";

export interface VerifiedStatScaling {
  scale: AbilityScaleAttribute;
  /** Hard cap after scaling, as a fraction (1 = 100%). */
  cap?: number;
  /** Read `drCap` from the ability's miscStats for this stat. */
  useSiblingDrCap?: boolean;
  /** Read `slowCap` from miscStats (percent or fraction). */
  useSiblingSlowCap?: boolean;
}

export type VerifiedAbilityFields = Partial<
  Record<"damageReduction" | "damageBuff", VerifiedStatScaling>
>;

type MiscScalingTable = Record<string, VerifiedStatScaling>;

function familyId(warframeId: string): string {
  return warframeId.replace(/_prime$/, "");
}

function abilityKey(warframeId: string, abilityName: string): string {
  return `${familyId(warframeId)}::${abilityName}`;
}

/**
 * Misc stat scaling keyed by `warframeFamily::Ability Name` → stat key.
 *
 * Wiki sources (verified 2026-07-01):
 * - Sirius & Orion: wiki.warframe.com/w/Sirius_&_Orion/Abilities
 * - Other frames: individual ability pages on wiki.warframe.com
 */
const VERIFIED_MISC_SCALING: Record<string, MiscScalingTable> = {
  // wiki: Gravitic Slash — strip scales STR (cap 100%); arc is fixed 67.5°
  "sirius_orion::Gravitic Slash": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
  },
  // wiki: Astral Shell — decoy duration/damage/radius scale DUR/STR/RNG
  "sirius_orion::Astral Shell": {
    decoyDuration: { scale: "duration" },
    decoyDamage: { scale: "strength" },
    decoyRadius: { scale: "range" },
  },
  // wiki: Light's Sanctuary — DR scales STR; cap 75% (drCap in miscStats)
  "sirius_orion::Light's Sanctuary": {
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
    healthRegen: { scale: "strength" },
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Event Horizon — explosion radius scales RNG
  "sirius_orion::Event Horizon": {
    explosionRadius: { scale: "range" },
  },

  // wiki: Plein Air — defense reduction STR; splash radius RNG
  "follie::Plein Air": {
    defenseReduction: { scale: "strength", cap: 1 },
    splashRadius: { scale: "range" },
  },

  // wiki: Peacemaker — innate damage bonus scales STR
  "mesa::Peacemaker": {
    damageBonus: { scale: "strength" },
  },

  // wiki: Virulence — length scales RNG; width is fixed 4 m (not listed)

  // wiki: Larva — Mutation stack chance × STR (100% at 200% STR)
  "nidus::Larva": {
    mutationStackChance: { scale: "strength", cap: 1 },
  },
  // wiki: Parasitic Link
  "nidus::Parasitic Link": {
    strengthBonus: { scale: "strength" },
    enemyLinkRange: { scale: "range" },
  },
  // wiki: Ravenous — regen STR, explosion RNG; maggot count fixed at 9
  "nidus::Ravenous": {
    healthRegen: { scale: "strength" },
    explosionRadius: { scale: "range" },
  },

  // wiki: Psychic Bolts — max-rank 80% defense strip × STR, cap 100% at 125% STR
  "nyx::Psychic Bolts": {
    defenseStrip: { scale: "strength", cap: 1 },
  },

  // wiki: Iron Skin — armor multiplier in overguard formula scales STR
  "rhino::Iron Skin": {
    armorMultiplier: { scale: "strength" },
  },

  // wiki: Molt — movement speed buff scales STR
  "saryn::Molt": {
    speedBuff: { scale: "strength", cap: 1 },
  },
  // wiki: Spores — damage growth per infected enemy scales STR
  "saryn::Spores": {
    damageGrowth: { scale: "strength" },
  },
  // wiki: Toxic Lash — Extra Hit % scales STR (cap 100%)
  // Contagion Cloud augment (max-rank base): DPS×STR, range×RNG, duration×DUR;
  // kill-uptime cloud DPS is not folded into weapon sustained.
  "saryn::Toxic Lash": {
    gunDamage: { scale: "strength", cap: 1 },
    meleeDamage: { scale: "strength", cap: 1 },
    contagionCloudDps: { scale: "strength" },
    contagionCloudRange: { scale: "range" },
    contagionCloudDuration: { scale: "duration" },
  },
  // wiki: Nourish — Viral weapon bonus scales STR (Helminth base 45%)
  "grendel::Nourish": {
    viralDamageBonus: { scale: "strength" },
  },
  "helminth::Nourish": {
    viralDamageBonus: { scale: "strength" },
  },
  // wiki: Xata's Whisper — Void Extra Hit % scales STR
  "xaku::Xata's Whisper": {
    voidDamageBonus: { scale: "strength" },
  },
  "helminth::Xata's Whisper": {
    voidDamageBonus: { scale: "strength" },
  },
  // wiki: Elemental Ward — element bonuses × STR; toxin reload × DUR; aura × RNG
  // Heat burn / toxin poison radii are Misc-fixed 5 m (not registered).
  "chroma::Elemental Ward": {
    auraRadius: { scale: "range" },
    heatHealthBonus: { scale: "strength" },
    heatDps: { scale: "strength" },
    electricShieldBonus: { scale: "strength" },
    electricReflectMult: { scale: "strength" },
    toxinReloadBonus: { scale: "duration" },
    toxinHolsterDamage: { scale: "strength" },
    toxinProcChance: { scale: "strength" },
    coldArmorBonus: { scale: "strength" },
    coldReflectMult: { scale: "strength" },
  },
  "helminth::Elemental Ward": {
    auraRadius: { scale: "range" },
    heatHealthBonus: { scale: "strength" },
    heatDps: { scale: "strength" },
    electricShieldBonus: { scale: "strength" },
    electricReflectMult: { scale: "strength" },
    toxinReloadBonus: { scale: "duration" },
    toxinHolsterDamage: { scale: "strength" },
    toxinProcChance: { scale: "strength" },
    coldArmorBonus: { scale: "strength" },
    coldReflectMult: { scale: "strength" },
  },
  // wiki: Vex Armor — aura × RNG; Scorn/Fury max × STR
  "chroma::Vex Armor": {
    auraRadius: { scale: "range" },
    scornMax: { scale: "strength" },
    furyMax: { scale: "strength" },
  },

  // wiki: Tharros Strike — Impact via damage; 50% defense strip × STR (full at 200%); heal × STR
  "styanax::Tharros Strike": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
    healthPerHit: { scale: "strength" },
  },
  "helminth::Tharros Strike": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
    healthPerHit: { scale: "strength" },
  },
  // wiki: Pillage — 25% shield/armor drain scales STR (full strip at 400% STR)
  "hildryn::Pillage": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
  },
  "helminth::Pillage": {
    shieldStrip: { scale: "strength", cap: 1 },
    armorStrip: { scale: "strength", cap: 1 },
  },
  // wiki: Terrify — 60% armor strip + enemy count scale STR (full strip ~167% STR)
  "nekros::Terrify": {
    armorStrip: { scale: "strength", cap: 1 },
    affectedEnemies: { scale: "strength" },
  },
  "helminth::Terrify": {
    armorStrip: { scale: "strength", cap: 1 },
    affectedEnemies: { scale: "strength" },
  },
  // wiki: Rally Point — energy regen and shields/kill scale STR
  "styanax::Rally Point": {
    energyRegen: { scale: "strength" },
    shieldsPerKill: { scale: "strength" },
  },
  // wiki: Final Stand — javelin count scales DUR (not STR); ~50% status unverified
  "styanax::Final Stand": {
    javelins: { scale: "duration" },
  },

  // wiki: Speed — reload buff scales STR; movement buff scales STR (ally move cap is separate)
  "volt::Speed": {
    speedBuff: { scale: "strength", cap: 1 },
    reloadBuff: { scale: "strength", cap: 1 },
  },
  // wiki: Electric Shield — +50% Electricity / +100% crit damage are FIXED
  // (Strength N/A). Intentionally omitted from VERIFIED_MISC_SCALING so the
  // panel shows base values; weapon DPS applies them via weapon-external-buffs.

  // wiki: Cloud Walker
  "wukong::Cloud Walker": {
    stunRadius: { scale: "range" },
    healPerMeter: { scale: "strength" },
  },
  // wiki: Celestial Twin — health mult scales STR; 0.5× / 3× damage mults are FIXED
  "wukong::Celestial Twin": {
    healthMultiplier: { scale: "strength" },
  },
  // wiki: Defy — damage/armor multipliers scale STR; armor bonus cap 1500 is fixed
  "wukong::Defy": {
    armorDuration: { scale: "duration" },
    damageMultiplier: { scale: "strength" },
  },

  // wiki: Gloom — slow/lifesteal × STR (slow cap 95%); radii × RNG; range growth × DUR
  "sevagoth::Gloom": {
    slowPercent: { scale: "strength", useSiblingSlowCap: true },
    lifeStealPercent: { scale: "strength" },
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
    rangeGrowthPerSecond: { scale: "duration" },
  },
  "helminth::Gloom": {
    slowPercent: { scale: "strength", useSiblingSlowCap: true },
    lifeStealPercent: { scale: "strength" },
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
    rangeGrowthPerSecond: { scale: "duration" },
  },

  // wiki: Breach Surge — spark damage multiplier scales STR (not a weapon damageBuff)
  "wisp::Breach Surge": {
    sparkDamageMultiplier: { scale: "strength" },
  },
  "helminth::Breach Surge": {
    sparkDamageMultiplier: { scale: "strength" },
  },

  // wiki: Voruna — Shroud of Dynar
  // Strength → flat melee CD only; Duration → buff extension.
  // Move speed / status / +100% CC are Misc (ability-rank), not STR-scaled.
  "voruna::Shroud Of Dynar": {
    durationExtension: { scale: "duration" },
    critDamageBonus: { scale: "strength" },
  },
  // wiki: Voruna — Lycath's Hunt; Helminth orb chances reduced to 50%
  "voruna::Lycath's Hunt": {
    durationExtension: { scale: "duration" },
  },
  "helminth::Lycath's Hunt": {
    durationExtension: { scale: "duration" },
  },
  // Ulfrun's Descent: move speed / kill bonuses Misc — Slash dmg via ability.damage / DPS

  // wiki: Citrine — Fractured Blast (orb drop chances scale STR)
  "citrine::Fractured Blast": {
    healthOrbChance: { scale: "strength" },
    energyOrbChance: { scale: "strength" },
  },
  // wiki: Citrine — Preserving Shell (per-kill/assist DR scales STR)
  "citrine::Preserving Shell": {
    drPerKill: { scale: "strength" },
    drPerAssist: { scale: "strength" },
    minDamageReduction: { scale: "strength" },
  },
  // wiki: Citrine — Prismatic Gem (status buffs scale STR/DUR; aurora is ability.radius × RNG;
  // placementDistance 5 m is Misc-fixed — intentionally omitted)
  "citrine::Prismatic Gem": {
    statusChanceBonus: { scale: "strength" },
    statusDurationBonus: { scale: "duration" },
  },

  // wiki: Immolation — initial DR × STR (cap 50%); max-heat DR is the ability.damageReduction field
  // (heat interpolation between initial/max is not modeled on the panel)
  "ember::Immolation": {
    initialDamageReduction: { scale: "strength", cap: 0.5 },
  },

  // wiki: Fire Blast — armor strip × STR at max Immolation heat (cap 100%; heat lerp unmodeled)
  "ember::Fire Blast": {
    armorStrip: { scale: "strength", cap: 1 },
  },

  // wiki: Ophanim Eyes — Heat/strip × STR; slow %/s is Misc (ability-rank); cone/ticks fixed
  "jade::Ophanim Eyes": {
    armorStripPerSecond: { scale: "strength" },
    shieldStripPerSecond: { scale: "strength" },
  },
  "helminth::Ophanim Eyes": {
    armorStripPerSecond: { scale: "strength" },
    shieldStripPerSecond: { scale: "strength" },
  },

  // wiki: Symphony of Mercy — Power of The Seven STR bonus × STR (cap 150%); shield regen × STR
  "jade::Symphony Of Mercy": {
    strengthBonus: { scale: "strength", cap: 1.5 },
    shieldRegen: { scale: "strength" },
    shieldRechargeDelayReduction: { scale: "strength", cap: 0.8 },
  },

  // wiki: Light's Judgment — heal %/s × STR; well count / Judgment vuln / tick are Misc-fixed
  "jade::Light's Judgment": {
    healthRegen: { scale: "strength" },
  },

  // wiki: Glory on High — alt explosion × RNG; drain / Judgment chance / +100% move Misc-fixed
  "jade::Glory On High": {
    altFireExplosion: { scale: "range" },
  },

  // wiki: Thermal Sunder — radii × RNG; Cold/Heat damage use ability.damage / aoeDamage (× STR)
  "gauss::Thermal Sunder": {
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
  },
  "helminth::Thermal Sunder": {
    minRadius: { scale: "range" },
    maxRadius: { scale: "range" },
    heatDamage: { scale: "strength" },
  },

  // wiki: Kinetic Plating — empty-battery DR floor × STR (cap 50%); full-battery DR is field
  "gauss::Kinetic Plating": {
    minDamageReduction: { scale: "strength", cap: 0.5 },
  },

  // wiki: Redline — speed buffs scale with Duration (battery-max values); projectile dmg × STR via damage
  "gauss::Redline": {
    fireRateBuff: { scale: "duration" },
    attackSpeedBuff: { scale: "duration" },
    reloadBuff: { scale: "duration" },
    castSpeedBuff: { scale: "duration" },
  },

  // wiki: Arcsphere — field DPS × STR; field radius × RNG; sphere cap / multi-hit mult Misc-fixed
  "gyre::Arcsphere": {
    fieldDamagePerSecond: { scale: "strength" },
    fieldRadius: { scale: "range" },
  },

  // wiki: Coil Horizon — contact DPS × STR; lifetimes Misc-fixed (implosion damage via ability.damage)
  "gyre::Coil Horizon": {
    contactDamagePerSecond: { scale: "strength" },
  },
  "helminth::Coil Horizon": {
    contactDamagePerSecond: { scale: "strength" },
  },

  // wiki: Cathode Grace — weapon/ability CC + energy regen × STR; kill extend / caps Misc-fixed
  "gyre::Cathode Grace": {
    criticalChanceBonus: { scale: "strength" },
    abilityCritChance: { scale: "strength" },
    energyRegen: { scale: "strength" },
  },

  // wiki: Rotorswell — discharge dmg × STR; discharge range × RNG; move mult / limits Misc-fixed
  "gyre::Rotorswell": {
    dischargeDamage: { scale: "strength" },
    dischargeRange: { scale: "range" },
  },

  // wiki: Grenade Fan — shield restore / SPS × STR; grenade counts / gate ext Misc-fixed (Slash DPS via damage)
  "protea::Grenade Fan": {
    shieldRestore: { scale: "strength" },
    shieldsPerSecond: { scale: "strength" },
  },

  // wiki: Blaze Artillery — splash × RNG; shots/arc/turret cap / +100% per hit Misc-fixed (shot dmg via damage)
  "protea::Blaze Artillery": {
    splashRadius: { scale: "range" },
  },

  // wiki: Dispensary — extra pickup chance × STR; spawn interval / orb HP / cache cap Misc-fixed
  "protea::Dispensary": {
    extraPickupChance: { scale: "strength" },
  },
  "helminth::Dispensary": {
    extraPickupChance: { scale: "strength" },
  },

  // wiki: Temporal Anchor — recorded damage conversion × STR; invuln / rewind / lethal heal Misc-fixed
  "protea::Temporal Anchor": {
    damageConversion: { scale: "strength" },
  },

  // wiki: Noctua — alt-fire dmg × STR; fragment seek distance × RNG; fragment count / angle Misc-fixed
  "dante::Noctua": {
    altFireDamage: { scale: "strength" },
    seekDistance: { scale: "range" },
  },

  // wiki: Light Verse — Overguard gain/cap + heal% × STR; invuln Misc-fixed
  "dante::Light Verse": {
    overguardGain: { scale: "strength" },
    overguardCap: { scale: "strength" },
    healthHealPercent: { scale: "strength" },
  },

  // wiki: Final Verse — Triumph OG / Tragedy detonate / Pageflight dmg+vuln × STR; Wordwarden copy% × STR; vuln dur × DUR
  "dante::Final Verse": {
    overguardGain: { scale: "strength" },
    overguardCap: { scale: "strength" },
    overguardRegenPerSecond: { scale: "strength" },
    statusDetonationMultiplier: { scale: "strength" },
    damageCopied: { scale: "strength" },
    pageflightDamage: { scale: "strength" },
    statusChanceVulnerability: { scale: "strength" },
    statusDamageIncrease: { scale: "strength" },
    statusVulnerabilityDuration: { scale: "duration" },
    paragrimmAttackRange: { scale: "range" },
  },

  // wiki: Chyrinka Pillar — pulse dmg via ability.damage; slow / intervals / pillar caps Misc-fixed
  "qorvex::Chyrinka Pillar": {
    empoweredDuration: { scale: "duration" },
  },
  "helminth::Chyrinka Pillar": {
    empoweredDuration: { scale: "duration" },
  },

  // wiki: Containment Wall — tick Radiation + vulnerability × STR; assembly Misc-fixed (smash via damage)
  "qorvex::Containment Wall": {
    radiationDamagePerTick: { scale: "strength" },
    damageVulnerability: { scale: "strength" },
  },

  // wiki: Disometric Guard — cast explosion via damage; initial/max stacks × STR; cast radius / chance Misc-fixed
  "qorvex::Disometric Guard": {
    initialStatusStacks: { scale: "strength" },
    maxStatusStacks: { scale: "strength" },
  },

  // wiki: Crucible Blast — beam DPS via damage; explosion base/per-status × STR; beam cylinder Misc-fixed
  "qorvex::Crucible Blast": {
    explosionDamage: { scale: "strength" },
    explosionDamagePerStatus: { scale: "strength" },
  },

  // wiki: Ophidian Bite — heal conversion × STR; cone Misc-fixed (Toxin dmg via damage)
  "lavos::Ophidian Bite": {
    healthConversion: { scale: "strength" },
  },

  // wiki: Vial Rush — vial count × RNG; residue radius / charge speed Misc-fixed (DPS via damage, residue via duration)
  "lavos::Vial Rush": {
    vialCharges: { scale: "range" },
  },
  "helminth::Vial Rush": {
    vialCharges: { scale: "range" },
  },

  // wiki: Transmutation Probe — CDR listed under Efficiency (panel EFF scale not wired); probe lifetime Misc-fixed
  // wiki: Catalyze — probe speed × RNG; gel mist / probe count / +100% per status Misc-fixed
  "lavos::Catalyze": {
    probeSpeed: { scale: "range" },
  },

  // wiki: Wrathful Advance — flat final melee CC × STR; 1s CD Misc-fixed
  "kullervo::Wrathful Advance": {
    criticalChanceBonus: { scale: "strength" },
  },
  "helminth::Wrathful Advance": {
    criticalChanceBonus: { scale: "strength" },
  },

  // wiki: Recompense — heal/OG per hit + miss drain × STR; dagger counts / airtime Misc-fixed (dmg via damage)
  "kullervo::Recompense": {
    healthPerHit: { scale: "strength" },
    missDrain: { scale: "strength" },
    overguardCap: { scale: "strength" },
  },

  // wiki: Collective Curse — damage redirection × STR (cap 100%); cone Misc-fixed
  "kullervo::Collective Curse": {
    damageRedirection: { scale: "strength", cap: 1 },
  },

  // wiki: Storm of Ukko — Slash DPS via ability.damage; storm limit / tick rate Misc-fixed

  // wiki: Reap — damage vulnerability × STR; debuff duration × DUR; Death Well / radial Misc-fixed
  "sevagoth::Reap": {
    damageVulnerability: { scale: "strength" },
    debuffDuration: { scale: "duration" },
  },

  // wiki: Sow — True DPS via damage; Death Well / radial Misc-fixed
  // wiki: Exalted Shadow — Death Well threshold/drain / invuln Misc-fixed (claw dmg via damage)

  // wiki: Wyrd Scythes — slow × STR (cap 95%); throw dmg × STR; sickle counts Misc-fixed
  "dagath::Wyrd Scythes": {
    slowPercent: { scale: "strength", useSiblingSlowCap: true },
    throwDamage: { scale: "strength" },
  },
  "helminth::Wyrd Scythes": {
    slowPercent: { scale: "strength", useSiblingSlowCap: true },
    throwDamage: { scale: "strength" },
  },

  // wiki: Doom — Viral via damage; Phantom Wrath 35% / cone Misc-fixed

  // wiki: Grave Spirit — CD bonus × STR (Doom doubled); invuln time via duration; CD Misc-fixed
  "dagath::Grave Spirit": {
    critDamageBonus: { scale: "strength" },
    doomCritDamageBonus: { scale: "strength" },
  },

  // wiki: Rakhali's Cavalry — Viral via damage; Doom strip × STR; Kaithe counts Misc-fixed
  "dagath::Rakhali's Cavalry": {
    defenseReduction: { scale: "strength" },
  },

  // wiki: Razor Gyre — Tau DPS via damage; Wrath-raised DPS + heal × STR; dash Misc-fixed
  "caliban::Razor Gyre": {
    wrathDamagePerSecond: { scale: "strength" },
    healthPerHit: { scale: "strength" },
  },

  // wiki: Sentient Wrath — Tau via damage; vulnerability × STR
  "caliban::Sentient Wrath": {
    damageVulnerability: { scale: "strength" },
  },
  "helminth::Sentient Wrath": {
    damageVulnerability: { scale: "strength" },
  },

  // wiki: Lethal Progeny — shield restore / dmg & health mult × STR; summon caps Misc-fixed
  "caliban::Lethal Progeny": {
    shieldRestorePerSecond: { scale: "strength" },
    damageMultiplier: { scale: "strength" },
    healthMultiplier: { scale: "strength" },
  },

  // wiki: Fusion Strike — laser via damage; detonation/explosion × STR; strip × STR (cap 100%)
  "caliban::Fusion Strike": {
    detonationDamage: { scale: "strength" },
    explosionDamage: { scale: "strength" },
    armorStrip: { scale: "strength", cap: 1 },
    shieldStrip: { scale: "strength", cap: 1 },
  },

  // wiki: Elude — evasion angle × RNG; drain / restraint Misc-fixed
  "baruuk::Elude": {
    evasionAngle: { scale: "range" },
  },

  // wiki: Lull — sleep via duration; wave duration × DUR; range via ability.range
  "baruuk::Lull": {
    waveDuration: { scale: "duration" },
  },
  "helminth::Lull": {
    waveDuration: { scale: "duration" },
  },

  // wiki: Desolate Hands — Blast via damage; dagger charges × STR; DR/dagger Misc-fixed
  "baruuk::Desolate Hands": {
    daggerCharges: { scale: "strength" },
  },

  // wiki: Condemn — shields per enemy × STR; wave width Misc-fixed
  "harrow::Condemn": {
    shieldsPerEnemy: { scale: "strength" },
  },
  "helminth::Condemn": {
    shieldsPerEnemy: { scale: "strength" },
  },

  // wiki: Penance — heal / lifesteal / FR / reload × STR; shield duration Misc-fixed
  "harrow::Penance": {
    initialHealPercent: { scale: "strength" },
    lifeStealPercent: { scale: "strength" },
    fireRateBuff: { scale: "strength" },
    reloadBuff: { scale: "strength" },
  },

  // wiki: Thurible — energy convert × STR; headshot mult Misc-fixed
  "harrow::Thurible": {
    energyConvert: { scale: "strength" },
  },

  // wiki: Covenant — base CC + CC per damage × STR; invuln via duration; crit window × DUR
  "harrow::Covenant": {
    baseCriticalChance: { scale: "strength" },
    critChancePer100Damage: { scale: "strength" },
    critChanceDuration: { scale: "duration" },
  },

  // wiki: Dread Mirror — damage capture mult × STR; thresholds / contact Misc-fixed
  "garuda::Dread Mirror": {
    damageCaptureMultiplier: { scale: "strength" },
  },

  // wiki: Blood Altar — heal%/s × STR; DPS / altar cap Misc-fixed
  "garuda::Blood Altar": {
    healthPerSecond: { scale: "strength" },
  },
  "helminth::Blood Altar": {
    healthPerSecond: { scale: "strength" },
  },

  // wiki: Bloodletting — energy gain scales Efficiency (unmodeled); health deduct Misc-fixed

  // wiki: Seeking Talons — Slash via damage; mark Slash SC × STR (cap 100%); charge Misc-fixed
  "garuda::Seeking Talons": {
    slashStatusChance: { scale: "strength", cap: 1 },
  },

  // wiki: Fire Walker — Heat DPS via damage; explosion × STR; flame duration × DUR; speed/SC Misc-fixed
  "nezha::Fire Walker": {
    explosionDamage: { scale: "strength" },
    flameDuration: { scale: "duration" },
  },
  "helminth::Fire Walker": {
    explosionDamage: { scale: "strength" },
    flameDuration: { scale: "duration" },
  },

  // wiki: Blazing Chakram — Heat via damage; boosted dmg + vulnerability × STR; orb chances Misc-fixed
  "nezha::Blazing Chakram": {
    boostedDamage: { scale: "strength" },
    damageVulnerability: { scale: "strength" },
  },

  // wiki: Warding Halo — Slash DPS via damage; halo HP + armor/absorb mult × STR; invuln Misc-fixed
  "nezha::Warding Halo": {
    haloHealth: { scale: "strength" },
    armorMultiplier: { scale: "strength" },
    absorptionMultiplier: { scale: "strength" },
  },

  // wiki: Divine Spears — Puncture via damage; slam Impact × STR
  "nezha::Divine Spears": {
    slamDamage: { scale: "strength" },
  },

  // wiki: Soul Punch — Impact via damage; mark / projectile / explosion Misc-fixed

  // wiki: Desecrate — drop chances Misc-fixed (rank); range via ability.range
  // wiki: Shadows of the Dead — damage/shield/health bonuses × STR; decay inverse-DUR unmodeled
  "nekros::Shadows Of The Dead": {
    damageBonus: { scale: "strength" },
    shieldBonus: { scale: "strength" },
    healthBonus: { scale: "strength" },
  },
};

/** Top-level ability field scaling (damageReduction, damageBuff on the Ability object). */
const VERIFIED_FIELD_SCALING: Record<string, VerifiedAbilityFields> = {
  // wiki: Self Portrait — DR grows with kills; max 50% at 180% STR, hard cap 90%
  "follie::Self Portrait": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Eclipse — DR cap 90% (native Mirage); weapon buff scales STR
  "mirage::Eclipse": {
    damageReduction: { scale: "strength", cap: 0.9 },
    damageBuff: { scale: "strength" },
  },
  // wiki: Subsumed Eclipse — DR cap 75%, reduced damage bonus; still scales STR
  "helminth::Eclipse": {
    damageReduction: { scale: "strength", cap: 0.75 },
    damageBuff: { scale: "strength" },
  },
  // Legacy key: Helminth Eclipse placed on Gara (pre-helminth:: namespace)
  "gara::Eclipse": {
    damageReduction: { scale: "strength", cap: 0.75 },
    damageBuff: { scale: "strength" },
  },
  // wiki: Roar — weapon damage bonus scales STR
  "rhino::Roar": {
    damageBuff: { scale: "strength" },
  },
  "helminth::Roar": {
    damageBuff: { scale: "strength" },
  },
  // wiki: Shooting Gallery — ally weapon damage scales STR (additive with Serration)
  "mesa::Shooting Gallery": {
    damageBuff: { scale: "strength" },
  },
  "helminth::Shooting Gallery": {
    damageBuff: { scale: "strength" },
  },
  // wiki: Shatter Shield — DR cap 95%
  "mesa::Shatter Shield": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Parasitic Link — weapon buff and enemy damage redirection scale STR
  "nidus::Parasitic Link": {
    damageBuff: { scale: "strength" },
    damageReduction: { scale: "strength", cap: 1 },
  },
  // wiki: Preserving Shell — initial DR scales STR; cap 90%
  "citrine::Preserving Shell": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Immolation — max-heat DR base 85% × STR, hard cap 90% (initial DR is miscStats)
  "ember::Immolation": {
    damageReduction: { scale: "strength", cap: 0.9 },
  },
  // wiki: Symphony of Mercy — Deathbringer weapon damage × STR (additive with Serration)
  "jade::Symphony Of Mercy": {
    damageBuff: { scale: "strength" },
  },
  // wiki: Glory on High — flight DR base 35% × STR, hard cap 50%
  "jade::Glory On High": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Kinetic Plating — full-battery DR base 100% × STR, hard cap 100%
  "gauss::Kinetic Plating": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
  // wiki: Serene Storm — DR base 25% × STR, hard cap 40%
  "baruuk::Serene Storm": {
    damageReduction: { scale: "strength", useSiblingDrCap: true },
  },
};

export function resolveAbilityScalingKey(
  warframeId: string | undefined,
  abilityName: string,
  helminth?: boolean,
): string | null {
  if (helminth) return `helminth::${abilityName}`;
  if (!warframeId) return null;
  return abilityKey(warframeId, abilityName);
}

export function getVerifiedMiscScaling(
  warframeId: string | undefined,
  abilityName: string,
  statKey: string,
  helminth?: boolean,
): VerifiedStatScaling | null {
  const key = resolveAbilityScalingKey(warframeId, abilityName, helminth);
  if (!key) return null;
  return VERIFIED_MISC_SCALING[key]?.[statKey] ?? null;
}

export function getVerifiedFieldScaling(
  warframeId: string | undefined,
  abilityName: string,
  field: keyof VerifiedAbilityFields,
): VerifiedStatScaling | null {
  if (!warframeId) return null;
  const key = abilityKey(warframeId, abilityName);
  return VERIFIED_FIELD_SCALING[key]?.[field] ?? null;
}

/** Whether this ability has any verified misc-stat scaling entries. */
export function abilityHasVerifiedMiscScaling(
  warframeId: string | undefined,
  abilityName: string,
  helminth?: boolean,
): boolean {
  const key = resolveAbilityScalingKey(warframeId, abilityName, helminth);
  if (!key) return false;
  const table = VERIFIED_MISC_SCALING[key];
  return table != null && Object.keys(table).length > 0;
}
