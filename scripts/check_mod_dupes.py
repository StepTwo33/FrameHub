#!/usr/bin/env python3
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
text = (ROOT / "src/data/mods.ts").read_text(encoding="utf-8")

mods: dict[str, dict] = {}
for block in re.finditer(
    r'\{\s*"id":\s*"([^"]+)"[\s\S]*?(?=\n  \},|\n  \{|\n\])',
    text,
    re.DOTALL,
):
    chunk = block.group(0)
    mid = re.search(r'"id":\s*"([^"]+)"', chunk)
    if not mid:
        continue
    mod_id = mid.group(1)
    name_m = re.search(r'"name":\s*"([^"]*)"', chunk)
    cat_m = re.search(r'"category":\s*"([^"]*)"', chunk)
    mods[mod_id] = {
        "name": name_m.group(1) if name_m else "",
        "category": cat_m.group(1) if cat_m else "",
    }

names = Counter(m["name"] for m in mods.values())
ids = Counter(mods.keys())
dups = {n: c for n, c in names.items() if c > 1}
id_dups = {i: c for i, c in ids.items() if c > 1}
print("Duplicate mod names:", dups)
print("Duplicate mod ids:", id_dups)
for mod_id, m in mods.items():
    if m["name"] == "Blazing Pillage":
        print(mod_id, m)
