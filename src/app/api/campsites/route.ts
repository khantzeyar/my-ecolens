import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sites = await prisma.campSite.findMany();
    return NextResponse.json(sites);
  } catch (_error) {
    console.error("Failed to fetch campsites:", _error);
    return NextResponse.json(
      { error: "Failed to fetch campsites" },
      { status: 500 }
    );
  }
}