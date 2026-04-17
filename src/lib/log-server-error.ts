/**
 * Log API/server errors without dumping full Prisma/stack traces in production logs
 * (reduces accidental leakage if logs are forwarded or exported).
 */
export function logServerError(context: string, err: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(context, err);
    return;
  }
  if (err instanceof Error) {
    console.error(context, err.name, err.message);
    return;
  }
  console.error(context, String(err));
}
