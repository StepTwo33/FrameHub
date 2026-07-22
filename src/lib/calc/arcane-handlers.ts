import { ArcaneEffectDef, ArcaneEffectLine } from "@/data/arcane-effects";
import { getPersistenceDamageCap, scaleArcaneEffectLine } from "@/lib/calc/arcane-utils";
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
  "arcane_fury",
  "arcane_precision",
  "arcane_blade_charger",
  "arcane_arachne",
  "secondary_surge",
  "zid_an_uskos",
  "primary_plated_round",
  "exodia_brave",
  "exodia_force",
  "exodia_hunt",
  "exodia_might",
  "exodia_contagion",
  "exodia_epidemic",
  "exodia_triumph",
  "exodia_valor",
]);

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
  "magus_destruct",
  "magus_glitch",
  "magus_repair",
  "magus_revert",
  "magus_cadence",
  "magus_cloud",
  "molt_reconstruct",
  "theorem_contagion",
  "theorem_infection",
  "zid_an_asheir",
  "zid_an_sek_eel",
  "melee_vortex",
  "primary_debilitate",
  "primary_obstruct",
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
  if (stacks <= 0) return true;

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
    case "arcane_rage": {
      // Awakening: +150% secondary dmg on reload. Rage: +180% primary dmg on headshot.
      // Data stores as holsterDamage — apply as weapon damage (paper: stacks>0 = buff up).
      const dmgLine = findEffect(def, "holsterDamage") ?? findEffect(def, "damage");
      const dmg = dmgLine ? scaleArcaneEffectLine(dmgLine, rank, def.maxRank) : 0;
      if (dmg > 0) applyWeaponDamageMult(stats, dmg);
      trackBonus(stats, "holsterDamage", dmg);
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
      trackBonus(stats, "secondaryHeatDamage", scaledLine(def, findEffect(def, "secondaryHeatDamage"), rank, stacks));
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

    case "exodia_force":
    case "exodia_hunt":
    case "exodia_might":
    case "exodia_contagion":
    case "exodia_epidemic":
    case "exodia_triumph":
    case "exodia_valor":
      trackAllEffects(stats, def, rank, stacks);
      return true;

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
      const perArmor = scaledLine(def, findEffect(def, "energyPerArmor"), rank, stacks);
      stats.flatEnergyBonus += perArmor * wfCtx.totalArmor;
      trackBonus(stats, "energyPerArmor", perArmor);
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
      const ratio = scaledLine(def, findEffect(def, "abilityStrengthToShield"), rank, stacks);
      stats.abilityStrength += (wfCtx.totalShield * ratio) / 100 / 100;
      trackBonus(stats, "abilityStrengthToShield", ratio);
      return true;
    }

    case "arcane_energize": {
      trackBonus(stats, "energyPickupChance", scaledLine(def, findEffect(def, "energyPickupChance"), rank, stacks));
      trackBonus(stats, "energyOrbBonus", scaledLine(def, findEffect(def, "energyOrbBonus"), rank, stacks));
      trackBonus(stats, "allyEnergyRadius", scaledLine(def, findEffect(def, "allyEnergyRadius"), rank, stacks));
      return true;
    }

    case "arcane_crepuscular": {
      // While invisible — tracked for panel; not applied to passive totals without sim toggle.
      trackBonus(stats, "abilityStrength", scaledLine(def, findEffect(def, "abilityStrength"), rank, stacks));
      trackBonus(stats, "criticalMultiplier", scaledLine(def, findEffect(def, "criticalMultiplier"), rank, stacks));
      return true;
    }

    case "arcane_eruption":
    case "arcane_escapist":
    case "arcane_steadfast":
    case "arcane_truculence":
    case "emergence_dissipate":
    case "emergence_savior":
    case "magus_destruct":
    case "magus_glitch":
    case "magus_repair":
    case "magus_revert":
    case "magus_cadence":
    case "magus_cloud":
    case "molt_reconstruct":
    case "theorem_contagion":
    case "theorem_infection":
    case "zid_an_asheir":
    case "zid_an_sek_eel":
    case "melee_vortex":
    case "primary_debilitate":
    case "primary_obstruct":
      trackAllEffects(stats, def, rank, stacks);
      return true;

    default:
      return false;
  }
}
