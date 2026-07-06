#!/usr/bin/env python3
"""
Ensure arcane effect lines have correct R0 (baseValue) and R5 (maxValue) scaling.

Warframe arcanes (ranks 0..maxRank) scale linearly:
  R0 = baseValue (explicit) or maxValue / (maxRank + 1) [legacy formula]
  Rmax = maxValue

Stats that do NOT scale with arcane rank keep constantAtAllRanks=true.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EFFECTS = ROOT / "src/data/arcane-effects.ts"
MANUAL = ROOT / "src/data/arcane-manual-overrides.json"
REPORT = ROOT / "scripts/arcane_rank_verify.txt"

# Effect stats that are the same at every arcane rank (duration, radius, caps, flags).
CONSTANT_AT_ALL_RANKS = frozenset({
    "buffDuration",
    "cooldown",
    "allyEnergyRadius",
    "allyHealRadius",
    "voidTrapRadius",
    "voidTrapDuration",
    "voidTrapTetherCount",
    "voidStunDuration",
    "voidBlastRadius",
    "voidParticleCap",
    "freezeRadius",
    "aimGlideDuration",
    "energyCap",
    "abilityStrengthPerHealthStep",
    "damagePerArmorThreshold",
    "attackCount",
    "shieldRestorePercent",
    "zoneDuration",
    "zoneDamage",
    "zoneDamagePerSec",
    "debilitateStackThreshold",
    "escapistStackCap",
    "invulnerabilityDuration",
    "lethalInvulnDuration",
    "dissipateRadius",
    "voidMoteEnergy",
    "pullRadius",
    "comboDuration",
    "revertWindow",
    "revertHeal",
    "weaponJamRadius",
    "weaponJamCooldown",
    "overguardThreshold",
    "radialAttackRadius",
    "invisibilityDuration",
    "projectileOnAimGlide",
    "shockwaveOnSlam",
    "contagionExplosionRadius",
    "epidemicSuspendDuration",
    "removeShields",
    "utilityEffect",
    "coldStacksApplied",
    "kitgunHoming",
    "healPerEnergySpent",
    "meleeComboInitial",
    "statusStackBonus",
    "voidConversion",
    "voidPullRadius",
    "bigCritThreshold",
    "procAuraRadius",
    "zoneRadius",
    "healthOrbPulse",
})

# Arcane Persistence damage cap by rank (wiki).
PERSISTENCE_CAP_BY_RANK = [750, 700, 650, 600, 550, 500]

# Exodia arcanes — post Update 31.6 mixed constant/scaling stats (wiki rank tables).
EXODIA_VALUES_BY_RANK: dict[str, dict[str, list[float]]] = {
    "exodia_brave": {
        "energyRegen": [1.25, 2.5, 3.75, 5.0],
        "buffDuration": [4, 4, 4, 4],
    },
    "exodia_contagion": {
        "contagionProjectileDamage": [100, 200, 300, 400],
        "contagionExplosionRadius": [8, 8, 8, 8],
    },
    "exodia_epidemic": {
        "epidemicSuspendDuration": [1, 2, 3, 4],
    },
    "exodia_force": {
        "statusProcChance": [50, 50, 50, 50],
        "procDamageMultiplier": [50, 100, 150, 200],
        "procAuraRadius": [6, 6, 6, 6],
    },
    "exodia_hunt": {
        "pullChance": [50, 50, 50, 50],
        "pullRadius": [6, 8, 10, 12],
    },
    "exodia_might": {
        "lifeStealChance": [50, 50, 50, 50],
        "lifeSteal": [7.5, 15, 22.5, 30],
        "buffDuration": [8, 8, 8, 8],
    },
    "exodia_triumph": {
        "meleeComboChance": [12.5, 25, 37.5, 50],
    },
    "exodia_valor": {
        "meleeComboChance": [50, 100, 150, 200],
    },
    "pax_bolt": {
        "abilityEfficiency": [7.5, 15, 22.5, 30],
        "abilityStrength": [7.5, 15, 22.5, 30],
        "buffDuration": [4, 4, 4, 4],
    },
    "pax_charge": {
        "kitgunRecharge": [12.5, 25, 37.5, 50],
    },
    "pax_seeker": {
        "kitgunHoming": [1, 2, 3, 4],
    },
    "pax_soar": {
        "airborneAccuracy": [12.5, 25, 37.5, 50],
        "airborneRecoilReduction": [12.5, 25, 37.5, 50],
        "aimGlideDuration": [1.3, 2.5, 3.8, 5],
    },
    "residual_boils": {
        "killProcChance": [20, 20, 20, 20],
        "zoneDuration": [3, 6, 9, 12],
        "zoneDamage": [80, 80, 80, 80],
        "zoneRadius": [10, 10, 10, 10],
    },
    "residual_malodor": {
        "killProcChance": [20, 20, 20, 20],
        "zoneDuration": [3, 6, 9, 12],
        "zoneDamagePerSec": [40, 40, 40, 40],
        "zoneRadius": [9, 9, 9, 9],
    },
    "residual_shock": {
        "killProcChance": [20, 20, 20, 20],
        "zoneDuration": [3, 6, 9, 12],
        "zoneDamage": [200, 200, 200, 200],
        "zoneRadius": [10, 10, 10, 10],
    },
    "residual_viremia": {
        "killProcChance": [20, 20, 20, 20],
        "zoneDuration": [3, 6, 9, 12],
        "zoneDamagePerSec": [40, 40, 40, 40],
        "zoneRadius": [9, 9, 9, 9],
    },
}


def load_effects() -> dict:
    text = EFFECTS.read_text(encoding="utf-8")
    start = text.index("{", text.index("ARCANE_EFFECTS"))
    end = text.rindex(";")
    return json.loads(text[start:end])


def save_effects(data: dict) -> None:
    header = EFFECTS.read_text(encoding="utf-8").split("export const ARCANE_EFFECTS")[0]
    body = json.dumps(data, indent=2)
    EFFECTS.write_text(header + "export const ARCANE_EFFECTS: Record<string, ArcaneEffectDef> = " + body + ";\n", encoding="utf-8")


def r0_value(line: dict, max_rank: int) -> float:
    if line.get("constantAtAllRanks"):
        return line["maxValue"]
    if line.get("valuesByRank"):
        return line["valuesByRank"][0]
    if line.get("baseValue") is not None:
        return line["baseValue"]
    return line["maxValue"] / (max_rank + 1)


def rmax_value(line: dict, max_rank: int) -> float:
    if line.get("valuesByRank"):
        arr = line["valuesByRank"]
        return arr[min(max_rank, len(arr) - 1)]
    return line["maxValue"]


def fix_line(line: dict, max_rank: int, arcane_id: str) -> tuple[dict, list[str]]:
    notes: list[str] = []
    stat = line["stat"]
    out = {k: v for k, v in line.items() if k not in ("baseValue", "constantAtAllRanks", "valuesByRank")}

    if arcane_id == "arcane_persistence" and stat == "persistenceDamageCapPerSecond":
        out["valuesByRank"] = PERSISTENCE_CAP_BY_RANK
        out["flat"] = True
        notes.append(f"{arcane_id}.{stat}: valuesByRank {PERSISTENCE_CAP_BY_RANK}")
        return out, notes

    exodia_ranks = EXODIA_VALUES_BY_RANK.get(arcane_id, {}).get(stat)
    if exodia_ranks:
        out["valuesByRank"] = exodia_ranks
        out["maxValue"] = exodia_ranks[-1]
        if line.get("flat"):
            out["flat"] = True
        if line.get("stacking"):
            out["stacking"] = line["stacking"]
        notes.append(f"{arcane_id}.{stat}: valuesByRank {exodia_ranks}")
        return out, notes

    should_constant = stat in CONSTANT_AT_ALL_RANKS

    if should_constant:
        out["constantAtAllRanks"] = True
        if line.get("baseValue") is not None:
            notes.append(f"{arcane_id}.{stat}: removed baseValue (constant stat)")
    else:
        # Scales with arcane rank — explicit baseValue for R0
        mx = float(line["maxValue"])
        base = round(mx / (max_rank + 1), 6)
        # Clean integers when close
        if abs(base - round(base)) < 1e-6:
            base = float(round(base))
        if abs(mx - round(mx)) < 1e-6:
            mx = float(round(mx))
        out["maxValue"] = mx
        out["baseValue"] = base
        if line.get("constantAtAllRanks"):
            notes.append(f"{arcane_id}.{stat}: removed constantAtAllRanks (scales R0={base} R{max_rank}={mx})")

    for k in ("flat", "stacking"):
        if k in line:
            out[k] = line[k]
    return out, notes


def main() -> None:
    effects = load_effects()
    all_notes: list[str] = []
    report_lines: list[str] = []

    for aid, defn in sorted(effects.items()):
        max_rank = defn.get("maxRank", 5)
        fixed_effects = []
        for line in defn.get("effects", []):
            fixed, notes = fix_line(line, max_rank, aid)
            fixed_effects.append(fixed)
            all_notes.extend(notes)
            r0 = r0_value(fixed, max_rank)
            rm = rmax_value(fixed, max_rank)
            report_lines.append(
                f"{aid}\t{fixed['stat']}\tR0={r0}\tR{max_rank}={rm}\t"
                f"{'const' if fixed.get('constantAtAllRanks') else 'scale'}"
            )
        defn["effects"] = fixed_effects

    save_effects(effects)
    REPORT.write_text("\n".join(report_lines) + "\n", encoding="utf-8")
    print(f"Fixed {len(effects)} arcanes, {len(all_notes)} line adjustments")
    print(f"Report: {REPORT}")
    for n in all_notes[:40]:
        print(f"  {n}")
    if len(all_notes) > 40:
        print(f"  ... and {len(all_notes) - 40} more")


if __name__ == "__main__":
    main()
