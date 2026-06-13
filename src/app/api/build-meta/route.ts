import { existsSync, readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Build id changes on every production build — used to detect stale client tabs after deploy. */
export async function GET() {
  const buildIdPath = path.join(process.cwd(), ".next/BUILD_ID");
  let buildId = process.env.NODE_ENV === "production" ? "unknown" : "dev";

  if (existsSync(buildIdPath)) {
    buildId = readFileSync(buildIdPath, "utf8").trim();
  }

  return NextResponse.json(
    { buildId },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
