#!/usr/bin/env python3
"""Generate PWA icons, favicons, and OG image from assets/app-icon-source.png."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "app-icon-source.png"
MASKABLE_SOURCE = ROOT / "assets" / "app-icon-maskable-source.png"
OUT_DIR = ROOT / "public" / "icons"
PUBLIC_DIR = ROOT / "public"
APP_DIR = ROOT / "src" / "app"

# Matches manifest background_color / theme_color
BG = (10, 10, 26, 255)
OG_SIZE = (1200, 630)

STANDARD_SIZES = (192, 512)
MASKABLE_SIZES = (192, 512)
FAVICON_CROP = 0.82


def ensure_rgba(img: Image.Image) -> Image.Image:
    return img.convert("RGBA")


def resize_contain(img: Image.Image, size: int, bg: tuple[int, int, int, int] = BG) -> Image.Image:
    """Fit artwork inside a square without cropping (for circular logos)."""
    img = ensure_rgba(img)
    width, height = img.size
    scale = min(size / width, size / height)
    resized = img.resize((int(width * scale), int(height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    offset = ((size - resized.width) // 2, (size - resized.height) // 2)
    canvas.paste(resized, offset, resized)
    return canvas


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


def make_og_image(source: Image.Image) -> Image.Image:
    """Social / link preview card — logo centered on branded gradient."""
    width, height = OG_SIZE
    canvas = Image.new("RGBA", (width, height), BG)
    draw = ImageDraw.Draw(canvas)
    draw.ellipse((-140, -120, 520, 520), fill=(88, 28, 135, 48))
    draw.ellipse((width - 420, height - 460, width + 80, height + 40), fill=(34, 211, 238, 32))

    logo = ensure_rgba(source)
    max_w = int(width * 0.62)
    max_h = int(height * 0.88)
    scale = min(max_w / logo.width, max_h / logo.height)
    resized = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.Resampling.LANCZOS)
    x = (width - resized.width) // 2
    y = (height - resized.height) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ensure_rgba(img).save(path, format="PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)}")


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source icon: {SOURCE}")

    source = Image.open(SOURCE)
    maskable_source = Image.open(MASKABLE_SOURCE) if MASKABLE_SOURCE.is_file() else source
    favicon_source = center_crop_fraction(source, FAVICON_CROP)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print("Generating PWA icons...")

    for size in STANDARD_SIZES:
        save_png(resize_contain(source, size), OUT_DIR / f"icon-{size}x{size}.png")

    for size in MASKABLE_SIZES:
        save_png(resize_contain(maskable_source, size), OUT_DIR / f"maskable-{size}x{size}.png")

    save_png(resize_contain(source, 180), OUT_DIR / "apple-touch-icon.png")
    save_png(favicon_source.resize((32, 32), Image.Resampling.LANCZOS), OUT_DIR / "favicon-32x32.png")
    save_png(favicon_source.resize((16, 16), Image.Resampling.LANCZOS), OUT_DIR / "favicon-16x16.png")

    # Next.js App Router metadata files (PC/browser tab + install icon)
    save_png(resize_contain(source, 48), APP_DIR / "icon.png")
    save_png(resize_contain(source, 180), APP_DIR / "apple-icon.png")

    favicon_32 = favicon_source.resize((32, 32), Image.Resampling.LANCZOS).convert("RGBA")
    favicon_16 = favicon_source.resize((16, 16), Image.Resampling.LANCZOS).convert("RGBA")
    favicon_path = PUBLIC_DIR / "favicon.ico"
    favicon_32.save(favicon_path, format="ICO", sizes=[(32, 32)], append_images=[favicon_16])
    print(f"  {favicon_path.relative_to(ROOT)}")

    save_png(make_og_image(source), PUBLIC_DIR / "og-image.png")

    print("\nDone.")


if __name__ == "__main__":
    main()
