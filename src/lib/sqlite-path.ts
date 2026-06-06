import path from "path";

/** SQLite file path — must match prisma migrate target (set SQLITE_DATABASE_PATH in start.sh). */
export function resolveSqliteDatabasePath(): string {
  const explicit = process.env.SQLITE_DATABASE_PATH?.trim();
  if (explicit) {
    return explicit;
  }
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    return path.join(/* turbopackIgnore: true */ process.cwd(), "dev.db");
  }
  if (raw.startsWith("file:")) {
    const filePath = raw.slice("file:".length);
    return path.isAbsolute(filePath)
      ? filePath
      : path.join(/* turbopackIgnore: true */ process.cwd(), filePath);
  }
  throw new Error(`Unsupported DATABASE_URL for SQLite: ${raw}`);
}
