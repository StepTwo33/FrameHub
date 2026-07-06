#!/usr/bin/env python3
"""Apply known trigger corrections (Virtuos amps) to arcane-effects + manual overrides."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EFFECTS = ROOT / "src/data/arcane-effects.ts"
MANUAL = ROOT / "src/data/arcane-manual-overrides.json"
FIXES = ROOT / "scripts/arcane_trigger_fixes.json"
STAT_FIXES = {
    "virtuos_shadow": {"critChanceOnDamaged": "ampCritChance"},
}
BUFF_DURATIONS: dict[str, int] = {
    "virtuos_tempo": 8,
    "virtuos_ghost": 12,
    "virtuos_shadow": 12,
    "virtuos_strike": 4,
    "virtuos_fury": 4,
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


def ensure_buff_duration(effects: list[dict], arcane_id: str) -> None:
    duration = BUFF_DURATIONS.get(arcane_id)
    if duration is None:
        return
    if any(e.get("stat") == "buffDuration" for e in effects):
        return
    effects.append(
        {"stat": "buffDuration", "maxValue": duration, "flat": True, "constantAtAllRanks": True},
    )


def fix_effect_stats(effects: list[dict], arcane_id: str) -> None:
    mapping = STAT_FIXES.get(arcane_id, {})
    for line in effects:
        if line.get("stat") in mapping:
            line["stat"] = mapping[line["stat"]]


def main() -> None:
    fixes = json.loads(FIXES.read_text(encoding="utf-8"))
    effects = load_effects()
    manual = json.loads(MANUAL.read_text(encoding="utf-8"))
    changed = 0

    for arcane_id, trigger in fixes.items():
        if arcane_id not in effects:
            print(f"SKIP unknown: {arcane_id}")
            continue
        effects[arcane_id]["trigger"] = trigger
        fx = effects[arcane_id].get("effects") or []
        fix_effect_stats(fx, arcane_id)
        ensure_buff_duration(fx, arcane_id)
        effects[arcane_id]["effects"] = fx
        if arcane_id in manual:
            manual[arcane_id]["trigger"] = trigger
            mfx = manual[arcane_id].get("effects") or []
            fix_effect_stats(mfx, arcane_id)
            ensure_buff_duration(mfx, arcane_id)
            manual[arcane_id]["effects"] = mfx
            manual[arcane_id]["replace"] = True
        changed += 1
        print(f"  {arcane_id} -> {trigger}")

    for arcane_id, duration in BUFF_DURATIONS.items():
        if arcane_id in fixes:
            continue
        if arcane_id not in effects:
            continue
        fx = effects[arcane_id].get("effects") or []
        ensure_buff_duration(fx, arcane_id)
        effects[arcane_id]["effects"] = fx
        if arcane_id in manual:
            mfx = manual[arcane_id].get("effects") or []
            ensure_buff_duration(mfx, arcane_id)
            manual[arcane_id]["effects"] = mfx

    save_effects(effects)
    MANUAL.write_text(json.dumps(manual, indent=2) + "\n", encoding="utf-8")
    print(f"Updated triggers on {changed} arcanes")
    subprocess.run([sys.executable, str(ROOT / "scripts/fix_arcane_rank_scaling.py")], check=True)


if __name__ == "__main__":
    main()
