#!/usr/bin/env python3
import re
from pathlib import Path

text = Path(__file__).resolve().parents[1] / "src" / "data" / "mods.ts"
content = text.read_text(encoding="utf-8")
# Split on mod objects crudely
parts = content.split('"category": "archgun"')
empty = []
with_stats = []
for i, part in enumerate(parts[1:], 1):
    chunk = parts[i - 1][-800:] + '"category": "archgun"' + part[:400]
    idm = re.search(r'"id": "([^"]+)"', chunk)
    name = re.search(r'"name": "([^"]+)"', chunk)
    stats = re.search(r'"stats": (\{[^}]*\})', part[:200])
    if not idm:
        continue
    sid = idm.group(1)
    sname = name.group(1) if name else "?"
    st = stats.group(1) if stats else "{}"
    if st.strip() in ("{}", "{ }"):
        empty.append((sid, sname))
    else:
        with_stats.append((sid, sname))

print(f"Archgun mods with stats: {len(with_stats)}")
print(f"Archgun mods EMPTY stats: {len(empty)}")
for sid, sname in sorted(empty):
    print(f"  {sid} - {sname}")
