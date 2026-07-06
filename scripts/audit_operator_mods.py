#!/usr/bin/env python3
"""Audit operator / amp mods: behaviors, stats."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODS_TS = ROOT / "src/data/mods.ts"
BEHAVIOR_DIR = ROOT / "src/data/mod-behaviors"


def load_mods() -> list[dict]:
    mods = []
    for chunk in re.split(r"\n  \},\n", MODS_TS.read_text(encoding="utf-8")):
        mid = re.search(r'"id":\s*"([^"]+)"', chunk)
        if not mid:
            continue

        def grab(key: str, default: str = "") -> str:
            m = re.search(rf'"{key}":\s*"([^"]*)"', chunk)
            return m.group(1) if m else default

        mr_m = re.search(r'"maxRank":\s*(\d+)', chunk)
        stats_block = re.search(r'"stats":\s*\{([^}]*)\}', chunk, re.S)
        stats: dict[str, float] = {}
        if stats_block and stats_block.group(1).strip():
            for sm in re.finditer(r'"([^"]+)":\s*(-?[\d.]+)', stats_block.group(1)):
                stats[sm.group(1)] = float(sm.group(2))
        mods.append({
            "id": mid.group(1),
            "name": grab("name"),
            "category": grab("category"),
            "maxRank": int(mr_m.group(1)) if mr_m else 0,
            "stats": stats,
        })
    return mods


def load_behaviors() -> dict[str, dict]:
    out: dict[str, dict] = {}
    key_re = r'(?:"[^"]+"|\w+)'
    for path in BEHAVIOR_DIR.rglob("*.ts"):
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(
            rf'({key_re}):\s*mod\("([^"]+)"\s*,\s*\[([\s\S]*?)\](?:\s*,\s*"([^"]*)")?\)',
            text,
        ):
            out[m.group(2)] = {
                "statKeys": re.findall(r'line\("([^"]+)"', m.group(3)),
                "descriptionOnly": bool(m.group(4)),
                "file": path.name,
            }
        for m in re.finditer(
            rf'({key_re}):\s*mod\("([^"]+)"\s*,\s*\[\s*\]\s*,\s*"([^"]*)"\)',
            text,
        ):
            out[m.group(2)] = {"statKeys": [], "descriptionOnly": True, "file": path.name}
    return out


def main() -> None:
    mods = load_mods()
    behaviors = load_behaviors()
    pool = [m for m in mods if m["category"] == "operator"]
    amp = [m for m in pool if m["id"].startswith("amp_") or "amp" in m["name"].lower()]

    print("=== Operator / amp mod audit ===\n")
    print(f"Operator pool: {len(pool)}")
    print(f"  Amp-named: {len(amp)}")

    missing_behavior = [m for m in pool if m["id"] not in behaviors]
    print(f"\nBehavior coverage: {len(pool) - len(missing_behavior)}/{len(pool)}")
    for m in sorted(missing_behavior, key=lambda x: x["name"]):
        print(f"  MISSING: {m['id']} ({m['name']})")

    no_stats = [m for m in pool if not m["stats"] and m.get("maxRank", 0) > 0]
    print(f"\nEmpty stats (ranked): {len(no_stats)}")
    for m in sorted(no_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {m['name']}")

    has_stats = [m for m in pool if m["stats"]]
    print(f"\nMods with catalog stats: {len(has_stats)}")
    for m in sorted(has_stats, key=lambda x: x["name"]):
        print(f"  {m['id']}: {list(m['stats'].keys())}")

    desc_only = [m for m in pool if behaviors.get(m["id"], {}).get("descriptionOnly")]
    print(f"\nDescription-only behaviors: {len(desc_only)} (expected for operator amps)")

    stats_no_lines = []
    for m in pool:
        beh = behaviors.get(m["id"])
        if not beh or beh.get("descriptionOnly"):
            continue
        missing = set(m["stats"]) - set(beh["statKeys"])
        if missing:
            stats_no_lines.append(f"{m['id']}: missing {sorted(missing)}")
    print(f"\nCatalog stats missing behavior lines: {len(stats_no_lines)}")
    for line in sorted(stats_no_lines):
        print(f"  {line}")


if __name__ == "__main__":
    main()
