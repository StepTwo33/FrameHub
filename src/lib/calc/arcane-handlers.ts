import { ArcaneEffectDef, ArcaneEffectLine } from "@/data/arcane-effects";
import { getPersistenceDamageCap, scaleArcaneEffectLine } from "@/lib/calc/arcane-utils";
import { avgCritMultiplier } from "@/lib/calc/crit-utils";
import { getWeaponRadialAttacks } from "@/lib/weapons/weapon-radial-utils";
import { CalculatedStats, WarframeCalculatedStats, Weapon } from "@/lib/types";

export interface WarframeArcaneContext {
  totalHealth: number;
  totalShield: number;
  totalArmor: number;
}

export interface ArcaneHandlerContext {
  def: ArcaneEffectDef;
  arcaneId: string;
  rank: number;
  stacks: number;
  simStacks?: number;
  baseWeapon?: Weapon;
  warframeCtx?: WarframeArcaneContext;
  /** From sim — gates weakpoint-only bonuses (e.g. Cascadia Accuracy). */
  applyHeadshots?: boolean;
  /** From sim — Primary Bulwark armor input. */
  warframeArmor?: number;
}

function trackBonus(stats: { arcaneBonuses?: Record<string, number> }, stat: string, value: number): void {
  if (!stats.arcaneBonuses) stats.arcaneBonuses = {};
  stats.arcaneBonuses[stat] = (stats.arcaneBonuses[stat] ?? 0) + value;
}

function scaledLine(def: ArcaneEffectDef, line: ArcaneEffectLine | undefined, rank: number, stacks: number): number {
  if (!line) return 0;
  const rankScaled = scaleArcaneEffectLine(line, rank, def.maxRank);
  const stackMult = def.trigger === "stacks" || line.stacking ? Math.max(stacks, 1) : 1;
  return rankScaled * stackMult;
}

function findEffect(def: ArcaneEffectDef, stat: string): ArcaneEffectLine | undefined {
  return (def.effects ?? []).find((e) => e.stat === stat);
}

function applyWeaponDamageMult(stats: CalculatedStats, pct: number): void {
  const scaled = pct / 100;
  stats.totalDamage *= 1 + scaled;
  stats.impact *= 1 + scaled;
  stats.puncture *= 1 + scaled;
  stats.slash *= 1 + scaled;
  for (const e of stats.elements ?? []) e.value *= 1 + scaled;
  for (const e of stats.rawElements ?? []) e.value *= 1 + scaled;
}

/** Virtuos Forge/Spike/Surge/Trojan: convert a fraction of amp (Void-proxy) damage to an element/IPS type. */
const VIRTUOS_VOID_CONVERSION: Record<string, "heat" | "puncture" | "electricity" | "viral"> = {
  virtuos_forge: "heat",
  virtuos_spike: "puncture",
  virtuos_surge: "electricity",
  virtuos_trojan: "viral",
};

function applyVirtuosVoidConversion(stats: CalculatedStats, ctx: ArcaneHandlerContext): boolean {
  const element = VIRTUOS_VOID_CONVERSION[ctx.arcaneId];
  if (!element) return false;
  const isAmp = /amp/i.test(ctx.baseWeapon?.category ?? "");
  // wiki: R3 is 96% (UI wrongly shows 98%); hard cap 98% when multiple converters.
  const convLine = findEffect(ctx.def, "voidConversion");
  const convPct = convLine ? scaleArcaneEffectLine(convLine, ctx.rank, ctx.def.maxRank) : 0;
  const frac = Math.min(0.98, Math.max(0, convPct / 100));
  trackBonus(stats, "voidConversion", convPct);
  if (!isAmp || frac <= 0 || stats.totalDamage <= 0) return true;

  const convertAmount = stats.totalDamage * frac;
  const remain = 1 - frac;
  stats.impact *= remain;
  stats.puncture *= remain;
  stats.slash *= remain;
  for (const e of stats.elements ?? []) e.value *= remain;
  for (const e of stats.rawElements ?? []) e.value *= remain;

  if (element === "puncture") {
    stats.puncture += convertAmount;
  } else {
    const existing = stats.elements.find((e) => e.type === element);
    if (existing) existing.value += convertAmount;
    else stats.elements.push({ type: element, value: convertAmount });
    if (stats.rawElements) {
      const raw = stats.rawElements.find((e) => e.type === element);
      if (raw) raw.value += convertAmount;
      else stats.rawElements.push({ type: element, value: convertAmount });
    }
  }
  // totalDamage unchanged (conversion, not bonus)
  trackBonus(stats, `voidTo_${element}`, convertAmount);
  return true;
}

/** Arcane IDs handled by applyCustomArcaneToWeapon (for coverage detection without full stats). */
export const WEAPON_CUSTOM_ARCANE_IDS = new Set([
  "arcane_primary_merciless",
  "arcane_secondary_merciless",
  "arcane_primary_deadhead",
  "arcane_secondary_deadhead",
  "arcane_primary_dexterity",
  "arcane_secondary_dexterity",
  "primary_overcharge",
  "melee_exposure",
  "secondary_enervate",
  "secondary_outburst",
  "cascadia_flare",
  "cascadia_accuracy",
  "cascadia_overcharge",
  "melee_doughty",
  "melee_retaliation",
  "melee_crescendo",
  "melee_assimilation",
  "melee_careen",
  "shotgun_vendetta",
  "arcane_pistoleer",
  "arcane_primary_charger",
  "arcane_acceleration",
  "arcane_tempo",
  "arcane_velocity",
  "arcane_strike",
  "arcane_avenger",
  "arcane_awakening",
  "arcane_rage",
  "arcane_rise",
  "arcane_momentum",
  "fractalized_reset",
  "longbow_sharpshot",
  "arcane_fury",
  "arcane_precision",
  "arcane_blade_charger",
  "arcane_arachne",
  "secondary_surge",
  "zid_an_uskos",
  "zid_an_asheir",
  "primary_plated_round",
  "primary_bulwark",
  "secondary_fortifier",
  "cascadia_empowered",
  "eternal_eradicate",
  "eternal_onslaught",
  "eternal_logistics",
  "magus_melt",
  "arcane_crepuscular",
  "virtuos_ghost",
  "virtuos_fury",
  "virtuos_strike",
  "virtuos_tempo",
  "virtuos_shadow",
  "virtuos_forge",
  "virtuos_spike",
  "virtuos_surge",
  "virtuos_trojan",
  "magus_accelerant",
  "magus_destruct",
  "residual_boils",
  "residual_shock",
  "residual_malodor",
  "residual_viremia",
  "melee_influence",
  "melee_duplicate",
  "arcane_melee_animosity",
  "melee_afflictions",
  "primary_compression",
  "secondary_encumber",
  "magus_aggress",
  "secondary_irradiate",
  "exodia_brave",
  "exodia_force",
  "zid_an_haras",
  "zid_an_osbok",
  "exodia_hunt",
  "exodia_might",
  "exodia_contagion",
  "exodia_epidemic",
  "exodia_triumph",
  "exodia_valor",
  "primary_debilitate",
  "primary_obstruct",
]);

/** Wiki Primary Compression: continuous/beam AoE — no bonus despite radial data. */
const PRIMARY_COMPRESSION_NO_OP_IDS = new Set([
  "ignis",
  "ignis_wraith",
  "glaxion",
  "glaxion_vandal",
  "komorex",
  "stahlta",
  "lizzie",
  "mutalist_cernos",
  "enkaus",
]);

/** Contagion explosion stance mult — wiki "None" (no stance) column by class. */
function contagionStanceExplosionMult(stanceType?: string): number {
  switch (stanceType) {
    case "heavy_blade":
      return 3;
    case "scythe":
    case "heavy_scythe":
    case "hammer":
      return 2;
    default:
      return 1;
  }
}

/** Largest usable AoE radius for Primary Compression (exclude Incarnon-only radials). */
function compressionUsableRadius(weapon: Weapon): number {
  const radials = getWeaponRadialAttacks(weapon).filter((a) => !/incarnon form/i.test(a.name ?? ""));
  return radials.reduce((max, a) => Math.max(max, a.radius ?? 0), 0);
}

/** Arcane IDs handled by applyCustomArcaneToWarframe (for coverage detection without full stats). */
export const WARFRAME_CUSTOM_ARCANE_IDS = new Set([
  "arcane_persistence",
  "arcane_battery",
  "arcane_bellicose",
  "arcane_expertise",
  "arcane_energize",
  "arcane_crepuscular",
  "arcane_eruption",
  "arcane_escapist",
  "arcane_steadfast",
  "arcane_truculence",
  "emergence_dissipate",
  "emergence_savior",
  "magus_glitch",
  "magus_repair",
  "magus_nourish",
  "magus_replenish",
  "magus_revert",
  "magus_cadence",
  "magus_cloud",
  "molt_reconstruct",
  "theorem_contagion",
  "theorem_infection",
  "zid_an_asheir",
  "zid_an_sek_eel",
  "melee_vortex",
  "pax_bolt",
  "molt_vigor",
  "arcane_concentration",
  "arcane_sculptor",
  "arcane_tanker",
  "arcane_ultimatum",
  "arcane_guardian",
  "arcane_reaper",
  "arcane_agility",
  "arcane_consequence",
  "arcane_double_back",
  "arcane_grace",
  "arcane_victory",
  "arcane_aegis",
  "magus_firewall",
  "magus_overload",
  "magus_elevate",
  "magus_husk",
  "magus_vigor",
]);

/** Stacking damage (+ optional reload) — Merciless, Deadhead, Dexterity, Cascadia Flare. */
function applyStackingDamageHandler(
  stats: CalculatedStats,
  ctx: ArcaneHandlerContext,
  opts?: { reload?: boolean; bonusKey?: string },
): void {
  const { def, rank, stacks } = ctx;
  const dmg = scaledLine(def, findEffect(def, "damage"), rank, stacks);
  if (dmg > 0) applyWeaponDamageMult(stats, dmg);
  if (opts?.reload) {
    // Merciless reload is a Rank-5 passive (wiki), not per-stack — apply once at rank value.
    const reloadLine = findEffect(def, "reloadSpeed");
    const reload = reloadLine ? scaleArcaneEffectLine(reloadLine, rank, def.maxRank) : 0;
    if (reload > 0) stats.reloadTime /= 1 + reload / 100;
  }
  trackBonus(stats, opts?.bonusKey ?? "stackingDamageStacks", stacks);
  for (const line of def.effects ?? []) {
    if (line.stat === "damage" || line.stat === "reloadSpeed") continue;
    trackBonus(stats, line.stat, scaledLine(def, line, rank, stacks));
  }
}

function trackAllEffects(
  stats: { arcaneBonuses?: Record<string, number> },
  def: ArcaneEffectDef,
  rank: number,
  stacks: number,
): void {
  for (const line of def.effects ?? []) {
    trackBonus(stats, line.stat, scaledLine(def, line, rank, stacks));
  }
}

/** Per-arcane weapon handlers — Zaw/Exodia, primary, secondary, melee. */
export function applyCustomArcaneToWeapon(stats: CalculatedStats, ctx: ArcaneHandlerContext): boolean {
  const { arcaneId, def, rank, stacks } = ctx;
  // Zid-An Haras amp AE is always on; other customs no-op at 0 stacks.
  if (stacks <= 0 && arcaneId !== "zid_an_haras") return true;

  switch (arcaneId) {
    case "arcane_primary_merciless":
    case "arcane_secondary_merciless":
      applyStackingDamageHandler(stats, ctx, { reload: true, bonusKey: "mercilessStacks" });
      return true;

    case "arcane_primary_deadhead":
    case "arcane_secondary_deadhead": {
      // Damage stacks; R5 headshot mult / recoil are passives (wiki — not per-stack).
      const dmg = scaledLine(def, findEffect(def, "damage"), rank, stacks);
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "deadheadStacks", stacks);
      const hsLine = findEffect(def, "headshotMultiplier");
      if (hsLine) {
        const hs = scaleArcaneEffectLine(hsLine, rank, def.maxRank);
        stats.headshotDamageBonus = (stats.headshotDamageBonus ?? 0) + hs / 100;
        trackBonus(stats, "headshotMultiplier", hs);
      }
      const recoilLine = findEffect(def, "recoilReduction");
      if (recoilLine) {
        trackBonus(stats, "recoilReduction", scaleArcaneEffectLine(recoilLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_primary_dexterity":
    case "arcane_secondary_dexterity": {
      // Damage stacks; R5 combo duration is a flat passive (wiki — not per-stack).
      const dmg = scaledLine(def, findEffect(def, "damage"), rank, stacks);
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "dexterityStacks", stacks);
      const comboLine = findEffect(def, "comboDuration");
      if (comboLine) {
        trackBonus(stats, "comboDuration", scaleArcaneEffectLine(comboLine, rank, def.maxRank));
      }
      return true;
    }

    case "primary_overcharge": {
      const ms = scaledLine(def, findEffect(def, "multishot"), rank, stacks);
      const baseMs = ctx.baseWeapon?.multishot ?? 1;
      stats.multishot += baseMs * (ms / 100);
      trackBonus(stats, "multishot", ms);
      return true;
    }

    case "melee_exposure": {
      // wiki: +X% Corrosive Damage per ability cast (R5 +60%), shared duration, cap 240%.
      // simStacks = ability-cast stacks (UI caps at 12); total % = min(240, perCast × casts).
      const perCastLine = findEffect(def, "corrosiveDamage");
      const capLine = findEffect(def, "meleeDamageBonus");
      const perCast = perCastLine ? scaleArcaneEffectLine(perCastLine, rank, def.maxRank) : 0;
      const cap = capLine?.maxValue ?? 240;
      const totalPct = Math.min(cap, perCast * Math.max(stacks, 0));
      if (totalPct > 0 && ctx.baseWeapon) {
        const base = ctx.baseWeapon.damage;
        const baseIps =
          (ctx.baseWeapon.impact ?? 0) +
          (ctx.baseWeapon.puncture ?? 0) +
          (ctx.baseWeapon.slash ?? 0);
        const phys = stats.impact + stats.puncture + stats.slash;
        const dmgMult = baseIps > 0 ? phys / baseIps : 1;
        const amount = base * (totalPct / 100) * dmgMult;
        const existing = stats.elements.find((e) => e.type === "corrosive");
        if (existing) existing.value += amount;
        else stats.elements.push({ type: "corrosive", value: amount });
        if (stats.rawElements) {
          const raw = stats.rawElements.find((e) => e.type === "corrosive");
          if (raw) raw.value += amount;
          else stats.rawElements.push({ type: "corrosive", value: amount });
        }
        stats.totalDamage += amount;
      }
      trackBonus(stats, "corrosiveDamage", totalPct);
      trackBonus(stats, "meleeDamageBonus", totalPct);
      return true;
    }

    case "cascadia_accuracy": {
      // wiki: +300% Weakpoint CC for 4s after roll (R5). Paper: stacks>0 = roll buff up;
      // only applies when applyHeadshots (weakpoint) is on.
      const ccLine = findEffect(def, "criticalChance");
      const cc = ccLine ? scaleArcaneEffectLine(ccLine, rank, def.maxRank) : 0;
      trackBonus(stats, "criticalChance", cc);
      trackBonus(stats, "buffDuration", findEffect(def, "buffDuration")?.maxValue ?? 4);
      if (ctx.applyHeadshots && cc > 0) {
        const baseCrit = ctx.baseWeapon?.criticalChance ?? stats.criticalChance;
        stats.criticalChance += baseCrit * (cc / 100);
      }
      return true;
    }

    case "melee_doughty": {
      // wiki: round1(PunctureStatusChance% × 0.1 × CM_bonus), cap +50x flat CM
      // R5 CM_bonus = 1.0x per 10% puncture status chance
      const cmPerTen = 0.5 + (rank / Math.max(def.maxRank, 1)) * 0.5;
      const totalDmg = Math.max(stats.totalDamage, 1e-6);
      const punctureFrac = Math.max(0, stats.puncture) / totalDmg;
      const punctureStatusPct = Math.max(0, stats.statusChance) * punctureFrac * 100;
      const raw = punctureStatusPct * 0.1 * cmPerTen;
      const bonus = Math.min(50, Math.round(raw * 10) / 10);
      if (bonus > 0) stats.criticalMultiplier += bonus;
      trackBonus(stats, "critPerPunctureTen", bonus);
      return true;
    }

    case "melee_retaliation": {
      // wiki R5: +30% melee dmg per 200 shields (half for overshields). Paper: simStacks = floor(shields/200).
      const perStepLine = findEffect(def, "meleeDamagePerShield");
      const capLine = findEffect(def, "meleeDamagePerShieldCap");
      const perStep = perStepLine ? scaleArcaneEffectLine(perStepLine, rank, def.maxRank) : 0;
      const cap = capLine ? scaleArcaneEffectLine(capLine, rank, def.maxRank) : 420;
      const steps = Math.max(ctx.simStacks ?? stacks, 0);
      const totalPct = Math.min(cap, perStep * steps);
      if (totalPct > 0) applyWeaponDamageMult(stats, totalPct);
      trackBonus(stats, "meleeDamagePerShield", totalPct);
      trackBonus(stats, "meleeDamagePerShieldCap", cap);
      return true;
    }

    case "secondary_enervate": {
      // wiki: +10% absolute CC per hit stack (all ranks); resets after N big crits.
      // Paper: simStacks = Enervate hit stacks.
      const { def, rank, baseWeapon, simStacks = 0 } = ctx;
      const ccLine = findEffect(def, "criticalChance");
      const perHitPct = ccLine ? scaleArcaneEffectLine(ccLine, rank, def.maxRank) : 0;
      const threshold = findEffect(def, "bigCritThreshold")?.maxValue ?? 6;
      const hitStacks = Math.max(0, simStacks);
      if (hitStacks > 0 && perHitPct > 0) {
        stats.criticalChance += (perHitPct / 100) * hitStacks;
      }
      trackBonus(stats, "criticalChance", perHitPct * hitStacks);
      trackBonus(stats, "bigCritThreshold", threshold);
      trackBonus(stats, "enervateStacks", hitStacks);
      void baseWeapon;
      return true;
    }

    case "secondary_outburst": {
      // wiki: on swap, +X% CC and CD per combo multiplier consumed (R5 +20%/combo).
      // Paper: simStacks = combo multiplier consumed; buff assumed up.
      const { def, rank, baseWeapon, simStacks = 0 } = ctx;
      const combo = Math.max(simStacks, 0);
      const perComboLine = findEffect(def, "criticalMultiplier");
      const perCombo = perComboLine ? scaleArcaneEffectLine(perComboLine, rank, def.maxRank) : 0;
      const totalPct = perCombo * combo;
      if (totalPct > 0) {
        const baseCrit = baseWeapon?.criticalChance ?? stats.criticalChance;
        const baseCm = baseWeapon?.criticalMultiplier ?? stats.criticalMultiplier;
        stats.criticalChance += baseCrit * (totalPct / 100);
        stats.criticalMultiplier += baseCm * (totalPct / 100);
      }
      trackBonus(stats, "criticalMultiplier", totalPct);
      trackBonus(stats, "criticalChance", totalPct);
      return true;
    }

    case "cascadia_flare":
      applyStackingDamageHandler(stats, ctx, { bonusKey: "cascadiaFlareStacks" });
      return true;

    case "cascadia_overcharge": {
      // wiki R5: +300% CC while Overshields active. Paper: stacks>0 = overshields up.
      const ccLine = findEffect(def, "criticalChance");
      const ccPct = ccLine ? scaleArcaneEffectLine(ccLine, rank, def.maxRank) : 0;
      const baseCc = ctx.baseWeapon?.criticalChance ?? stats.criticalChance;
      if (ccPct > 0) stats.criticalChance += baseCc * (ccPct / 100);
      trackBonus(stats, "criticalChance", ccPct);
      return true;
    }

    case "melee_crescendo": {
      // wiki: +1…+6 initial combo per finisher (R5 +6); accumulates for the mission.
      // Paper: simStacks = finisher count; cap initial combo contribution at 220 (12×).
      const perFinisher = rank + 1;
      const finishers = Math.max(ctx.simStacks ?? 0, 0);
      const added = Math.min(220, perFinisher * finishers);
      if (added > 0) stats.comboCount += added;
      trackBonus(stats, "meleeComboInitial", added);
      return true;
    }

    case "melee_assimilation": {
      // wiki: after shield break, +150% heavy damage at R5 for 20s. Paper: stacks>0 = buff up.
      const heavyLine = findEffect(def, "meleeHeavyDamage");
      const heavy = heavyLine ? scaleArcaneEffectLine(heavyLine, rank, def.maxRank) : 0;
      if (heavy > 0) stats.heavyAttackDamage *= 1 + heavy / 100;
      trackBonus(stats, "meleeHeavyDamage", heavy);
      const shieldLine = findEffect(def, "shieldRestorePercent");
      if (shieldLine) {
        trackBonus(stats, "shieldRestorePercent", scaleArcaneEffectLine(shieldLine, rank, def.maxRank));
      }
      return true;
    }

    case "melee_careen": {
      // wiki: ×1.25…×2.50 damage vs fully frozen (10 Cold). Paper: stacks>0 = vs frozen.
      const mult = 1.25 + (rank / Math.max(def.maxRank, 1)) * 1.25;
      if (mult > 1) applyWeaponDamageMult(stats, (mult - 1) * 100);
      trackBonus(stats, "meleeDamageBonus", (mult - 1) * 100);
      return true;
    }

    case "arcane_primary_charger": {
      // wiki R5: on melee kill (30%), +300% primary damage for 12s. Paper: stacks>0 = buff up.
      const dmgLine = findEffect(def, "damage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "damage", dmg);
      const chanceLine = findEffect(def, "armorBonusChance");
      if (chanceLine) {
        trackBonus(stats, "armorBonusChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_acceleration": {
      // wiki R5: +90% primary FR (excl. shotguns) for 9s on crit. Paper: stacks>0 = buff up.
      const frLine = findEffect(def, "fireRate");
      const fr = frLine ? scaleArcaneEffectLine(frLine, rank, def.maxRank) : 0;
      const isShotgun = ctx.baseWeapon?.category === "shotgun";
      if (fr > 0 && !isShotgun && !stats.fireRateLocked) {
        stats.fireRate *= 1 + fr / 100;
      }
      trackBonus(stats, "fireRate", isShotgun ? 0 : fr);
      const chanceLine = findEffect(def, "fireRateOnCrit");
      if (chanceLine) {
        trackBonus(stats, "fireRateOnCrit", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_strike": {
      // wiki R5: +60% melee attack speed for 18s on hit. Paper: stacks>0 = buff up.
      const asLine = findEffect(def, "attackSpeed");
      const as = asLine ? scaleArcaneEffectLine(asLine, rank, def.maxRank) : 0;
      if (as > 0) stats.fireRate *= 1 + as / 100;
      trackBonus(stats, "attackSpeed", as);
      const chanceLine = findEffect(def, "attackSpeedChance");
      if (chanceLine) {
        trackBonus(stats, "attackSpeedChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_avenger": {
      // wiki: absolute +45% CC (percentage points) for 12s on damaged. Paper: stacks>0 = buff up.
      const ccLine = findEffect(def, "criticalChance");
      const ccPct = ccLine ? scaleArcaneEffectLine(ccLine, rank, def.maxRank) : 0;
      if (ccPct > 0) stats.criticalChance += ccPct / 100;
      trackBonus(stats, "criticalChance", ccPct);
      return true;
    }

    case "arcane_awakening":
    case "arcane_rage":
    case "arcane_rise": {
      // Awakening: +150% secondary dmg on reload. Rage: +180% primary dmg on headshot.
      // Rise: +150% primary dmg on reload. Data uses holsterDamage — paper: stacks>0 = buff up.
      const dmgLine = findEffect(def, "holsterDamage") ?? findEffect(def, "damage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "holsterDamage", dmg);
      const chanceLine = findEffect(def, "healthRegenChance");
      if (chanceLine) {
        trackBonus(stats, "healthRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_momentum": {
      // wiki R5: +150% sniper reload for 12s on crit. Paper: stacks>0 = buff up; snipers only.
      const isSniper =
        ctx.baseWeapon?.triggerType === "Sniper" ||
        /sniper/i.test(ctx.baseWeapon?.category ?? "");
      const reloadLine = findEffect(def, "reloadSpeedBonus") ?? findEffect(def, "reloadSpeed");
      const reload = reloadLine ? scaleArcaneEffectLine(reloadLine, rank, def.maxRank) : 0;
      if (isSniper && reload > 0) stats.reloadTime /= 1 + reload / 100;
      trackBonus(stats, "reloadSpeedBonus", isSniper ? reload : 0);
      const chanceLine = findEffect(def, "reloadSpeedChance");
      if (chanceLine) {
        trackBonus(stats, "reloadSpeedChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "fractalized_reset": {
      // wiki R5: +240% reload for 5s on ability cast. Paper: stacks>0 = buff up (skip proc uptime).
      const reloadLine = findEffect(def, "reloadSpeed");
      const reload = reloadLine ? scaleArcaneEffectLine(reloadLine, rank, def.maxRank) : 0;
      if (reload > 0) stats.reloadTime /= 1 + reload / 100;
      trackBonus(stats, "reloadSpeed", reload);
      return true;
    }

    case "longbow_sharpshot": {
      // wiki R5: +300% next-shot damage after HS, multiplicative to Serration. Paper: stacks>0 = buff up.
      const dmgLine = findEffect(def, "damage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "damage", dmg);
      return true;
    }

    case "primary_bulwark": {
      // wiki: Damage% = min(max(Armor−1000,0), 500) × (0.5%…1%/armor). Cap at 1500 armor for all ranks.
      const armor = ctx.warframeArmor ?? 0;
      const threshold = findEffect(def, "damagePerArmorThreshold")?.maxValue ?? 1000;
      const armorPtsTowardCap = 500;
      const perArmorPct = scaleArcaneEffectLine(
        { maxValue: 1, baseValue: 0.5 },
        rank,
        def.maxRank,
      );
      const armorPts = Math.min(Math.max(armor - threshold, 0), armorPtsTowardCap);
      const dmgPct = armorPts * perArmorPct;
      if (dmgPct > 0) applyWeaponDamageMult(stats, dmgPct);
      trackBonus(stats, "damagePerArmorOver", dmgPct);
      trackBonus(stats, "damagePerArmorThreshold", threshold);
      return true;
    }

    case "secondary_fortifier": {
      // wiki R5: ×8 damage vs Overguard (passive). Paper: simStacks>0 = target has Overguard.
      if ((ctx.simStacks ?? 0) <= 0) {
        trackBonus(stats, "overguardDamage", 0);
        return true;
      }
      const ogLine = findEffect(def, "overguardDamage");
      const mult = ogLine ? scaleArcaneEffectLine(ogLine, rank, def.maxRank) : 0;
      if (mult > 1) applyWeaponDamageMult(stats, (mult - 1) * 100);
      trackBonus(stats, "overguardDamage", mult);
      return true;
    }

    case "cascadia_empowered": {
      // wiki R5: flat +750 typed damage per status proc (not scaled by weapon dmg/crit).
      // Paper: expected procs/shot ≈ SC × multishot; always-on while equipped.
      const flatLine = findEffect(def, "bonusDamageOnStatus");
      const flat = flatLine ? scaleArcaneEffectLine(flatLine, rank, def.maxRank) : 0;
      const expectedProcs = Math.max(0, stats.statusChance) * Math.max(1, stats.multishot);
      const bonus = flat * expectedProcs;
      if (bonus > 0) stats.totalDamage += bonus;
      trackBonus(stats, "bonusDamageOnStatus", flat);
      trackBonus(stats, "cascadiaEmpoweredExpected", bonus);
      return true;
    }

    case "eternal_eradicate": {
      // wiki R5: +60% amp damage for 8s after Operator ability. Paper: stacks>0 = buff up.
      const dmgLine = findEffect(def, "ampDamage") ?? findEffect(def, "damage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "ampDamage", dmg);
      const durLine = findEffect(def, "buffDuration");
      if (durLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "eternal_onslaught": {
      // wiki R5: +180% amp CC for 8s while Operator energy ≤25. Paper: stacks>0 = buff up.
      // Absolute? Wiki "Critical Chance Increase" table is % of amp base CC (like Hot Shot).
      const ccLine = findEffect(def, "criticalChance");
      const ccPct = ccLine ? scaleArcaneEffectLine(ccLine, rank, def.maxRank) : 0;
      const baseCc = ctx.baseWeapon?.criticalChance ?? stats.criticalChance;
      if (ccPct > 0) stats.criticalChance += baseCc * (ccPct / 100);
      trackBonus(stats, "criticalChance", ccPct);
      const durLine = findEffect(def, "buffDuration");
      if (durLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "eternal_logistics": {
      // wiki R5: +72% amp ammo efficiency for 8s after Void Sling. Paper: stacks>0 = buff up.
      const aeLine = findEffect(def, "ampAmmoEfficiency") ?? findEffect(def, "ammoEfficiency");
      const ae = aeLine ? scaleArcaneEffectLine(aeLine, rank, def.maxRank) : 0;
      if (ae > 0) stats.ammoEfficiency = (stats.ammoEfficiency ?? 0) + ae / 100;
      trackBonus(stats, "ampAmmoEfficiency", ae);
      const durLine = findEffect(def, "buffDuration");
      if (durLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "magus_melt": {
      // wiki: +30% Operator Heat / Void Sling stack (cap 7 → +210%). Paper: amp weapons only.
      const isAmp = /amp/i.test(ctx.baseWeapon?.category ?? "");
      const heatLine = findEffect(def, "operatorHeatDamage");
      const heatPct = heatLine ? scaledLine(def, heatLine, rank, stacks) : 0;
      if (isAmp && heatPct > 0 && ctx.baseWeapon) {
        const base = ctx.baseWeapon.damage;
        const baseIps =
          (ctx.baseWeapon.impact ?? 0) +
          (ctx.baseWeapon.puncture ?? 0) +
          (ctx.baseWeapon.slash ?? 0);
        const phys = stats.impact + stats.puncture + stats.slash;
        const dmgMult = baseIps > 0 ? phys / baseIps : 1;
        const amount = base * (heatPct / 100) * dmgMult;
        const existing = stats.elements.find((e) => e.type === "heat");
        if (existing) existing.value += amount;
        else stats.elements.push({ type: "heat", value: amount });
        if (stats.rawElements) {
          const raw = stats.rawElements.find((e) => e.type === "heat");
          if (raw) raw.value += amount;
          else stats.rawElements.push({ type: "heat", value: amount });
        }
        stats.totalDamage += amount;
      }
      trackBonus(stats, "operatorHeatDamage", heatPct);
      return true;
    }

    case "arcane_crepuscular": {
      // wiki: +0.5…+3 final crit mult while invisible (flat final). Paper: stacks>0 = invisible.
      const cmLine = findEffect(def, "criticalMultiplier");
      const cmFlat = cmLine ? scaleArcaneEffectLine(cmLine, rank, def.maxRank) : 0;
      if (cmFlat > 0) stats.criticalMultiplier += cmFlat;
      trackBonus(stats, "criticalMultiplier", cmFlat);
      return true;
    }

    case "virtuos_ghost": {
      // wiki R3: +60% amp SC for 12s on headshot (40% chance). Paper: stacks>0 = buff up.
      const scLine = findEffect(def, "ampStatusChance");
      const scPct = scLine ? scaleArcaneEffectLine(scLine, rank, def.maxRank) : 0;
      const baseSc = ctx.baseWeapon?.statusChance ?? stats.statusChance;
      if (scPct > 0) stats.statusChance += baseSc * (scPct / 100);
      trackBonus(stats, "ampStatusChance", scPct);
      const chanceLine = findEffect(def, "healthRegenChance");
      if (chanceLine) {
        trackBonus(stats, "healthRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "virtuos_fury": {
      // wiki R3: +30% amp damage for 4s on status (20% chance). Paper: stacks>0 = buff up.
      const dmgLine = findEffect(def, "damage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "damage", dmg);
      const chanceLine = findEffect(def, "healthRegenChance");
      if (chanceLine) {
        trackBonus(stats, "healthRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "virtuos_strike": {
      // wiki R3: +80% multiplicative CD for 4s on crit (20% chance). Paper: stacks>0 = buff up.
      const cmLine = findEffect(def, "ampCritDamage");
      const cmPct = cmLine ? scaleArcaneEffectLine(cmLine, rank, def.maxRank) : 0;
      if (cmPct > 0) stats.criticalMultiplier *= 1 + cmPct / 100;
      trackBonus(stats, "ampCritDamage", cmPct);
      const chanceLine = findEffect(def, "healthRegenChance");
      if (chanceLine) {
        trackBonus(stats, "healthRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "virtuos_tempo": {
      // wiki R3: +60% FR for 8s on kill (60% chance). Paper: stacks>0 = buff up.
      const frLine = findEffect(def, "ampFireRate");
      const frPct = frLine ? scaleArcaneEffectLine(frLine, rank, def.maxRank) : 0;
      if (frPct > 0 && !stats.fireRateLocked) stats.fireRate *= 1 + frPct / 100;
      trackBonus(stats, "ampFireRate", frPct);
      const chanceLine = findEffect(def, "healthRegenChance");
      if (chanceLine) {
        trackBonus(stats, "healthRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "virtuos_shadow": {
      // wiki R3: +60% multiplicative CC for 12s on HS (40% chance). Paper: stacks>0 = buff up.
      const ccLine = findEffect(def, "critChanceOnDamaged");
      const ccPct = ccLine ? scaleArcaneEffectLine(ccLine, rank, def.maxRank) : 0;
      if (ccPct > 0) stats.criticalChance *= 1 + ccPct / 100;
      trackBonus(stats, "critChanceOnDamaged", ccPct);
      const chanceLine = findEffect(def, "healthRegenChance");
      if (chanceLine) {
        trackBonus(stats, "healthRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "virtuos_forge":
    case "virtuos_spike":
    case "virtuos_surge":
    case "virtuos_trojan":
      return applyVirtuosVoidConversion(stats, ctx);

    case "magus_accelerant": {
      // wiki R5: Void Sling → −65% enemy Heat resistance / stack (additive vuln).
      // Paper: sim stacks = sling stacks; Heat damage × (1 + 0.65×stacks).
      const redLine = findEffect(def, "enemyResistanceReduction");
      const perStack = redLine ? scaleArcaneEffectLine(redLine, rank, def.maxRank) : 0;
      const vulnPct = perStack * Math.max(stacks, 0);
      const heatMult = 1 + vulnPct / 100;
      let heatBefore = 0;
      for (const e of stats.elements ?? []) {
        if (e.type === "heat") {
          heatBefore += e.value;
          e.value *= heatMult;
        }
      }
      for (const e of stats.rawElements ?? []) {
        if (e.type === "heat") e.value *= heatMult;
      }
      if (heatBefore > 0) {
        stats.totalDamage += heatBefore * (heatMult - 1);
      }
      trackBonus(stats, "enemyResistanceReduction", vulnPct);
      return true;
    }

    case "magus_destruct": {
      // wiki R5: Void Sling → −65% enemy Puncture resistance / stack.
      // Paper: Puncture × (1 + 0.65×stacks).
      const redLine = findEffect(def, "enemyResistanceReduction");
      const perStack = redLine ? scaleArcaneEffectLine(redLine, rank, def.maxRank) : 0;
      const vulnPct = perStack * Math.max(stacks, 0);
      const mult = 1 + vulnPct / 100;
      const before = stats.puncture;
      if (before > 0 && vulnPct > 0) {
        stats.puncture *= mult;
        stats.totalDamage += before * (mult - 1);
      }
      trackBonus(stats, "enemyResistanceReduction", vulnPct);
      return true;
    }

    case "residual_boils":
    case "residual_shock":
    case "residual_malodor":
    case "residual_viremia": {
      // Kitgun Residual zones. Paper: stacks>0 = one zone up.
      // DoT (Malodor/Viremia): flat zoneDamagePerSec. Burst (Boils/Shock): paper 1 hit/s = zoneDamage.
      const isKitgun = /kitgun/i.test(ctx.baseWeapon?.category ?? "");
      const dpsLine =
        findEffect(def, "zoneDamagePerSec") ?? findEffect(def, "zoneDamage");
      const dps = dpsLine ? scaleArcaneEffectLine(dpsLine, rank, def.maxRank) : 0;
      if (isKitgun && dps > 0) {
        stats.residualZoneDps = (stats.residualZoneDps ?? 0) + dps;
      }
      for (const line of def.effects ?? []) {
        trackBonus(stats, line.stat, scaleArcaneEffectLine(line, rank, def.maxRank));
      }
      trackBonus(stats, "residualZoneDps", isKitgun ? dps : 0);
      return true;
    }

    case "melee_influence": {
      // wiki R5: on Electricity status (20%), elemental melee statuses spread + deal matching
      // elemental damage to nearby. Paper: stacks>0 = buff up; 1 nearby hit = sum(elements).
      const splash = (stats.elements ?? []).reduce((sum, e) => sum + (e.value ?? 0), 0);
      if (splash > 0) {
        stats.totalDamage += splash;
        trackBonus(stats, "influenceSplash", splash);
      }
      for (const line of def.effects ?? []) {
        trackBonus(stats, line.stat, scaleArcaneEffectLine(line, rank, def.maxRank));
      }
      return true;
    }

    case "melee_duplicate": {
      // wiki R5: 100% chance yellow crits create a second damage instance.
      // Paper: stacks>0 = all hits qualify → damage × (1 + chance%).
      const chanceLine = findEffect(def, "duplicateAttackChance");
      const chance = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      if (chance > 0) applyWeaponDamageMult(stats, chance);
      trackBonus(stats, "duplicateAttackChance", chance);
      return true;
    }

    case "arcane_melee_animosity": {
      // wiki R5: +42% absolute CC per stack (cap 10 → +420%) on the next heavy only.
      // Light-attack CC / DPS unchanged. Paper: sim stacks = built stacks.
      const ccLine = findEffect(def, "criticalChance");
      const perStackPct = ccLine ? scaleArcaneEffectLine(ccLine, rank, def.maxRank) : 0;
      const bonusCc = (perStackPct / 100) * stacks;
      const cm = stats.criticalMultiplier;
      const oldAvg = avgCritMultiplier(stats.criticalChance, cm);
      const newAvg = avgCritMultiplier(stats.criticalChance + bonusCc, cm);
      if (oldAvg > 0 && (stats.heavyAttackDamage ?? 0) > 0) {
        stats.heavyAttackDamage *= newAvg / oldAvg;
      }
      trackBonus(stats, "criticalChance", perStackPct * stacks);
      trackBonus(stats, "animosityStacks", stacks);
      return true;
    }

    case "melee_afflictions": {
      // wiki R5: +6 stacks to each existing damaging status on KD/ragdoll/lift.
      // Paper: stacks>0 = triggered; assume 6 existing → ×2 DoT tick damage.
      for (const proc of stats.statusProcs ?? []) {
        if ((proc.damagePerTick ?? 0) <= 0) continue;
        proc.damagePerTick *= 2;
        proc.totalDamage *= 2;
      }
      stats.statusDamageBonus = (stats.statusDamageBonus ?? 0) + 1;
      const stacksLine = findEffect(def, "statusStackBonus");
      const added = stacksLine ? scaleArcaneEffectLine(stacksLine, rank, def.maxRank) : 0;
      trackBonus(stats, "statusStackBonus", added);
      return true;
    }

    case "primary_compression": {
      // wiki R5: while aiming, radius ×0.2; +100% dmg and +5.5% AE per meter lost.
      // metersLost = moddedRadius × 0.8. Paper: stacks>0 = aiming; base radial radius (no Firestorm yet).
      const weaponId = ctx.baseWeapon?.id ?? "";
      if (PRIMARY_COMPRESSION_NO_OP_IDS.has(weaponId)) {
        trackBonus(stats, "damage", 0);
        trackBonus(stats, "ammoEfficiency", 0);
        return true;
      }
      const radius = ctx.baseWeapon ? compressionUsableRadius(ctx.baseWeapon) : 0;
      if (radius <= 0) {
        trackBonus(stats, "damage", 0);
        trackBonus(stats, "ammoEfficiency", 0);
        return true;
      }
      const metersLost = radius * 0.8;
      const dmgLine = findEffect(def, "damage");
      const aeLine = findEffect(def, "ammoEfficiency");
      const dmgPerM = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      const aePerM = aeLine ? scaleArcaneEffectLine(aeLine, rank, def.maxRank) : 0;
      const dmgPct = dmgPerM * metersLost;
      const aePct = aePerM * metersLost;
      if (dmgPct > 0) applyWeaponDamageMult(stats, dmgPct);
      if (aePct > 0) stats.ammoEfficiency = (stats.ammoEfficiency ?? 0) + aePct / 100;
      trackBonus(stats, "damage", dmgPct);
      trackBonus(stats, "ammoEfficiency", aePct);
      trackBonus(stats, "compressionMetersLost", metersLost);
      return true;
    }

    case "zid_an_haras": {
      // wiki: +18% amp AE always; +48% WF AE for 30s after Tauron Strike (paper: stacks>0).
      const ampAeLine = findEffect(def, "ampAmmoEfficiency");
      const ampAe = ampAeLine ? scaleArcaneEffectLine(ampAeLine, rank, def.maxRank) : 0;
      if (ampAe > 0) stats.ammoEfficiency = (stats.ammoEfficiency ?? 0) + ampAe / 100;
      trackBonus(stats, "ampAmmoEfficiency", ampAe);
      if (stacks > 0) {
        const aeLine = findEffect(def, "ammoEfficiency");
        const ae = aeLine ? scaleArcaneEffectLine(aeLine, rank, def.maxRank) : 0;
        if (ae > 0) stats.ammoEfficiency = (stats.ammoEfficiency ?? 0) + ae / 100;
        trackBonus(stats, "ammoEfficiency", ae);
      }
      const durLine = findEffect(def, "buffDuration");
      if (durLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "zid_an_osbok": {
      // wiki R5: +3.0 flat amp CD for 15s after Void Sling strips Overguard. Paper: stacks>0.
      const cmLine = findEffect(def, "ampCritDamage");
      const cmFlat = cmLine ? scaleArcaneEffectLine(cmLine, rank, def.maxRank) : 0;
      if (cmFlat > 0) stats.criticalMultiplier += cmFlat;
      trackBonus(stats, "ampCritDamage", cmFlat);
      for (const line of def.effects ?? []) {
        if (line.stat === "ampCritDamage") continue;
        trackBonus(stats, line.stat, scaleArcaneEffectLine(line, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_precision": {
      // wiki R5: +300% secondary damage for 18s on headshot (not HS-only multiplier).
      const dmgLine = findEffect(def, "headshotDamage") ?? findEffect(def, "damage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "headshotDamage", dmg);
      return true;
    }

    case "arcane_fury":
    case "arcane_blade_charger": {
      // Fury: +180% melee dmg on crit. Blade Charger: +300% melee dmg on primary kill.
      const dmgLine = findEffect(def, "meleeDamageBonus");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "meleeDamageBonus", dmg);
      const chanceLine = findEffect(def, "meleeDamageChance");
      if (chanceLine) {
        trackBonus(stats, "meleeDamageChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_arachne": {
      // wiki: +150% damage while wall-latched. Paper: stacks>0 = wall-latching.
      const dmgLine = findEffect(def, "wallLatchDamage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "wallLatchDamage", dmg);
      return true;
    }

    case "arcane_tempo":
    case "arcane_velocity": {
      // Tempo: +90% shotgun FR on crit. Velocity: +120% secondary FR on crit. Paper: stacks>0 = buff up.
      const frLine = findEffect(def, "fireRate");
      const fr = frLine ? scaleArcaneEffectLine(frLine, rank, def.maxRank) : 0;
      if (fr > 0 && !stats.fireRateLocked) {
        stats.fireRate *= 1 + fr / 100;
      }
      trackBonus(stats, "fireRate", fr);
      return true;
    }

    case "shotgun_vendetta": {
      // wiki R5: +180% MS / +75% reload for 15s after close shotgun kill. Paper: stacks>0 = buff up.
      const msLine = findEffect(def, "multishot");
      const ms = msLine ? scaleArcaneEffectLine(msLine, rank, def.maxRank) : 0;
      if (ms > 0 && !stats.multishotLocked) {
        const baseMs = ctx.baseWeapon?.multishot ?? 1;
        stats.multishot += baseMs * (ms / 100);
      }
      trackBonus(stats, "multishot", ms);
      const reloadLine = findEffect(def, "reloadSpeed");
      const reload = reloadLine ? scaleArcaneEffectLine(reloadLine, rank, def.maxRank) : 0;
      if (reload > 0) stats.reloadTime /= 1 + reload / 100;
      trackBonus(stats, "reloadSpeed", reload);
      return true;
    }

    case "arcane_pistoleer": {
      // wiki R5: on pistol HS kill (60%), +102% AE for 12s. Paper: stacks>0 = buff up.
      const aeLine = findEffect(def, "ammoEfficiency");
      const ae = aeLine ? scaleArcaneEffectLine(aeLine, rank, def.maxRank) : 0;
      if (ae > 0) stats.ammoEfficiency = (stats.ammoEfficiency ?? 0) + ae / 100;
      trackBonus(stats, "ammoEfficiency", ae);
      const chanceLine = findEffect(def, "headshotProcChance");
      if (chanceLine) {
        trackBonus(stats, "headshotProcChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "secondary_surge": {
      // wiki: +0.5% dmg / energy after cast; R5 cap +700% (×8). Paper: stacks>0 = at damage cap.
      const caps = [200, 300, 400, 500, 600, 700];
      const cap = caps[Math.min(rank, caps.length - 1)] ?? 700;
      if (cap > 0) applyWeaponDamageMult(stats, cap);
      trackBonus(stats, "damagePerEnergy", cap);
      return true;
    }

    case "zid_an_uskos": {
      // wiki R5: +2.4% Heat / Operator|Tauron kill (cap ~105 → max +250%). Does not combine.
      // Paper: sim stacks = kill stacks; Heat = base × min(250, 2.4×stacks)% of base (IPS-scaled).
      const heatLine = findEffect(def, "secondaryHeatDamage");
      const perStack = heatLine ? scaleArcaneEffectLine(heatLine, rank, def.maxRank) : 0;
      const heatPct = Math.min(250, perStack * Math.max(stacks, 0));
      const isSecondary =
        /secondary|pistol|kitgun/i.test(ctx.baseWeapon?.category ?? "") ||
        ctx.baseWeapon?.hasSecondaryArcaneSlot === true;
      if (isSecondary && heatPct > 0 && ctx.baseWeapon) {
        const base = ctx.baseWeapon.damage;
        const baseIps =
          (ctx.baseWeapon.impact ?? 0) +
          (ctx.baseWeapon.puncture ?? 0) +
          (ctx.baseWeapon.slash ?? 0);
        const phys = stats.impact + stats.puncture + stats.slash;
        const dmgMult = baseIps > 0 ? phys / baseIps : 1;
        const amount = base * (heatPct / 100) * dmgMult;
        const existing = stats.elements.find((e) => e.type === "heat");
        if (existing) existing.value += amount;
        else stats.elements.push({ type: "heat", value: amount });
        if (stats.rawElements) {
          const raw = stats.rawElements.find((e) => e.type === "heat");
          if (raw) raw.value += amount;
          else stats.rawElements.push({ type: "heat", value: amount });
        }
        stats.totalDamage += amount;
      }
      trackBonus(stats, "secondaryHeatDamage", heatPct);
      return true;
    }

    case "zid_an_asheir": {
      // wiki R5: +6% SC / Tauron hit (cap 50 → +300%) for all WF weapons; +18% Tauron charge passive.
      const scLine = findEffect(def, "statusChancePerHit");
      const perStack = scLine ? scaleArcaneEffectLine(scLine, rank, def.maxRank) : 0;
      const scPct = perStack * Math.max(stacks, 0);
      const baseSc = ctx.baseWeapon?.statusChance ?? stats.statusChance;
      if (scPct > 0) stats.statusChance += baseSc * (scPct / 100);
      trackBonus(stats, "statusChancePerHit", scPct);
      const chargeLine = findEffect(def, "tauronStrikeCharge");
      if (chargeLine) {
        trackBonus(stats, "tauronStrikeCharge", scaleArcaneEffectLine(chargeLine, rank, def.maxRank));
      }
      const durLine = findEffect(def, "buffDuration");
      if (durLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "secondary_encumber": {
      // wiki R5: 24% chance on status → 1 extra random status (max 1 per instant).
      // Paper: stacks>0 = buff up; E[extra] ≈ min(1, SC) × 0.24 added to statusChance.
      const chanceLine = findEffect(def, "secondaryStatusProc");
      const chancePct = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      const expectedExtra = Math.min(1, Math.max(0, stats.statusChance)) * (chancePct / 100);
      if (expectedExtra > 0) stats.statusChance += expectedExtra;
      trackBonus(stats, "secondaryStatusProc", chancePct);
      trackBonus(stats, "encumberExpectedExtra", expectedExtra * 100);
      return true;
    }

    case "primary_plated_round": {
      // wiki: on empty reload, damage bonus = 15 × √(5 × max magazine); duration by rank.
      // Paper: stacks>0 = buff active after reload.
      const mag = ctx.baseWeapon?.magazine ?? 0;
      const dmgPct = mag > 0 ? 15 * Math.sqrt(5 * mag) : 0;
      if (dmgPct > 0) applyWeaponDamageMult(stats, dmgPct);
      trackBonus(stats, "reloadDamageRamp", dmgPct);
      const durLine = findEffect(def, "buffDuration");
      if (durLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "exodia_brave": {
      trackBonus(stats, "energyRegen", scaledLine(def, findEffect(def, "energyRegen"), rank, stacks));
      trackBonus(stats, "exodiaBraveStacks", stacks);
      return true;
    }

    case "exodia_force": {
      // wiki R3: 50% on status → 200% weapon damage radial (6m). Paper: stacks>0 = blast hits
      // 1 nearby enemy at point-blank (no falloff; chance assumed).
      const dmgLine = findEffect(def, "procDamageMultiplier");
      const dmgPct = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmgPct > 0) {
        const splash = stats.totalDamage * (dmgPct / 100);
        stats.totalDamage += splash;
        trackBonus(stats, "procDamageMultiplier", dmgPct);
        trackBonus(stats, "exodiaForceSplash", splash);
      }
      const chanceLine = findEffect(def, "statusProcChance");
      if (chanceLine) {
        trackBonus(stats, "statusProcChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "magus_aggress": {
      // wiki R5: +300% CD for 4 heavy-blade/hammer attacks after melee transfer.
      // Paper: stacks>0 = buff up; only heavy_blade / hammer.
      const stance = ctx.baseWeapon?.stanceType ?? "";
      const eligible = stance === "heavy_blade" || stance === "hammer";
      const cmLine = findEffect(def, "criticalMultiplier");
      const cmPct = cmLine ? scaleArcaneEffectLine(cmLine, rank, def.maxRank) : 0;
      const baseCm = ctx.baseWeapon?.criticalMultiplier ?? stats.criticalMultiplier;
      if (eligible && cmPct > 0) stats.criticalMultiplier += baseCm * (cmPct / 100);
      trackBonus(stats, "criticalMultiplier", eligible ? cmPct : 0);
      return true;
    }

    case "secondary_irradiate": {
      // wiki R5: at 10 Radiation stacks, spread 180% of hit damage to nearby enemies.
      // Paper: stacks>0 = threshold met + 1 nearby enemy at full (no LoS loss).
      const multLine = findEffect(def, "procDamageMultiplier");
      const multPct = multLine ? scaleArcaneEffectLine(multLine, rank, def.maxRank) : 0;
      if (multPct > 0) {
        const splash = stats.totalDamage * (multPct / 100);
        stats.totalDamage += splash;
        trackBonus(stats, "procDamageMultiplier", multPct);
        trackBonus(stats, "irradiateSplash", splash);
      }
      const radLine = findEffect(def, "procAuraRadius");
      if (radLine) {
        trackBonus(stats, "procAuraRadius", scaleArcaneEffectLine(radLine, rank, def.maxRank));
      }
      return true;
    }

    case "exodia_contagion": {
      // wiki R3: aim-glide aerial melee launches projectile.
      // Paper 1× point-blank: direct 2× + explosion 5××stanceMult (ignore 30m bonus / stick DoT).
      // Burst add-on only — does not fold into sustained DPS.
      const stanceMult = contagionStanceExplosionMult(ctx.baseWeapon?.stanceType);
      const zawDmg = stats.totalDamage;
      const hit =
        zawDmg * (2 + 5 * stanceMult) * avgCritMultiplier(stats.criticalChance, stats.criticalMultiplier);
      trackBonus(stats, "contagionProjectileDamage", hit);
      const radLine = findEffect(def, "contagionExplosionRadius");
      if (radLine) {
        trackBonus(stats, "contagionExplosionRadius", scaleArcaneEffectLine(radLine, rank, def.maxRank));
      }
      trackBonus(stats, "contagionStanceMult", stanceMult);
      return true;
    }

    case "exodia_triumph": {
      // wiki R3: +50% Additional Combo Count Chance on hit (Zaw). Panel only — combo strings → C6.
      const isZaw = /zaw/i.test(ctx.baseWeapon?.category ?? "");
      const chanceLine = findEffect(def, "meleeComboChance");
      const chance = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      trackBonus(stats, "meleeComboChance", isZaw ? chance : 0);
      return true;
    }

    case "exodia_valor": {
      // wiki R3: +200% Additional Combo Count Chance vs Lifted (Zaw).
      // Paper: stacks>0 = Lifted target. Panel only — combo strings → C6.
      const isZaw = /zaw/i.test(ctx.baseWeapon?.category ?? "");
      const chanceLine = findEffect(def, "meleeComboChance");
      const chance = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      trackBonus(stats, "meleeComboChance", isZaw ? chance : 0);
      return true;
    }

    case "primary_debilitate": {
      // wiki R5: at ≥10 stacks of a combined status, re-applying it has 50–100% chance to also
      // inflict one of its base components (separate instance; Heat/Elec/Toxin DoTs benefit).
      // Paper: stacks>0 = threshold met. Expected component proc chance = combinedChance × p × 1/n.
      const threshLine = findEffect(def, "debilitateStackThreshold");
      const chanceLine = findEffect(def, "statusProcChance");
      const threshold = threshLine ? scaleArcaneEffectLine(threshLine, rank, def.maxRank) : 10;
      const chancePct = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      trackBonus(stats, "debilitateStackThreshold", threshold);
      trackBonus(stats, "statusProcChance", chancePct);

      const COMBINED: Record<string, string[]> = {
        viral: ["toxin", "cold"],
        corrosive: ["heat", "toxin"],
        gas: ["heat", "toxin"],
        magnetic: ["cold", "electricity"],
        radiation: ["heat", "electricity"],
        blast: ["heat", "cold"],
      };
      let expectedExtra = 0;
      for (const proc of stats.statusProcs ?? []) {
        const comps = COMBINED[proc.type];
        if (!comps || proc.chance <= 0) continue;
        const p = chancePct / 100;
        expectedExtra += proc.chance * p;
        for (const comp of comps) {
          const addChance = (proc.chance * p) / comps.length;
          if (addChance <= 0) continue;
          const existing = stats.statusProcs!.find((x) => x.type === comp);
          if (existing) {
            existing.chance += addChance;
          } else {
            stats.statusProcs!.push({
              type: comp,
              chance: addChance,
              damagePerTick: 0,
              duration: 6,
              ticks: 1,
              totalDamage: 0,
              description: `Debilitate component (${proc.type})`,
            });
          }
        }
      }
      trackBonus(stats, "debilitateExpectedExtra", expectedExtra * 100);
      return true;
    }

    case "exodia_hunt": {
      // wiki R3: On Ground Slam — 50% chance (constant) to pull enemies within 6–12m.
      // Paper: stacks>0 = slam. Zaw-only. CC panel (no DPS).
      const isZaw = /zaw/i.test(ctx.baseWeapon?.category ?? "");
      const chanceLine = findEffect(def, "pullChance");
      const radLine = findEffect(def, "pullRadius");
      const chance = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      const radius = radLine ? scaleArcaneEffectLine(radLine, rank, def.maxRank) : 0;
      trackBonus(stats, "pullChance", isZaw ? chance : 0);
      trackBonus(stats, "pullRadius", isZaw ? radius : 0);
      return true;
    }

    case "exodia_might": {
      // wiki R3: On Finisher Kill — 50% chance for +30% Life Steal for 8s.
      // Paper: stacks>0 = buff up. Zaw-only. Survivability panel (no DPS).
      const isZaw = /zaw/i.test(ctx.baseWeapon?.category ?? "");
      const chanceLine = findEffect(def, "lifeStealChance");
      const stealLine = findEffect(def, "lifeSteal");
      const durLine = findEffect(def, "buffDuration");
      const chance = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      const steal = stealLine ? scaleArcaneEffectLine(stealLine, rank, def.maxRank) : 0;
      const dur = durLine ? scaleArcaneEffectLine(durLine, rank, def.maxRank) : 8;
      trackBonus(stats, "lifeStealChance", isZaw ? chance : 0);
      trackBonus(stats, "lifeSteal", isZaw ? steal : 0);
      trackBonus(stats, "buffDuration", isZaw ? dur : 0);
      return true;
    }

    case "exodia_epidemic": {
      // wiki R3: After bullet jump/double jump slam — suspend wave, duration 1–4s.
      // Paper: stacks>0 = aerial slam. Zaw-only. CC panel (no DPS).
      const isZaw = /zaw/i.test(ctx.baseWeapon?.category ?? "");
      const durLine = findEffect(def, "epidemicSuspendDuration");
      const dur = durLine ? scaleArcaneEffectLine(durLine, rank, def.maxRank) : 0;
      trackBonus(stats, "epidemicSuspendDuration", isZaw ? dur : 0);
      return true;
    }

    case "primary_obstruct": {
      // wiki R5: On Magnetic status — jam enemy weapons within 15m; cooldown 60→10s.
      // Paper: stacks>0 = Magnetic status applied. Utility panel (no DPS).
      const radLine = findEffect(def, "weaponJamRadius");
      const cdLine = findEffect(def, "weaponJamCooldown");
      trackBonus(stats, "weaponJamRadius", radLine ? scaleArcaneEffectLine(radLine, rank, def.maxRank) : 0);
      trackBonus(stats, "weaponJamCooldown", cdLine ? scaleArcaneEffectLine(cdLine, rank, def.maxRank) : 0);
      return true;
    }

    default:
      return false;
  }
}

/** Per-arcane warframe handlers. */
export function applyCustomArcaneToWarframe(
  stats: WarframeCalculatedStats,
  ctx: ArcaneHandlerContext,
): boolean {
  const { arcaneId, def, rank, stacks } = ctx;
  const wfCtx = ctx.warframeCtx ?? {
    totalHealth: stats.totalHealth,
    totalShield: stats.totalShield,
    totalArmor: stats.totalArmor,
  };

  switch (arcaneId) {
    case "arcane_persistence": {
      stats.persistenceDamageCapPerSecond = getPersistenceDamageCap(rank, def.maxRank);
      stats.shieldsNullifiedByPersistence = true;
      return true;
    }

    case "arcane_battery": {
      // wiki: +0.05…0.30 Max Energy per Armor, capped at +1000 energy.
      const perArmor = scaledLine(def, findEffect(def, "energyPerArmor"), rank, stacks);
      const raw = perArmor * wfCtx.totalArmor;
      const capped = Math.min(1000, raw);
      stats.flatEnergyBonus += capped;
      trackBonus(stats, "energyPerArmor", perArmor);
      trackBonus(stats, "batteryEnergyBonus", capped);
      return true;
    }

    case "arcane_bellicose": {
      const perStep = scaledLine(def, findEffect(def, "abilityStrengthPerHealth"), rank, stacks);
      const step = findEffect(def, "abilityStrengthPerHealthStep")?.maxValue ?? 250;
      const steps = step > 0 ? Math.floor(wfCtx.totalHealth / step) : 0;
      stats.abilityStrength += (steps * perStep) / 100;
      trackBonus(stats, "abilityStrengthPerHealth", steps * perStep);
      return true;
    }

    case "arcane_expertise": {
      // wiki: shields += (Ability Strength − 100%) × conversion (R5 100%).
      // e.g. 150% STR → +50% shields at R5. Clamp: STR below 100% grants no penalty.
      const ratio = scaledLine(def, findEffect(def, "abilityStrengthToShield"), rank, stacks);
      const strAboveBase = Math.max(0, stats.abilityStrength - 1);
      const shieldPct = strAboveBase * (ratio / 100);
      stats.shieldBonus += shieldPct;
      trackBonus(stats, "abilityStrengthToShield", ratio);
      trackBonus(stats, "expertiseShieldBonus", shieldPct * 100);
      return true;
    }

    case "arcane_energize": {
      trackBonus(stats, "energyPickupChance", scaledLine(def, findEffect(def, "energyPickupChance"), rank, stacks));
      trackBonus(stats, "energyOrbBonus", scaledLine(def, findEffect(def, "energyOrbBonus"), rank, stacks));
      trackBonus(stats, "allyEnergyRadius", scaledLine(def, findEffect(def, "allyEnergyRadius"), rank, stacks));
      return true;
    }

    case "arcane_crepuscular": {
      // wiki R5: +30% Ability Strength while invisible. Paper: equipped = invisible (warframe path).
      const strLine = findEffect(def, "abilityStrength");
      const str = strLine ? scaleArcaneEffectLine(strLine, rank, def.maxRank) : 0;
      if (str > 0) stats.abilityStrength += str / 100;
      trackBonus(stats, "abilityStrength", str);
      // Final CM applies on weapons via weapon custom handler (not warframe totals).
      const cmLine = findEffect(def, "criticalMultiplier");
      if (cmLine) {
        trackBonus(stats, "criticalMultiplier", scaleArcaneEffectLine(cmLine, rank, def.maxRank));
      }
      return true;
    }

    case "pax_bolt": {
      // wiki R3: +30% STR / +30% EFF on next cast after kitgun HS kill. Paper: equipped = buff up.
      const strLine = findEffect(def, "abilityStrength");
      const str = strLine ? scaleArcaneEffectLine(strLine, rank, def.maxRank) : 0;
      if (str > 0) stats.abilityStrength += str / 100;
      trackBonus(stats, "abilityStrength", str);
      const effLine = findEffect(def, "abilityEfficiency");
      const eff = effLine ? scaleArcaneEffectLine(effLine, rank, def.maxRank) : 0;
      if (eff > 0) stats.abilityEfficiency += eff / 100;
      trackBonus(stats, "abilityEfficiency", eff);
      return true;
    }

    case "molt_vigor": {
      // wiki R5: +45% STR on next WF ability after Operator ability. Paper: equipped = buff up.
      const strLine = findEffect(def, "abilityStrength");
      const str = strLine ? scaleArcaneEffectLine(strLine, rank, def.maxRank) : 0;
      if (str > 0) stats.abilityStrength += str / 100;
      trackBonus(stats, "abilityStrength", str);
      return true;
    }

    case "arcane_concentration": {
      // wiki R5: +60% DUR for 3s after cast. Paper: equipped = buff up for next ability.
      const durLine = findEffect(def, "abilityDuration");
      const dur = durLine ? scaleArcaneEffectLine(durLine, rank, def.maxRank) : 0;
      if (dur > 0) stats.abilityDuration += dur / 100;
      trackBonus(stats, "abilityDuration", dur);
      const buffLine = findEffect(def, "buffDuration");
      if (buffLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(buffLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_sculptor": {
      // wiki R5: lock Ability Efficiency at 175% when creating an object. Paper: equipped = locked.
      const effLine = findEffect(def, "abilityEfficiency");
      const eff = effLine ? scaleArcaneEffectLine(effLine, rank, def.maxRank) : 0;
      if (eff > 0) stats.abilityEfficiency = eff / 100;
      trackBonus(stats, "abilityEfficiency", eff);
      return true;
    }

    case "arcane_tanker":
    case "arcane_ultimatum":
    case "arcane_guardian": {
      // Flat armor buffs (Tanker archgun / Ultimatum finisher / Guardian on-hit). Paper: equipped = up.
      const armorLine = findEffect(def, "flatArmorBonus");
      const armor = armorLine ? scaleArcaneEffectLine(armorLine, rank, def.maxRank) : 0;
      if (armor > 0) stats.flatArmorBonus += armor;
      trackBonus(stats, "flatArmorBonus", armor);
      for (const line of def.effects ?? []) {
        if (line.stat === "flatArmorBonus") continue;
        trackBonus(stats, line.stat, scaleArcaneEffectLine(line, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_reaper": {
      // wiki R5: +24 HP/s + +660 Armor on melee kill. Paper: equipped = buff up.
      const regenLine = findEffect(def, "healthRegenPerSec");
      const regen = regenLine ? scaleArcaneEffectLine(regenLine, rank, def.maxRank) : 0;
      if (regen > 0) stats.healthRegenPerSec += regen;
      trackBonus(stats, "healthRegenPerSec", regen);
      const armorLine = findEffect(def, "flatArmorBonus");
      const armor = armorLine ? scaleArcaneEffectLine(armorLine, rank, def.maxRank) : 0;
      if (armor > 0) stats.flatArmorBonus += armor;
      trackBonus(stats, "flatArmorBonus", armor);
      const buffLine = findEffect(def, "buffDuration");
      if (buffLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(buffLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_agility":
    case "arcane_consequence": {
      // wiki R5: +60% Parkour Velocity. Paper: equipped = buff up.
      const pvLine = findEffect(def, "parkourVelocity");
      const pv = pvLine ? scaleArcaneEffectLine(pvLine, rank, def.maxRank) : 0;
      if (pv > 0) stats.parkourVelocityBonus += pv / 100;
      trackBonus(stats, "parkourVelocity", pv);
      for (const line of def.effects ?? []) {
        if (line.stat === "parkourVelocity") continue;
        trackBonus(stats, line.stat, scaleArcaneEffectLine(line, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_double_back": {
      // wiki R5: +25% DR per maneuver stack (cap 3 → +75%). Folded into damageReduction after armor DR.
      const drLine = findEffect(def, "damageReduction");
      const perStack = drLine ? scaleArcaneEffectLine(drLine, rank, def.maxRank) : 0;
      const totalDr = perStack * Math.max(stacks, 1);
      trackBonus(stats, "damageReduction", totalDr);
      return true;
    }

    case "arcane_grace": {
      // wiki R5: 9% chance → regen 6% max HP/s. Paper: equipped = buff up.
      const amtLine = findEffect(def, "healthRegenAmount");
      const pct = amtLine ? scaleArcaneEffectLine(amtLine, rank, def.maxRank) : 0;
      const hp =
        stats.baseHealth * (1 + stats.healthBonus) + stats.flatHealthBonus;
      if (pct > 0) stats.healthRegenPerSec += (pct / 100) * hp;
      trackBonus(stats, "healthRegenAmount", pct);
      const chanceLine = findEffect(def, "healthRegenChance");
      if (chanceLine) {
        trackBonus(stats, "healthRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "arcane_victory": {
      // wiki R5: 75% on HS kill → +3% max HP/s for 9s. Paper: equipped = buff up.
      const regenLine = findEffect(def, "headshotHealthRegen");
      const pct = regenLine ? scaleArcaneEffectLine(regenLine, rank, def.maxRank) : 0;
      const hp =
        stats.baseHealth * (1 + stats.healthBonus) + stats.flatHealthBonus;
      if (pct > 0) stats.healthRegenPerSec += (pct / 100) * hp;
      trackBonus(stats, "headshotHealthRegen", pct);
      return true;
    }

    case "arcane_aegis": {
      // wiki R5: 3% on shield damage → +30% shield recharge for 12s (delay→0 while up).
      // Paper: equipped = buff up; additive to innate 5% recharge rate.
      const amtLine = findEffect(def, "shieldRegenAmount");
      const pct = amtLine ? scaleArcaneEffectLine(amtLine, rank, def.maxRank) : 0;
      if (pct > 0) stats.shieldRechargeBonus = (stats.shieldRechargeBonus ?? 0) + pct / 100;
      trackBonus(stats, "shieldRegenAmount", pct);
      const chanceLine = findEffect(def, "shieldRegenChance");
      if (chanceLine) {
        trackBonus(stats, "shieldRegenChance", scaleArcaneEffectLine(chanceLine, rank, def.maxRank));
      }
      return true;
    }

    case "theorem_infection": {
      // wiki R5: +24%/s companion+summon damage in Residual zone (cap 15 → +360%).
      const dmgLine = findEffect(def, "companionDamageRamp");
      const perStack = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      const total = perStack * Math.max(stacks, 1);
      trackBonus(stats, "companionDamageRamp", total);
      return true;
    }

    case "zid_an_asheir": {
      // wiki: SC buff is on weapons (weapon handler); warframe panel tracks charge + SC stacks.
      const scLine = findEffect(def, "statusChancePerHit");
      const perStack = scLine ? scaleArcaneEffectLine(scLine, rank, def.maxRank) : 0;
      trackBonus(stats, "statusChancePerHit", perStack * Math.max(stacks, 1));
      const chargeLine = findEffect(def, "tauronStrikeCharge");
      if (chargeLine) {
        trackBonus(stats, "tauronStrikeCharge", scaleArcaneEffectLine(chargeLine, rank, def.maxRank));
      }
      const durLine = findEffect(def, "buffDuration");
      if (durLine) {
        trackBonus(stats, "buffDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "magus_firewall": {
      // wiki R5: Operator Void Mode — 6×12.5% = 75% Operator DR. Does not affect Warframes.
      const drLine = findEffect(def, "damageReduction");
      const perParticle = drLine ? scaleArcaneEffectLine(drLine, rank, def.maxRank) : 0;
      trackBonus(stats, "operatorDamageReduction", perParticle * 6);
      const durLine = findEffect(def, "voidModeDamageReduction");
      if (durLine) {
        trackBonus(stats, "voidModeParticleDuration", scaleArcaneEffectLine(durLine, rank, def.maxRank));
      }
      return true;
    }

    case "magus_overload": {
      // wiki R5: Void Sling robotic → Electricity = 80% enemy max HP in 25m (not weapon %).
      const dmgLine = findEffect(def, "damage");
      const pct = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      trackBonus(stats, "overloadEnemyMaxHealthPercent", pct);
      trackBonus(stats, "overloadRadius", 25);
      return true;
    }

    case "magus_elevate": {
      // wiki: On Transference In — 95% chance (constant) to restore 50–300 Health to Warframe.
      // Operator → Warframe heal panel only (does not change Warframe max HP).
      const chanceLine = findEffect(def, "healthRegenChance");
      const healLine = findEffect(def, "operatorToWarframeHeal");
      const chance = chanceLine ? scaleArcaneEffectLine(chanceLine, rank, def.maxRank) : 0;
      const heal = healLine ? scaleArcaneEffectLine(healLine, rank, def.maxRank) : 0;
      trackBonus(stats, "healthRegenChance", chance);
      trackBonus(stats, "operatorToWarframeHeal", heal);
      trackBonus(stats, "elevateExpectedHeal", (chance / 100) * heal);
      return true;
    }

    case "magus_husk": {
      // wiki R5: +300 Operator Armor on Transference Out. Operator panel only.
      const armorLine = findEffect(def, "operatorArmor");
      const armor = armorLine ? scaleArcaneEffectLine(armorLine, rank, def.maxRank) : 0;
      trackBonus(stats, "operatorArmor", armor);
      return true;
    }

    case "magus_vigor": {
      // wiki R5: +600 Operator Health. Operator panel only (not Warframe HP).
      const hpLine = findEffect(def, "operatorHealth");
      const hp = hpLine ? scaleArcaneEffectLine(hpLine, rank, def.maxRank) : 0;
      trackBonus(stats, "operatorHealth", hp);
      return true;
    }

    case "magus_nourish": {
      // wiki R5: While Operator — restore 35 Health/s to Warframe.
      // Paper: equipped = Operator active → flat HP/s on Warframe regen.
      const healLine = findEffect(def, "operatorToWarframeHeal");
      const heal = healLine ? scaleArcaneEffectLine(healLine, rank, def.maxRank) : 0;
      if (heal > 0) stats.healthRegenPerSec += heal;
      trackBonus(stats, "operatorToWarframeHeal", heal);
      return true;
    }

    case "magus_repair": {
      // wiki R5: Void Mode — heal Warframes within 30m by 25% max HP/s.
      // Paper: equipped = Void Mode → % max HP/s into healthRegenPerSec.
      const pctLine = findEffect(def, "operatorToWarframeHeal");
      const pct = pctLine ? scaleArcaneEffectLine(pctLine, rank, def.maxRank) : 0;
      const healPerSec = (pct / 100) * wfCtx.totalHealth;
      if (healPerSec > 0) stats.healthRegenPerSec += healPerSec;
      trackBonus(stats, "operatorToWarframeHeal", pct);
      trackBonus(stats, "repairHealPerSec", healPerSec);
      const radLine = findEffect(def, "repairRadius");
      trackBonus(stats, "repairRadius", radLine ? scaleArcaneEffectLine(radLine, rank, def.maxRank) : 30);
      return true;
    }

    case "magus_replenish": {
      // wiki R5: On Void Sling — heal 30% Operator Health (guaranteed). Operator panel only.
      const healLine = findEffect(def, "operatorHealthRegen");
      const pct = healLine ? scaleArcaneEffectLine(healLine, rank, def.maxRank) : 0;
      trackBonus(stats, "operatorHealthRegen", pct);
      return true;
    }

    case "arcane_eruption":
    case "arcane_escapist":
    case "arcane_steadfast":
    case "arcane_truculence":
    case "emergence_dissipate":
    case "emergence_savior":
    case "magus_glitch":
    case "magus_revert":
    case "magus_cadence":
    case "magus_cloud":
    case "molt_reconstruct":
    case "theorem_contagion":
    case "zid_an_sek_eel":
    case "melee_vortex":
      trackAllEffects(stats, def, rank, stacks);
      return true;

    default:
      return false;
  }
}
