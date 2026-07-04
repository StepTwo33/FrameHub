#!/usr/bin/env python3
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EFFECTS = ROOT / "src/data/arcane-effects.ts"
ARCANES = ROOT / "src/data/arcanes.ts"

text = EFFECTS.read_text(encoding="utf-8")
# Strip to JSON object
obj_text = re.sub(r"^[\s\S]*?export const ARCANE_EFFECTS[^=]*=\s*", "", text).strip()
if obj_text.endswith(";"):
    obj_text = obj_text[:-1]
data = json.loads(obj_text)

missing_effects = []
for k, v in data.items():
    if not isinstance(v.get("effects"), list):
        missing_effects.append((k, v.get("name"), v.keys()))

names = Counter(v.get("name") for v in data.values())
dups = {n: c for n, c in names.items() if c > 1}

print(f"Total effect defs: {len(data)}")
print(f"Missing effects array: {len(missing_effects)}")
for x in missing_effects[:30]:
    print(" ", x)

print(f"Duplicate names in effects: {dups}")

arcane_text = ARCANES.read_text(encoding="utf-8")
arcane_names = re.findall(r'"name":\s*"([^"]+)"', arcane_text)
arcane_dups = {n: c for n, c in Counter(arcane_names).items() if c > 1}
print(f"Duplicate names in arcanes.ts: {arcane_dups}")
