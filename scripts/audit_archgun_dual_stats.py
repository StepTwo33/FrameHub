#!/usr/bin/env python3
"""Report arch-gun mods whose description implies multiple bonuses but stats object is incomplete."""

from __future__ import annotations

import re
from pathlib import Path

MODS = Path(__file__).resolve().parents[1] / "src" / "data" / "mods.ts"

# Description keywords that usually map to a stat key in our schema.
HINTS = [
    ("heat", "heat"),
    ("cold", "cold"),
    ("toxin", "toxin"),
    ("electricity", "electricity"),
    ("radiation", "radiation"),
    ("magnetic", "magnetic"),
    ("impact", "impact"),
    ("puncture", "puncture"),
    ("slash", "slash"),
    ("critical damage", "criticalMultiplier"),
    ("critical chance", "criticalChance"),
    ("status chance", "statusChance"),
    ("multishot", "multishot"),
    ("fire rate", "fireRate"),
    ("charge rate", "fireRate"),
    ("reload speed", "reloadSpeed"),
    ("magazine", "magazine"),
    ("damage", "damage"),
    ("punch through", "punchThrough"),
    ("range", "range"),
]


def main() -> None:
    content = MODS.read_text(encoding="utf-8")
    chunks = re.split(r'(?=\{\s*\n\s*"id": )', content)
    issues = []
    for chunk in chunks:
        if '"category": "archgun"' not in chunk:
            continue
        idm = re.search(r'"id": "([^"]+)"', chunk)
        if not idm:
            continue
        mod_id = idm.group(1)
        desc = re.search(r'"description": "([^"]*)"', chunk)
        stats = re.search(r'"stats": (\{[^}]*\})', chunk)
        description = (desc.group(1) if desc else "").lower()
        stat_text = stats.group(1) if stats else "{}"
        present = set(re.findall(r'"([^"]+)":', stat_text))
        expected = {key for needle, key in HINTS if needle in description}
        # Ignore utility/conditional lines
        if "on " in description or "when aiming" in description:
            expected.discard("fireRate")
        missing = sorted(expected - present)
        if missing:
            issues.append((mod_id, missing, description[:80]))
    print(f"Archgun mods with likely missing stats: {len(issues)}")
    for mod_id, missing, desc in issues:
        print(f"  {mod_id}: missing {missing} — {desc}")


if __name__ == "__main__":
    main()
