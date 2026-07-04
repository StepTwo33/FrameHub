#!/usr/bin/env python3
"""
Legacy helper — prefer fix_augment_metadata.py (wiki Cost column).

Fixes warframe/archwing augments where drain clearly leaked from stats (>14 at R0).
"""

import re
from pathlib import Path

MODS_TS = Path(__file__).resolve().parents[1] / "src" / "data" / "mods.ts"


def should_fix(chunk: str) -> bool:
    if '"category": "augment"' not in chunk:
        return False
    sub_m = re.search(r'"subCategory":\s*"([^"]*)"', chunk)
    sub = sub_m.group(1) if sub_m else ""
    if sub == "weapon":
        return False
    drain_m = re.search(r'"drain":\s*(-?\d+(?:\.\d+)?)', chunk)
    if not drain_m:
        return False
    return float(drain_m.group(1)) > 14


def main() -> None:
    text = MODS_TS.read_text(encoding="utf-8")
    parts = re.split(r"(\n  \},\n)", text)
    fixed = 0
    out: list[str] = []

    for part in parts:
        if should_fix(part) and '"drain":' in part:
            drain_m = re.search(r'"drain":\s*(-?\d+(?:\.\d+)?)', part)
            if drain_m:
                part = part.replace(drain_m.group(0), '"drain": 6', 1)
                name_m = re.search(r'"name":\s*"([^"]+)"', part)
                print(f"  {drain_m.group(1):>6} -> 6  {name_m.group(1) if name_m else '?'}")
                fixed += 1
        out.append(part)

    if fixed:
        MODS_TS.write_text("".join(out), encoding="utf-8")
    print(f"\nFallback-fixed {fixed} augments with drain > 14.")


if __name__ == "__main__":
    main()
