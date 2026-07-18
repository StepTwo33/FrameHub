#!/usr/bin/env python3
"""Audit arcane effect stats vs display labels (policy sets removed; behaviors own apply rules)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
effects_text = (ROOT / "src/data/arcane-effects.ts").read_text(encoding="utf-8")
arcane_stats = set(re.findall(r'"stat":\s*"([^"]+)"', effects_text))

print("Arcane effect stats:", len(arcane_stats))

display_text = (ROOT / "src/lib/arcane-display.ts").read_text(encoding="utf-8")
label_block = display_text.split("const STAT_LABELS")[1].split("};")[0]
display_labels = set(re.findall(r"^\s+(\w+):", label_block, re.M))
missing = sorted(arcane_stats - display_labels)
print(f"Missing display labels ({len(missing)}):")
for s in missing:
    print(f"  {s}")
