import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "90", 10);

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const incidents = await prisma.incident.findMany({
      where: { startedAt: { gte: cutoff } },
      orderBy: { startedAt: "desc" },
      include: {
        site: {
          select: { name: true, url: true },
        },
      },
    });

    return NextResponse.json({ data: incidents });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
