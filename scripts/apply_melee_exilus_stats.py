#!/usr/bin/env python3
"""Fill melee Exilus mod stats (per-rank increments)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"

# per-rank increments; total at max rank = value * (maxRank + 1)
STATS_BY_ID: dict[str, dict[str, float]] = {
    "focused_defense": {"blockAngle": 5.0},  # +20° block angle at rank 3
    "masters_edge": {"damage": 10.0},  # +60% Tennokai damage at rank 5
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
    print(f"Updated stats on {updated} melee Exilus mods")


if __name__ == "__main__":
    main()
