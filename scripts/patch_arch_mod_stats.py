#!/usr/bin/env python3
"""Patch arch-melee and arch-gun mod stats in mods.ts from wiki-aligned per-rank values."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS = ROOT / "src" / "data" / "mods.ts"

# Per-rank stat constants: modValue = (value * (rank + 1)) / 100 at equipped rank.
PATCHES: dict[str, dict[str, float | int]] = {
    # Arch-melee
    "searing_steel": {"heat": 15, "statusChance": 15},
    "extend": {"range": 25},  # +25m attraction per rank (melee +0.75m/rank is flat; range ignored in calc)
    # Arch-gun
    "magma_chamber": {"heat": 15, "statusChance": 15},
    "containment_breach": {"radiation": 15, "multishot": 7.5},
    "critical_focus": {"criticalChance": 10, "criticalMultiplier": 10},
    "shell_rush": {"fireRate": 12.5},  # charge rate; mapped to fireRate until charge time is modeled
}


def format_stats(stats: dict[str, float | int]) -> str:
    lines = [f'      "{k}": {v}' for k, v in stats.items()]
    return "{\n" + ",\n".join(lines) + "\n    }"


def patch_mod(content: str, mod_id: str, stats: dict[str, float | int]) -> str:
    stats_block = format_stats(stats)
    pattern = rf'("id": "{mod_id}",.*?"stats": )\{{[^}}]*\}}'
    new_content, n = re.subn(pattern, rf"\1{stats_block}", content, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"Failed to patch {mod_id} ({n} matches)")
    return new_content


def main() -> None:
    content = MODS.read_text(encoding="utf-8")
    for mod_id, stats in PATCHES.items():
        content = patch_mod(content, mod_id, stats)
        print(f"Patched {mod_id}: {stats}")
    MODS.write_text(content, encoding="utf-8")
    print(f"Updated {len(PATCHES)} mods in {MODS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
