#!/usr/bin/env python3
"""Apply axel-shade verified override export into static arcane/mod data."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from stat_label_map import normalize_arcane_effect_fields

ROOT = Path(__file__).resolve().parent.parent
EFFECTS_TS = ROOT / "src/data/arcane-effects.ts"
MANUAL_JSON = ROOT / "src/data/arcane-manual-overrides.json"
ARCANES_TS = ROOT / "src/data/arcanes.ts"
MODS_TS = ROOT / "src/data/mods.ts"
DEFAULT_EXPORT = Path.home() / "Downloads/message.txt"


def load_effects() -> dict:
    text = EFFECTS_TS.read_text(encoding="utf-8")
    start = text.index("{", text.index("ARCANE_EFFECTS"))
    end = text.rindex(";")
    return json.loads(text[start:end])


def save_effects(data: dict) -> None:
    header = EFFECTS_TS.read_text(encoding="utf-8").split("export const ARCANE_EFFECTS")[0]
    body = json.dumps(data, indent=2)
    EFFECTS_TS.write_text(header + "export const ARCANE_EFFECTS: Record<string, ArcaneEffectDef> = " + body + ";\n", encoding="utf-8")


def escape_ts_string(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "")
    )


def format_ts_stats(stats: dict) -> str:
    if not stats:
        return "{}"
    inner = ", ".join(f'"{k}": {json.dumps(v)}' for k, v in stats.items())
    return "{" + inner + "}"


def patch_arcane_catalog(content: str, arcane_id: str, fields: dict) -> str:
    pattern = rf'(id:\s*"{re.escape(arcane_id)}",[\s\S]*?stats:\s*)(\{{[^}}]*\}})(\s*,\s*\n\s*description:\s*)("(?:[^"\\]|\\.)*")'
    match = re.search(pattern, content)
    if not match:
        print(f"  WARN: arcane block not found: {arcane_id}")
        return content

    stats = fields.get("stats")
    description = fields.get("description")
    prefix, old_stats, desc_key, old_desc = match.groups()

    new_stats = format_ts_stats(stats) if stats is not None else old_stats
    if description is not None:
        new_desc = f'"{escape_ts_string(description)}"'
    else:
        new_desc = old_desc

    replacement = prefix + new_stats + desc_key + new_desc
    return content[: match.start()] + replacement + content[match.end() :]


def patch_mod(content: str, mod_id: str, fields: dict) -> str:
    pattern = rf'(\{{\s*\n\s*"id":\s*"{re.escape(mod_id)}",[\s\S]*?)'
    match = re.search(pattern, content)
    if not match:
        print(f"  WARN: mod block not found: {mod_id}")
        return content

    block_start = match.start()
    block_end = content.find("\n  },", match.end())
    if block_end == -1:
        print(f"  WARN: mod block end not found: {mod_id}")
        return content
    block_end += len("\n  },")
    block = content[block_start:block_end]

    for key in ("name", "category", "maxRank", "description"):
        if key not in fields:
            continue
        val = fields[key]
        if key == "description":
            new_val = f'"{escape_ts_string(val)}"'
            block = re.sub(
                r'"description":\s*"(?:[^"\\]|\\.)*"',
                f'"description": {new_val}',
                block,
                count=1,
            )
        elif key == "maxRank":
            block = re.sub(r'"maxRank":\s*\d+', f'"maxRank": {val}', block, count=1)
        elif key in ("name", "category"):
            block = re.sub(
                rf'"{key}":\s*"(?:[^"\\]|\\.)*"',
                f'"{key}": {json.dumps(val)}',
                block,
                count=1,
            )

    return content[:block_start] + block + content[block_end:]


def apply_arcane_effects(verified: list[dict]) -> int:
    manual = json.loads(MANUAL_JSON.read_text(encoding="utf-8"))
    changed = 0

    for o in verified:
        if o["targetType"] != "arcane_effect":
            continue
        tid = o["targetId"]
        fields = normalize_arcane_effect_fields(o.get("fields") or {}, tid)
        if tid not in load_effects():
            print(f"  SKIP unknown arcane effect id: {tid}")
            continue

        manual_entry: dict = {"replace": True}
        if fields.get("trigger"):
            manual_entry["trigger"] = fields["trigger"]
        if "stackCap" in fields:
            manual_entry["stackCap"] = fields["stackCap"]
        if "effects" in fields:
            manual_entry["effects"] = fields["effects"]
        manual[tid] = manual_entry
        changed += 1

    MANUAL_JSON.write_text(json.dumps(manual, indent=2) + "\n", encoding="utf-8")
    return changed


def apply_arcane_catalog(verified: list[dict]) -> int:
    content = ARCANES_TS.read_text(encoding="utf-8")
    changed = 0
    for o in verified:
        if o["targetType"] != "arcane":
            continue
        fields = o.get("fields") or {}
        if not fields:
            continue
        new_content = patch_arcane_catalog(content, o["targetId"], fields)
        if new_content != content:
            content = new_content
            changed += 1
    ARCANES_TS.write_text(content, encoding="utf-8")
    return changed


def apply_mods(verified: list[dict]) -> int:
    content = MODS_TS.read_text(encoding="utf-8")
    changed = 0
    for o in verified:
        if o["targetType"] != "mod":
            continue
        fields = o.get("fields") or {}
        if not fields:
            continue
        new_content = patch_mod(content, o["targetId"], fields)
        if new_content != content:
            content = new_content
            changed += 1
    MODS_TS.write_text(content, encoding="utf-8")
    return changed


def main() -> None:
    export_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_EXPORT
    if not export_path.exists():
        print(f"Export not found: {export_path}")
        sys.exit(1)

    verified = json.loads(export_path.read_text(encoding="utf-8"))
    print(f"Applying {len(verified)} verified overrides from {export_path.name}")

    fx = apply_arcane_effects(verified)
    print(f"  arcane_effect entries updated: {fx}")

    ar = apply_arcane_catalog(verified)
    print(f"  arcane catalog entries updated: {ar}")

    md = apply_mods(verified)
    print(f"  mod entries updated: {md}")

    subprocess.run([sys.executable, str(ROOT / "scripts/apply_arcane_manual_overrides.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "scripts/generate_arcane_behaviors.py")], check=True)
    print("Done.")


if __name__ == "__main__":
    main()
