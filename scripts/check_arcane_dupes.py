#!/usr/bin/env python3
import re
from collections import Counter
from pathlib import Path

text = (Path(__file__).resolve().parent.parent / "src/data/arcanes.ts").read_text(encoding="utf-8")
ids = re.findall(r'\bid:\s*"([^"]+)"', text)
names = re.findall(r'\bname:\s*"([^"]+)"', text)
print("Arcane count:", len(ids))
id_dups = {i: c for i, c in Counter(ids).items() if c > 1}
name_dups = {n: c for n, c in Counter(names).items() if c > 1}
print("Duplicate ids:", id_dups)
print("Duplicate names:", name_dups)
for n in names:
    if "blazing" in n.lower() or "pillage" in n.lower():
        print("match:", n)
