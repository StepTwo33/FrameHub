#!/usr/bin/env node
/**
 * Ensure User.bio exists (no sqlite3 CLI required — uses better-sqlite3).
 * Env: SQLITE_DATABASE_PATH and/or DATABASE_URL (set by start.sh).
 */
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveDbPath() {
  const explicit = process.env.SQLITE_DATABASE_PATH?.trim();
  if (explicit) return explicit;
  const raw = process.env.DATABASE_URL?.trim() || "file:./dev.db";
  const filePath = raw.startsWith("file:") ? raw.slice("file:".length) : raw;
  return path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
}

const dbPath = resolveDbPath();
console.log(`[repair-db] ${dbPath}`);

if (!existsSync(dbPath)) {
  console.log("[repair-db] Database file not found yet — skipping.");
  process.exit(0);
}

let db;
try {
  db = new Database(dbPath);
} catch (err) {
  console.error("[repair-db] Failed to open database:", err);
  process.exit(1);
}

try {
  const userTable = db
    .prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'User'")
    .get();
  if (!userTable?.ok) {
    console.log("[repair-db] User table not found — run Prisma migrations first.");
    process.exit(0);
  }

  const userCount = db.prepare('SELECT COUNT(*) AS n FROM "User"').get();
  console.log(`[repair-db] Users in database: ${userCount?.n ?? "?"}`);

  const hasBio = db
    .prepare("SELECT COUNT(*) AS n FROM pragma_table_info('User') WHERE name = 'bio'")
    .get();
  if ((hasBio?.n ?? 0) === 0) {
    console.log("[repair-db] Adding User.bio column…");
    db.exec('ALTER TABLE "User" ADD COLUMN "bio" TEXT');
    console.log("[repair-db] User.bio added.");
  } else {
    console.log("[repair-db] User.bio column present.");
  }
} catch (err) {
  console.error("[repair-db] Schema repair failed:", err);
  process.exit(1);
} finally {
  db.close();
}
