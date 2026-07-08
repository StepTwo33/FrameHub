#!/usr/bin/env python3
"""Generate PWA icons and favicons from assets/app-icon-source.png (transparency preserved)."""

from __future__ import annotations

import collections
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "app-icon-source.png"
MASKABLE_SOURCE = ROOT / "assets" / "app-icon-maskable-source.png"
OUT_DIR = ROOT / "public" / "icons"
PUBLIC_DIR = ROOT / "public"
APP_DIR = ROOT / "src" / "app"

# Fallback fill when a platform requires an opaque icon (favicon .ico)
BG = (10, 10, 26, 255)
TRANSPARENT = (0, 0, 0, 0)

STANDARD_SIZES = (192, 512)
MASKABLE_SIZES = (192, 512)
FAVICON_CROP = 0.82
CORNER_BG_TOLERANCE = 28


def ensure_rgba(img: Image.Image) -> Image.Image:
    return img.convert("RGBA")


def knock_out_corner_background(img: Image.Image, tolerance: int = CORNER_BG_TOLERANCE) -> Image.Image:
    """Turn outer black matte into transparency so the logo stays circular, not a square."""
    img = ensure_rgba(img).copy()
    pixels = img.load()
    width, height = img.size
    visited: set[tuple[int, int]] = set()
    queue: collections.deque[tuple[int, int]] = collections.deque()

    for x, y in ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)):
        queue.append((x, y))

    def is_background(r: int, g: int, b: int) -> bool:
        return r <= tolerance and g <= tolerance and b <= tolerance

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or x < 0 or y < 0 or x >= width or y >= height:
            continue
        r, g, b, _a = pixels[x, y]
        if not is_background(r, g, b):
            continue
        visited.add((x, y))
        pixels[x, y] = TRANSPARENT
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return img


def resize_contain(
    img: Image.Image,
    size: int,
    bg: tuple[int, int, int, int] = TRANSPARENT,
) -> Image.Image:
    img = ensure_rgba(img)
    width, height = img.size
    scale = min(size / width, size / height)
    resized = img.resize((int(width * scale), int(height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    offset = ((size - resized.width) // 2, (size - resized.height) // 2)
    canvas.paste(resized, offset, resized)
    return canvas


def center_crop_fraction(img: Image.Image, fraction: float) -> Image.Image:
    img = ensure_rgba(img)
    width, height = img.size
    crop = int(min(width, height) * fraction)
    left = (width - crop) // 2
    top = (height - crop) // 2
    return img.crop((left, top, left + crop, top + crop))


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ensure_rgba(img).save(path, format="PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)}")


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source icon: {SOURCE}")

    raw = Image.open(SOURCE)
    source = knock_out_corner_background(raw)
    maskable_raw = Image.open(MASKABLE_SOURCE) if MASKABLE_SOURCE.is_file() else raw
    maskable_source = knock_out_corner_background(maskable_raw)
    favicon_source = center_crop_fraction(source, FAVICON_CROP)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print("Generating PWA icons (transparency preserved)...")

    for size in STANDARD_SIZES:
        save_png(resize_contain(source, size), OUT_DIR / f"icon-{size}x{size}.png")

    for size in MASKABLE_SIZES:
        save_png(resize_contain(maskable_source, size), OUT_DIR / f"maskable-{size}x{size}.png")

    save_png(resize_contain(source, 180), OUT_DIR / "apple-touch-icon.png")
    save_png(favicon_source.resize((32, 32), Image.Resampling.LANCZOS), OUT_DIR / "favicon-32x32.png")
    save_png(favicon_source.resize((16, 16), Image.Resampling.LANCZOS), OUT_DIR / "favicon-16x16.png")

    save_png(resize_contain(source, 48), APP_DIR / "icon.png")
    save_png(resize_contain(source, 180), APP_DIR / "apple-icon.png")

    # .ico needs opaque pixels — small crop on theme background
    favicon_32 = resize_contain(favicon_source, 32, BG).convert("RGBA")
    favicon_16 = resize_contain(favicon_source, 16, BG).convert("RGBA")
    favicon_path = PUBLIC_DIR / "favicon.ico"
    favicon_32.save(favicon_path, format="ICO", sizes=[(32, 32)], append_images=[favicon_16])
    print(f"  {favicon_path.relative_to(ROOT)}")

    print("\nDone.")


if __name__ == "__main__":
    main()
