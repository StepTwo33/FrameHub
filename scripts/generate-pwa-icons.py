#!/usr/bin/env python3
"""Generate PWA icons from assets/app-icon-source.png (standard) and app-icon-maskable-source.png (Android maskable)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "app-icon-source.png"
MASKABLE_SOURCE = ROOT / "assets" / "app-icon-maskable-source.png"
OUT_DIR = ROOT / "public" / "icons"
APP_DIR = ROOT / "src" / "app"

# Matches manifest background_color / theme_color
BG = (10, 10, 26, 255)

STANDARD_SIZES = (192, 512)
MASKABLE_SIZES = (192, 512)
MASKABLE_SCALE = 0.72
FAVICON_CROP = 0.68


def ensure_rgba(img: Image.Image) -> Image.Image:
    return img.convert("RGBA")


def resize_cover(img: Image.Image, size: int) -> Image.Image:
    img = ensure_rgba(img)
    width, height = img.size
    scale = max(size / width, size / height)
    resized = img.resize((int(width * scale), int(height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - size) // 2
    top = (resized.height - size) // 2
    return resized.crop((left, top, left + size, top + size))


def center_crop_fraction(img: Image.Image, fraction: float) -> Image.Image:
    img = ensure_rgba(img)
    width, height = img.size
    crop = int(min(width, height) * fraction)
    left = (width - crop) // 2
    top = (height - crop) // 2
    return img.crop((left, top, left + crop, top + crop))


def make_maskable(source: Image.Image, size: int) -> Image.Image:
    """Pad square logo art for Android adaptive icon safe zone."""
    inner = int(size * MASKABLE_SCALE)
    logo = resize_cover(source, inner)
    canvas = Image.new("RGBA", (size, size), BG)
    offset = (size - inner) // 2
    canvas.paste(logo, (offset, offset), logo)
    return canvas


def make_maskable_from_rounded(source: Image.Image, size: int) -> Image.Image:
    """Rounded source art is pre-composed for circular crops — use full bleed."""
    return resize_cover(source, size)


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ensure_rgba(img).save(path, format="PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)}")


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source icon: {SOURCE}")

    source = Image.open(SOURCE)
    maskable_source = Image.open(MASKABLE_SOURCE) if MASKABLE_SOURCE.is_file() else source
    use_rounded_maskable = MASKABLE_SOURCE.is_file()
    favicon_source = center_crop_fraction(source, FAVICON_CROP)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print("Generating PWA icons...")

    for size in STANDARD_SIZES:
        save_png(resize_cover(source, size), OUT_DIR / f"icon-{size}x{size}.png")

    for size in MASKABLE_SIZES:
        if use_rounded_maskable:
            save_png(make_maskable_from_rounded(maskable_source, size), OUT_DIR / f"maskable-{size}x{size}.png")
        else:
            save_png(make_maskable(source, size), OUT_DIR / f"maskable-{size}x{size}.png")

    save_png(resize_cover(source, 180), OUT_DIR / "apple-touch-icon.png")
    save_png(favicon_source.resize((32, 32), Image.Resampling.LANCZOS), OUT_DIR / "favicon-32x32.png")
    save_png(favicon_source.resize((16, 16), Image.Resampling.LANCZOS), OUT_DIR / "favicon-16x16.png")

    # Next.js App Router metadata files
    save_png(favicon_source.resize((48, 48), Image.Resampling.LANCZOS), APP_DIR / "icon.png")
    save_png(resize_cover(source, 180), APP_DIR / "apple-icon.png")

    favicon_32 = favicon_source.resize((32, 32), Image.Resampling.LANCZOS).convert("RGBA")
    favicon_16 = favicon_source.resize((16, 16), Image.Resampling.LANCZOS).convert("RGBA")
    favicon_path = ROOT / "public" / "favicon.ico"
    favicon_32.save(favicon_path, format="ICO", sizes=[(32, 32)], append_images=[favicon_16])
    print(f"  {favicon_path.relative_to(ROOT)}")

    print("\nDone.")


if __name__ == "__main__":
    main()
