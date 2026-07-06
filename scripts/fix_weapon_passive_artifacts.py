#!/usr/bin/env python3
"""Strip wiki table junk accidentally synced into weapon-passives.ts strings."""
from __future__ import annotations

import re
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "src/data/weapon-passives.ts"
text = PATH.read_text(encoding="utf-8")

fixed = 0


def clean_value(s: str) -> str:
    global fixed
    if " |}" not in s and "</tabber>" not in s:
        return s
    new = re.sub(r"\s*\|\}.*$", "", s, flags=re.S)
    new = re.sub(r"\s*</tabber>.*$", "", new, flags=re.S)
    if new != s:
        fixed += 1
    return new.strip()


def repl_double(m: re.Match[str]) -> str:
    key, val = m.group(1), m.group(2)
    cleaned = clean_value(val.replace("\\n", "\n")).replace("\n", "\\n")
    return f'  {key}: "{cleaned}"'


# Only clean WIKI_PASSIVES double-quoted entries (not template literals)
out = re.sub(
    r'^(\s+)([a-z0-9_&]+):\s*"((?:[^"\\]|\\.)*)"',
    lambda m: f'{m.group(1)}{m.group(2)}: "{clean_value(m.group(3).replace(chr(92)+"n", chr(10))).replace(chr(10), chr(92)+"n")}"',
    text,
    flags=re.M,
)

PATH.write_text(out, encoding="utf-8")
print(f"Cleaned {fixed} passive strings with wiki artifacts")
