import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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
    where.status = status;
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

    const body = await req.json();
    const session = await getSession();

    const report = await prisma.report.create({
      data: {
        userId: session?.user?.id ?? null,
        reporterName: body.reporterName?.trim() || session?.user?.name || "Anonymous",
        itemType: body.itemType || "other",
        itemName: body.itemName?.trim() || "Unknown",
        itemId: body.itemId?.trim() || "",
        issues: JSON.stringify(body.issues || {}),
        statDiscrepancies: JSON.stringify(body.statDiscrepancies || []),
        comment: body.comment?.trim() || "",
        status: "open",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 400 });
  }
}
