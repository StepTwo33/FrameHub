import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowedBuildType, safeParseBuildJson } from "@/lib/build-types";

const BUILD_NAME_MAX = 200;

// GET /api/builds?type=weapon
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  if (type && !isAllowedBuildType(type)) {
    return NextResponse.json({ error: "Invalid build type" }, { status: 400 });
  }

  const where: { userId: string; type?: string } = { userId: session.user.id };
  if (type) where.type = type;

  const builds = await prisma.build.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    builds.map((b: { id: string; name: string; description: string; isPublic: boolean; type: string; data: string; createdAt: Date; updatedAt: Date }) => {
      const data = safeParseBuildJson(b.data);
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        isPublic: b.isPublic,
        type: b.type,
        data: data ?? {},
        createdAt: b.createdAt.getTime(),
        updatedAt: b.updatedAt.getTime(),
      };
    })
  );
}

// POST /api/builds
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await req.text();
  if (rawBody.length > 500_000) {
    return NextResponse.json({ error: "Build data too large" }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, name, description, isPublic, type, data } = body;

  if (!name || !type || !data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (typeof name !== "string" || name.trim().length === 0 || name.length > BUILD_NAME_MAX) {
    return NextResponse.json(
      { error: `Name is required and must be at most ${BUILD_NAME_MAX} characters` },
      { status: 400 }
    );
  }

  if (!isAllowedBuildType(type)) {
    return NextResponse.json({ error: "Invalid build type" }, { status: 400 });
  }

  // Upsert: update if id exists and belongs to user, otherwise create
  if (id) {
    const existing = await prisma.build.findFirst({
      where: { id, userId: session.user.id },
    });
    if (existing) {
      const updated = await prisma.build.update({
        where: { id },
        data: {
          name: String(name).trim(),
          description: typeof description === "string" ? description.slice(0, 2000) : "",
          isPublic: isPublic ?? false,
          data: JSON.stringify(data)
        },
      });
      return NextResponse.json({
        id: updated.id,
        name: updated.name,
        description: updated.description,
        isPublic: updated.isPublic,
        type: updated.type,
        data: JSON.parse(updated.data),
        createdAt: updated.createdAt.getTime(),
        updatedAt: updated.updatedAt.getTime(),
      });
    }
  }

  const build = await prisma.build.create({
    data: {
      userId: session.user.id,
      name: String(name).trim(),
      description: typeof description === "string" ? description.slice(0, 2000) : "",
      isPublic: isPublic ?? false,
      type,
      data: JSON.stringify(data),
    },
  });

  return NextResponse.json({
    id: build.id,
    name: build.name,
    description: build.description,
    isPublic: build.isPublic,
    type: build.type,
    data: JSON.parse(build.data),
    createdAt: build.createdAt.getTime(),
    updatedAt: build.updatedAt.getTime(),
  });
}
