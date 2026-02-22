/**
 * Generate PWA icons using pure Node.js (no external dependencies).
 * Creates valid PNG files with a stylized "F" logo.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");

// ── CRC32 ────────────────────────────────────────────────────────────────
const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crc32Table[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crc32Table[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

// ── PNG helpers ──────────────────────────────────────────────────────────
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, "ascii");
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

function createPNG(width, height, drawFn) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const row = y * (1 + width * 4);
    raw[row] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const p = row + 1 + x * 4;
      raw[p] = r; raw[p + 1] = g; raw[p + 2] = b; raw[p + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Drawing ──────────────────────────────────────────────────────────────
function isInRoundedRect(x, y, x1, y1, x2, y2, r) {
  if (x < x1 || x > x2 || y < y1 || y > y2) return false;
  if (x < x1 + r && y < y1 + r) { const dx = x - (x1 + r), dy = y - (y1 + r); return dx * dx + dy * dy <= r * r; }
  if (x > x2 - r && y < y1 + r) { const dx = x - (x2 - r), dy = y - (y1 + r); return dx * dx + dy * dy <= r * r; }
  if (x < x1 + r && y > y2 - r) { const dx = x - (x1 + r), dy = y - (y2 - r); return dx * dx + dy * dy <= r * r; }
  if (x > x2 - r && y > y2 - r) { const dx = x - (x2 - r), dy = y - (y2 - r); return dx * dx + dy * dy <= r * r; }
  return true;
}

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

function drawIcon(x, y, w, h, maskable) {
  const nx = x / w, ny = y / h;

  // Background with rounded corners (maskable = full bleed, regular = rounded)
  const pad = maskable ? 0 : 0.04;
  const rad = maskable ? 0 : 0.18;
  if (!isInRoundedRect(nx, ny, pad, pad, 1 - pad, 1 - pad, rad)) return [0, 0, 0, 0];

  // Subtle gradient background: slate-900 → slate-950
  const bgR = Math.round(lerp(15, 10, ny));
  const bgG = Math.round(lerp(23, 16, ny));
  const bgB = Math.round(lerp(42, 32, ny));

  // "F" letter geometry — centered
  const lPad = maskable ? 0.30 : 0.22;
  const lx = (nx - lPad) / (1 - 2 * lPad);
  const ly = (ny - lPad) / (1 - 2 * lPad);

  if (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1) {
    const barW = 0.20;
    const barH = 0.16;

    const inVert = lx <= barW;
    const inTop = ly <= barH;
    const inMid = ly >= 0.42 && ly <= 0.42 + barH && lx <= 0.78;

    if (inVert || inTop || inMid) {
      // Blue with slight brightness variation
      const bright = 1.0 - ny * 0.15;
      return [Math.round(59 * bright), Math.round(130 * bright), Math.round(246 * bright), 255];
    }
  }

  return [bgR, bgG, bgB, 255];
}

// ── Generate ─────────────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  // Regular icon
  const regular = createPNG(size, size, (x, y, w, h) => drawIcon(x, y, w, h, false));
  writeFileSync(join(OUT_DIR, `icon-${size}x${size}.png`), regular);
  console.log(`✓ icon-${size}x${size}.png`);

  // Maskable icon (extra padding, no rounded corners)
  const maskable = createPNG(size, size, (x, y, w, h) => drawIcon(x, y, w, h, true));
  writeFileSync(join(OUT_DIR, `maskable-${size}x${size}.png`), maskable);
  console.log(`✓ maskable-${size}x${size}.png`);
}

console.log("\nPWA icons generated in public/icons/");
