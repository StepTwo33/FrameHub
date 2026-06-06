import path from "path";

/** SQLite file path from DATABASE_URL (e.g. file:./dev.db). Must match prisma migrate target. */
export function resolveSqliteDatabasePath(): string {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    return path.resolve(process.cwd(), "dev.db");
  }
  if (raw.startsWith("file:")) {
    const filePath = raw.slice("file:".length);
    return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  }
  throw new Error(`Unsupported DATABASE_URL for SQLite: ${raw}`);
}
