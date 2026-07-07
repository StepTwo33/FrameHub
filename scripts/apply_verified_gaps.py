#!/usr/bin/env python3
"""Apply only arcane/mod entries that still mismatch axel's verified export."""
from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_EXPORT = Path.home() / "Downloads/message.txt"

# Load sibling modules without package install
_spec = importlib.util.spec_from_file_location("compare", ROOT / "scripts/compare_verified_overrides.py")
_compare = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_compare)

_spec2 = importlib.util.spec_from_file_location("apply", ROOT / "scripts/apply_verified_overrides.py")
_apply = importlib.util.module_from_spec(_spec2)
assert _spec2.loader is not None
_spec2.loader.exec_module(_apply)

from stat_label_map import normalize_arcane_effect_fields  # noqa: E402


def collect_mismatch_ids(export_path: Path) -> set[str]:
    verified = json.loads(export_path.read_text(encoding="utf-8"))
    effects = _compare.load_arcane_effects()
    arcanes = _compare.load_arcanes()
    mods = _compare.load_mods()
    ids: set[str] = set()

    for o in verified:
        tid = o["targetId"]
        fields = o.get("fields") or {}
        if o["targetType"] == "arcane_effect":
            if tid not in effects:
                ids.add(tid)
                continue
            cur = effects[tid]
            fields = normalize_arcane_effect_fields(fields, tid)
            issues: list[str] = []
            if fields.get("trigger") and fields["trigger"] != cur.get("trigger"):
                issues.append("trigger")
            if "stackCap" in fields and fields.get("stackCap") != cur.get("stackCap"):
                issues.append("stackCap")
            exp_fx = fields.get("effects") or []
            act_fx = cur.get("effects") or []
            ok, fx_issues = _compare.effects_match(exp_fx, act_fx)
            if not ok:
                issues.extend(fx_issues)
            if issues:
                ids.add(tid)
        elif o["targetType"] == "arcane":
            if tid not in arcanes:
                ids.add(tid)
                continue
            cur = arcanes[tid]
            issues = []
            if "description" in fields and fields["description"] != cur.get("description"):
                issues.append("description")
            if "stats" in fields:
                ok, st_issues = _compare.stats_match(fields["stats"], cur.get("stats") or {})
                issues.extend(st_issues)
            if "name" in fields and fields["name"] != cur.get("name"):
                issues.append("name")
            if issues:
                ids.add(tid)
        elif o["targetType"] == "mod":
            if tid not in mods:
                ids.add(tid)
                continue
            cur = mods[tid]
            for key in ("description", "name", "category", "maxRank"):
                if key in fields and fields[key] != cur.get(key):
                    ids.add(tid)
    return ids


def main() -> None:
    export_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_EXPORT
    verified = json.loads(export_path.read_text(encoding="utf-8"))
    gap_ids = collect_mismatch_ids(export_path)
    print(f"Applying {len(gap_ids)} mismatched targets: {sorted(gap_ids)}")

    filtered = [o for o in verified if o["targetId"] in gap_ids]
    manual = json.loads(_apply.MANUAL_JSON.read_text(encoding="utf-8"))

    for o in filtered:
        if o["targetType"] != "arcane_effect":
            continue
        tid = o["targetId"]
        fields = normalize_arcane_effect_fields(o.get("fields") or {}, tid)
        manual_entry: dict = {"replace": True}
        if fields.get("trigger"):
            manual_entry["trigger"] = fields["trigger"]
        if "stackCap" in fields:
            manual_entry["stackCap"] = fields["stackCap"]
        if "effects" in fields:
            manual_entry["effects"] = fields["effects"]
        manual[tid] = manual_entry

    _apply.MANUAL_JSON.write_text(json.dumps(manual, indent=2) + "\n", encoding="utf-8")

    arcanes_content = _apply.ARCANES_TS.read_text(encoding="utf-8")
    for o in filtered:
        if o["targetType"] != "arcane":
            continue
        fields = o.get("fields") or {}
        arcanes_content = _apply.patch_arcane_catalog(arcanes_content, o["targetId"], fields)
    _apply.ARCANES_TS.write_text(arcanes_content, encoding="utf-8")

    mods_content = _apply.MODS_TS.read_text(encoding="utf-8")
    for o in filtered:
        if o["targetType"] != "mod":
            continue
        fields = o.get("fields") or {}
        mods_content = _apply.patch_mod(mods_content, o["targetId"], fields)
    _apply.MODS_TS.write_text(mods_content, encoding="utf-8")

    subprocess.run([sys.executable, str(ROOT / "scripts/apply_arcane_manual_overrides.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "scripts/generate_arcane_behaviors.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "scripts/compare_verified_overrides.py"), str(export_path)], check=True)


if __name__ == "__main__":
    main()
