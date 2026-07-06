#!/usr/bin/env python3
"""Fill empty stats on companion mods (one-time catalog pass)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"

# per-rank increments; total at max rank = value * (maxRank + 1)
STATS_BY_ID: dict[str, dict[str, float]] = {
    "detect_vulnerability": {"weakspotDamage": 275.0 / 6},
    "bell_ringer": {"impactStatusStacks": 1.0},
    "helminth_ferocity": {"finisherDamage": 20.0},
    "loyal_retriever": {"pickupDoubleChance": 13.0 / 6},
    "prosperous_retriever": {"creditPickupDoubleChance": 3.0},
    "resourceful_retriever": {"resourcePickupDoubleChance": 3.0},
    "shelter": {"reviveShieldHealth": 1800.0 / 11},
    "tractor_beam": {"aimGlideDuration": 25.0, "gravityReduction": -12.5},
}


def main() -> None:
    text = MODS_TS.read_text(encoding="utf-8")
    m = re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text)
    if not m:
        raise RuntimeError("allMods block not found")
    mods = json.loads(m.group(1))
    updated = 0
    for mod in mods:
        stats = STATS_BY_ID.get(mod["id"])
        if not stats:
            continue
        mod["stats"] = stats
        updated += 1
    prefix = 'import { Mod } from "@/lib/types";\n\nexport const allMods: Mod[] = '
    suffix_m = re.search(r";\s*\nexport const modsMap", text)
    if not suffix_m:
        raise RuntimeError("modsMap export not found")
    MODS_TS.write_text(prefix + json.dumps(mods, indent=2) + text[suffix_m.start():], encoding="utf-8")
    print(f"Updated stats on {updated} companion mods")


if __name__ == "__main__":
    main()
