import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // make sure you already have prisma client in lib/prisma.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const site = await prisma.campSite.findUnique({
      where: { id: Number(params.id) },
    });

    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
