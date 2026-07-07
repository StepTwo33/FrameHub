/**
 * Regenerate PWA icons from assets/app-icon-source.png
 * Requires Python 3 + Pillow (pip install pillow).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const script = join(__dirname, "generate-pwa-icons.py");

const result = spawnSync("python", [script], { stdio: "inherit", shell: true });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
