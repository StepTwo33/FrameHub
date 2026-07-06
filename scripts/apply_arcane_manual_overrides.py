#!/usr/bin/env python3
"""Apply arcane-manual-overrides.json to arcane-effects.ts (no wiki fetch)."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EFFECTS = ROOT / "src/data/arcane-effects.ts"
MANUAL = ROOT / "src/data/arcane-manual-overrides.json"
HEADER = EFFECTS.read_text(encoding="utf-8").split("export const ARCANE_EFFECTS")[0]


def load_effects() -> dict:
    text = EFFECTS.read_text(encoding="utf-8")
    start = text.index("{", text.index("ARCANE_EFFECTS"))
    end = text.rindex(";")
    return json.loads(text[start:end])


def normalize(entry: dict | list) -> tuple[list, bool, str | None, int | None]:
    if isinstance(entry, list):
        return entry, False, None, None
    return (
        entry.get("effects", []),
        bool(entry.get("replace")),
        entry.get("trigger"),
        entry.get("stackCap"),
    )


def main() -> None:
    effects = load_effects()
    manual = json.loads(MANUAL.read_text(encoding="utf-8"))
    changed = 0

    for aid, entry in manual.items():
        if aid not in effects:
            print(f"SKIP unknown id: {aid}")
            continue
        eff_lines, replace, trigger, stack_cap = normalize(entry)
        if replace:
            effects[aid]["effects"] = eff_lines
        else:
            by_stat = {e["stat"]: e for e in effects[aid]["effects"]}
            for e in eff_lines:
                by_stat[e["stat"]] = e
            effects[aid]["effects"] = list(by_stat.values())
        if trigger:
            effects[aid]["trigger"] = trigger
        if stack_cap is not None:
            effects[aid]["stackCap"] = stack_cap
        elif replace and "stackCap" in effects[aid] and stack_cap is None:
            effects[aid].pop("stackCap", None)
        changed += 1

    body = json.dumps(effects, indent=2)
    out = HEADER + "export const ARCANE_EFFECTS: Record<string, ArcaneEffectDef> = " + body + ";\n"
    EFFECTS.write_text(out, encoding="utf-8")
    print(f"Applied {changed} manual overrides to {EFFECTS.name}")
    subprocess.run([sys.executable, str(ROOT / "scripts/fix_arcane_rank_scaling.py")], check=True)


if __name__ == "__main__":
    main()
