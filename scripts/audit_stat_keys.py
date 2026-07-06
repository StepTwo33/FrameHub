#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
effects_text = (ROOT / "src/data/arcane-effects.ts").read_text(encoding="utf-8")
arcane_stats = set(re.findall(r'"stat":\s*"([^"]+)"', effects_text))

policy_text = (ROOT / "src/lib/arcane-apply-policy.ts").read_text(encoding="utf-8")
sets = {}
for name in ("WEAPON_BONUS_ONLY_STATS", "WEAPON_PASSIVE_BUILD_STATS", "WARFRAME_BONUS_ONLY_STATS", "WARFRAME_PASSIVE_BUILD_STATS"):
    m = re.search(rf"export const {name} = new Set\(\[(.*?)\]\)", policy_text, re.S)
    if m:
        sets[name] = {x.strip().strip('"') for x in re.findall(r'"([^"]+)"', m.group(1))}

all_policy = set().union(*sets.values())
missing = sorted(arcane_stats - all_policy)
print("In policy sets:", len(all_policy))
print("Arcane effect stats:", len(arcane_stats))
print(f"Missing from ALL policy sets ({len(missing)}):")
for s in missing:
    print(f"  {s}")

display_text = (ROOT / "src/lib/arcane-display.ts").read_text(encoding="utf-8")
label_block = display_text.split("const STAT_LABELS")[1].split("};")[0]
display_labels = set(re.findall(r"^\s+(\w+):", label_block, re.M))
print(f"\nMissing display labels ({len(arcane_stats - display_labels)}):")
for s in sorted(arcane_stats - display_labels):
    print(f"  {s}")
