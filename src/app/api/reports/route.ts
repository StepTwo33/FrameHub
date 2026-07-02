import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { normalizeReportItemType } from "@/lib/report-types";
import { logServerError } from "@/lib/log-server-error";

const REPORT_BODY_MAX = 120_000;
const REPORT_NAME_MAX = 200;
const REPORT_COMMENT_MAX = 8_000;
const REPORT_REPORTER_MAX = 100;
const REPORT_ITEM_ID_MAX = 200;

// GET /api/reports — anyone logged in can see their own reports; admin/mod sees all
export async function GET(req: NextRequest) {
  const session = await getSession();
  const { isAdmin } = await verifyAdmin();
  const status = req.nextUrl.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (!isAdmin && session?.user) {
    where.userId = session.user.id;
  } else if (!isAdmin) {
    return NextResponse.json([]);
  }
  if (status && status !== "all") {
    const allowedStatus = ["open", "resolved", "wontfix"];
    if (allowedStatus.includes(status)) {
      where.status = status;
    }
  }

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  return NextResponse.json(reports);
}

// POST /api/reports — anyone (logged in or not) can submit
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`report:${ip}`, 10, 60 * 60 * 1000);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Too many reports. Please try again later." },
        { status: 429 }
      );
    }

    const raw = await req.text();
    if (raw.length > REPORT_BODY_MAX) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const session = await getSession();

    const reporterRaw =
      typeof body.reporterName === "string" ? body.reporterName.trim() : "";
    const reporterName = (
      reporterRaw.slice(0, REPORT_REPORTER_MAX) ||
      (typeof session?.user?.name === "string" ? session.user.name.slice(0, REPORT_REPORTER_MAX) : "") ||
      "Anonymous"
    ).slice(0, REPORT_REPORTER_MAX);

    const itemName =
      (typeof body.itemName === "string" ? body.itemName.trim().slice(0, REPORT_NAME_MAX) : "") || "Unknown";
    const itemId =
      typeof body.itemId === "string" ? body.itemId.trim().slice(0, REPORT_ITEM_ID_MAX) : "";
    const comment =
      typeof body.comment === "string" ? body.comment.trim().slice(0, REPORT_COMMENT_MAX) : "";

    const report = await prisma.report.create({
      data: {
        userId: session?.user?.id ?? null,
        reporterName,
        itemType: normalizeReportItemType(body.itemType),
        itemName,
        itemId,
        issues: JSON.stringify(body.issues && typeof body.issues === "object" ? body.issues : {}),
        statDiscrepancies: JSON.stringify(
          Array.isArray(body.statDiscrepancies) ? body.statDiscrepancies.slice(0, 500) : []
        ),
        comment,
        status: "open",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (e) {
    logServerError("POST /api/reports", e);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
