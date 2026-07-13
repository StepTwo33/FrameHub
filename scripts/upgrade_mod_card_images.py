#!/usr/bin/env python3
"""Replace icon/square/placeholder mod PNGs with full wiki mod-card art (Image field)."""
from __future__ import annotations

import struct
import time
from pathlib import Path

# Reuse download helpers from sibling script.
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from download_missing_mod_images import (  # noqa: E402
    MIN_GOOD_BYTES,
    MODS_DIR,
    WHITE_PLACEHOLDER_BYTES,
    candidate_files,
    fetch_bytes,
    load_mod_names,
    mod_png_stem,
    parse_lua_entries,
    fetch_wiki_module,
    to_png_bytes,
    wiki_file_url,
)

ROOT = Path(__file__).resolve().parents[1]
WHITE_STEMS_FILE = ROOT / "scripts/_white_mod_stems.txt"


def png_dims(path: Path) -> tuple[int, int] | None:
    data = path.read_bytes()
    if len(data) < 24 or data[1:4] != b"PNG":
        return None
    return struct.unpack(">II", data[16:24])


def is_portrait_card(w: int, h: int) -> bool:
    return h > w * 1.15 and w >= 180


def needs_upgrade(path: Path, white_stems: set[str]) -> bool:
    if path.stem in white_stems:
        return True
    data = path.read_bytes()
    if len(data) == WHITE_PLACEHOLDER_BYTES and data[:3] == b"\xff\xd8\xff":
        return True
    dims = png_dims(path)
    if not dims:
        return True
    w, h = dims
    if is_portrait_card(w, h) and len(data) >= MIN_GOOD_BYTES:
        return False
    # Square icon thumbnails (512×512, 256×256, …)
    if abs(w - h) <= max(w, h) * 0.12:
        return True
    # Landscape / tiny sprites
    if w < 200 or h <= w:
        return True
    return False


def prefer_card_files(files: list[str]) -> list[str]:
    """Prefer full mod cards (*Mod.png) over bare icons."""
    mod_cards = [f for f in files if f.lower().endswith("mod.png")]
    icons = [f for f in files if f not in mod_cards]
    return mod_cards + icons


def main() -> int:
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        print("Pillow is required")
        return 1

    white_stems: set[str] = set()
    if WHITE_STEMS_FILE.is_file():
        raw = WHITE_STEMS_FILE.read_bytes()
        if raw[:2] == b"\xff\xfe":
            text = raw.decode("utf-16-le")
        elif raw[:2] == b"\xfe\xff":
            text = raw.decode("utf-16-be")
        else:
            text = raw.decode("utf-8-sig")
        for line in text.splitlines():
            line = line.strip()
            if line and not line.startswith("TOTAL"):
                white_stems.add(line)

    stem_to_name = {mod_png_stem(n): n for n in load_mod_names()}

    targets: list[Path] = []
    for path in sorted(MODS_DIR.glob("*.png")):
        if needs_upgrade(path, white_stems):
            targets.append(path)

    print(f"Mod PNGs needing card upgrade: {len(targets)}")
    if not targets:
        return 0

    print("Fetching wiki Focus + Mods image index...")
    focus_images = parse_lua_entries(fetch_wiki_module("Module:Focus/data"))
    mod_images = parse_lua_entries(fetch_wiki_module("Module:Mods/data"))
    wiki_images = {**mod_images, **focus_images}

    upgraded = 0
    skipped = 0
    failed: list[str] = []

    for path in targets:
        mod_name = stem_to_name.get(path.stem, path.stem.replace("_", " "))
        files = prefer_card_files(candidate_files(mod_name, wiki_images))
        best_png: bytes | None = None
        best_score = 0

        for file_name in files:
            url = wiki_file_url(file_name)
            if not url:
                continue
            raw = fetch_bytes(url)
            if not raw:
                continue
            png = to_png_bytes(raw)
            if not png:
                continue
            dims = png_dims_from_bytes(png)
            if not dims:
                continue
            w, h = dims
            if not is_portrait_card(w, h):
                continue
            score = w * h
            if score > best_score:
                best_score = score
                best_png = png
            time.sleep(0.05)

        if best_png and len(best_png) >= MIN_GOOD_BYTES:
            path.write_bytes(best_png)
            upgraded += 1
            dims = png_dims(path)
            print(f"  OK  {path.stem} ({dims[0]}x{dims[1]}, {len(best_png)} bytes)")
        else:
            skipped += 1
            failed.append(path.stem)

    print(f"\nUpgraded: {upgraded} | Still icon/missing: {skipped}")
    if failed:
        print("Could not upgrade:", ", ".join(failed[:40]) + ("..." if len(failed) > 40 else ""))
    return 0


def png_dims_from_bytes(data: bytes) -> tuple[int, int] | None:
    if len(data) < 24 or data[1:4] != b"PNG":
        return None
    return struct.unpack(">II", data[16:24])


if __name__ == "__main__":
    raise SystemExit(main())
