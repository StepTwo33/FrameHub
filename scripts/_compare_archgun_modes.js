// One-shot: compare our archgun data vs wiki space/atmosphere primary attacks.
import fs from "fs";
import path from "path";
const __dirname = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const wiki = JSON.parse(fs.readFileSync(path.join(__dirname, "_archgun_wiki.json"), "utf8"));
const weaponsSrc = fs.readFileSync(path.join(__dirname, "..", "src", "data", "weapons.ts"), "utf8");

function ourEntry(id) {
  const re = new RegExp(`"id": "${id}"[\\s\\S]*?\\n  \\}`);
  const m = re.exec(weaponsSrc);
  if (!m) return null;
  const get = (k) => {
    const mm = new RegExp(`"${k}": ([0-9.]+)`).exec(m[0]);
    return mm ? Number(mm[1]) : undefined;
  };
  return {
    damage: get("damage"), fireRate: get("fireRate"), criticalChance: get("criticalChance"),
    criticalMultiplier: get("criticalMultiplier"), statusChance: get("statusChance"),
    magazine: get("magazine"), reloadTime: get("reloadTime"), multishot: get("multishot"),
  };
}

function primaryAttack(blob) {
  if (!blob?.Attacks?.length) return null;
  // Prefer the first attack (normal/uncharged/held)
  const a = blob.Attacks[0];
  const dmg = Object.values(a.Damage ?? {}).reduce((s, v) => s + v, 0);
  return {
    name: a.AttackName,
    damage: Math.round(dmg * 100) / 100,
    damageTypes: a.Damage,
    fireRate: a.FireRate,
    criticalChance: a.CritChance,
    criticalMultiplier: a.CritMultiplier,
    statusChance: a.StatusChance,
    multishot: a.Multishot,
    magazine: blob.Magazine,
    reload: blob.Reload,
    reloadStyle: blob.ReloadStyle,
    ammoMax: blob.AmmoMax,
  };
}

for (const [id, modes] of Object.entries(wiki)) {
  const ours = ourEntry(id);
  const space = primaryAttack(modes.space);
  const atmos = primaryAttack(modes.atmosphere);
  console.log("=== " + id);
  console.log("  ours :", JSON.stringify(ours));
  console.log("  space:", JSON.stringify(space));
  console.log("  atmos:", JSON.stringify(atmos));
}
