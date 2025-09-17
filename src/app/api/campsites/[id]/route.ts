import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const campsite = await prisma.campSite.findUnique({
      where: { id: Number(params.id) },
    });

    if (!campsite) {
      return NextResponse.json({ error: "Campsite not found" }, { status: 404 });
    }

    return NextResponse.json(campsite);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch campsite" },
      { status: 500 }
    );
  }
}