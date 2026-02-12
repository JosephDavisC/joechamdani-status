import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const hours = parseInt(searchParams.get("hours") ?? "24", 10);

  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    const pings = await prisma.ping.findMany({
      where: { siteId: id, checkedAt: { gte: cutoff } },
      orderBy: { checkedAt: "asc" },
      select: {
        responseTime: true,
        isUp: true,
        checkedAt: true,
      },
    });

    return NextResponse.json({ data: pings });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
