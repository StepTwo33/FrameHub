#!/usr/bin/env python3
"""Compare arcane-effects maxValues against arcanes.ts legacy stats (source of truth for max rank)."""

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
ARCANES_TS = REPO / "src" / "data" / "arcanes.ts"
EFFECTS_TS = REPO / "src" / "data" / "arcane-effects.ts"


def load_legacy_stats() -> dict[str, dict[str, float]]:
    text = ARCANES_TS.read_text(encoding="utf-8")
    out: dict[str, dict[str, float]] = {}
    for m in re.finditer(
        r'id:\s*"([^"]+)".*?stats:\s*\{([^}]*)\}',
        text,
        re.S,
    ):
        aid = m.group(1)
        stats_block = m.group(2).strip()
        if not stats_block:
            continue
        stats: dict[str, float] = {}
        for sm in re.finditer(r"(\w+):\s*([\d.]+)", stats_block):
            stats[sm.group(1)] = float(sm.group(2))
        out[aid] = stats
    return out


def load_effects() -> dict[str, list[dict]]:
    text = EFFECTS_TS.read_text(encoding="utf-8")
    out: dict[str, list[dict]] = {}
    for m in re.finditer(r'"([^"]+)":\s*\{', text):
        aid = m.group(1)
        start = m.end() - 1
        depth = 0
        i = start
        while i < len(text):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    block = text[start : i + 1]
                    break
            i += 1
        else:
            continue
        effects = [
            {"stat": s, "maxValue": float(v)}
            for s, v in re.findall(r'"stat":\s*"([^"]+)",\s*"maxValue":\s*([\d.]+)', block)
        ]
        out[aid] = effects
    return out


def main() -> None:
    legacy = load_legacy_stats()
    effects = load_effects()
    mismatches = []
    for aid, lstats in sorted(legacy.items()):
        eff = {e["stat"]: e["maxValue"] for e in effects.get(aid, [])}
        for stat, val in lstats.items():
            if stat not in eff:
                mismatches.append(f"{aid}: legacy stat {stat}={val} missing from effects")
            elif abs(eff[stat] - val) > 0.01:
                mismatches.append(f"{aid}: {stat} legacy={val} effects={eff[stat]}")
        # Extra effect stats not in legacy (informational)
    print(f"Arcanes with legacy stats: {len(legacy)}")
    print(f"Mismatches vs legacy stats: {len(mismatches)}")
    for m in mismatches:
        print(f"  ! {m}")


if __name__ == "__main__":
    main()
