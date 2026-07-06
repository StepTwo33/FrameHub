#!/usr/bin/env python3
"""Download missing mod PNGs from wiki Module:Mods/data Image field + WFCD CDN."""
from __future__ import annotations

import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None  # type: ignore[misc, assignment]

ROOT = Path(__file__).resolve().parents[1]
MODS_DIR = ROOT / "public/images/mods"
WIKI_CACHE = Path(__file__).resolve().parent / "_wiki_mods_data.lua"
UA = {"User-Agent": "FrameHub/1.0 (https://frame-hub.com)"}

MOD_IMAGE_STEM_BY_NAME = {
    "Endless Lull": "Endless_Lullaby",
    "Flame Claws": "Heated_Charge",
    "Frost Claws": "Chilling_Claws",
    "Looters": "Looter",
    "ReactivStorm": "Reactive_Storm",
    "Berserker": "Berserker_Fury",
}
MOD_STEM_SMALL_WORDS = {"of", "the", "and"}

# Catalog display name -> wiki / WFCD lookup name when they differ.
WIKI_NAME_BY_MOD_NAME: dict[str, str] = {
    "Warding Halo Augment": "Warding Thurible",
    "Mesmer Skin Augment": "Mesmer Shield",
    "Dispensary Augment": "Repair Dispensary",
    "Gloom Augment": "Draining Gloom",
    "Prismatic Shield Augment": "Prismatic Companion",
    "Lethal Progeny Augment": "Lethal Progeny",
    "Chyrinka Pillar Augment": "Chyrinka Pillar",
    "Scan Organic Lifeforms": "Scan Organic",
}


def mod_png_stem(name: str) -> str:
    if name in MOD_IMAGE_STEM_BY_NAME:
        return MOD_IMAGE_STEM_BY_NAME[name]
    set_bonus = re.match(r"^(\w+) Set Bonus$", name)
    if set_bonus:
        return f"{set_bonus.group(1)}setmod"
    riven = re.match(r"^Riven Mod \((.+)\)$", name)
    if riven:
        return f"{riven.group(1).replace(' ', '_')}_Riven_Mod"
    claw = re.match(r"^(.+) \(Claws\)$", name)
    if claw:
        return claw.group(1).replace(" ", "_")
    parts = name.replace(" ", "_").split("_")
    out: list[str] = []
    for index, word in enumerate(parts):
        if not word:
            out.append(word)
            continue
        if index > 0 and word.lower() in MOD_STEM_SMALL_WORDS:
            out.append(word[0].upper() + word[1:].lower())
        elif word == word.upper() and len(word) <= 4:
            out.append(word[0] + word[1:].lower() if len(word) > 1 else word)
        else:
            out.append(word)
    return "_".join(out)


def load_mods() -> list[dict]:
    text = (ROOT / "src/data/mods.ts").read_text(encoding="utf-8")
    return json.loads(re.search(r"export const allMods: Mod\[\] = (\[[\s\S]*?\n\]);", text).group(1))


def parse_wiki_images() -> dict[str, str]:
    text = WIKI_CACHE.read_text(encoding="utf-8")
    out: dict[str, str] = {}
    for m in re.finditer(r'\["([^"]+)"\]\s*=\s*\{([\s\S]*?)\n\t\t\},', text):
        body = m.group(2)
        name = m.group(1)
        im = re.search(r'Image\s*=\s*"([^"]+)"', body)
        if im:
            out[name.lower()] = im.group(1)
        link = re.search(r'Link\s*=\s*"([^"]+)"', body)
        if link and im:
            out.setdefault(link.group(1).lower(), im.group(1))
    return out


def load_wfcd_images() -> dict[str, str]:
    url = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Mods.json"
    data = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read())
    return {m["name"].lower(): m.get("imageName", "") for m in data if m.get("name") and m.get("imageName")}


def fetch_bytes(url: str) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            return data if len(data) >= 500 else None
    except (urllib.error.URLError, OSError, TimeoutError):
        return None


def to_png_bytes(data: bytes) -> bytes | None:
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return data
    if Image is None:
        return None
    try:
        img = Image.open(io.BytesIO(data))
        buf = io.BytesIO()
        img.convert("RGBA").save(buf, format="PNG")
        return buf.getvalue()
    except OSError:
        return None


def wiki_image_url(image_name: str) -> str:
    return f"https://wiki.warframe.com/images/{urllib.parse.quote(image_name)}"


def wfcd_image_url(image_name: str) -> str:
    return f"https://cdn.warframestat.us/img/{urllib.parse.quote(image_name)}"


def guess_wiki_image_name(mod_name: str) -> list[str]:
    compact = mod_name.replace(" ", "").replace("'", "")
    return [f"{compact}Mod.png", f"{compact}.png"]


def resolve_source(
    mod_name: str,
    wiki_images: dict[str, str],
    wfcd_images: dict[str, str],
) -> tuple[str, str] | None:
    lookup = WIKI_NAME_BY_MOD_NAME.get(mod_name, mod_name)
    wiki_img = wiki_images.get(lookup.lower())
    if wiki_img:
        return ("wiki", wiki_image_url(wiki_img))
    wfcd_img = wfcd_images.get(lookup.lower()) or wfcd_images.get(mod_name.lower())
    if wfcd_img:
        return ("wfcd", wfcd_image_url(wfcd_img))
    for guess in guess_wiki_image_name(lookup):
        url = wiki_image_url(guess)
        if fetch_bytes(url):
            return ("wiki_guess", url)
    return None


def main() -> int:
    mods = load_mods()
    existing = {p.stem for p in MODS_DIR.glob("*.png")}
    missing = [m for m in mods if mod_png_stem(m["name"]) not in existing]
    wiki_images = parse_wiki_images()
    wfcd_images = load_wfcd_images()

    print(f"Missing mod PNGs: {len(missing)}\n")
    downloaded = 0
    still_missing: list[str] = []

    for mod in sorted(missing, key=lambda m: m["name"]):
        stem = mod_png_stem(mod["name"])
        dest = MODS_DIR / f"{stem}.png"
        source = resolve_source(mod["name"], wiki_images, wfcd_images)
        if not source:
            still_missing.append(mod["name"])
            continue
        kind, url = source
        raw = fetch_bytes(url)
        if not raw:
            still_missing.append(mod["name"])
            continue
        png = to_png_bytes(raw)
        if not png:
            still_missing.append(mod["name"])
            continue
        dest.write_bytes(png)
        downloaded += 1
        print(f"  OK {mod['name']!r} -> {stem}.png ({kind})")
        time.sleep(0.05)

    print(f"\nDownloaded: {downloaded}")
    print(f"Still missing: {len(still_missing)}")
    for name in still_missing:
        print(f"  {name!r}")
    return len(still_missing)


if __name__ == "__main__":
    raise SystemExit(main())
