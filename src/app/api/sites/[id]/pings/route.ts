import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "90", 10);

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Daily aggregated uptime data
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        date: string;
        total_pings: bigint;
        up_pings: bigint;
        uptime_percent: number;
        avg_response_time: number;
      }>
    >(
      `SELECT
        TO_CHAR("checkedAt" AT TIME ZONE 'America/Los_Angeles', 'YYYY-MM-DD') AS date,
        COUNT(*)::bigint AS total_pings,
        COUNT(*) FILTER (WHERE "isUp" = true)::bigint AS up_pings,
        ROUND((COUNT(*) FILTER (WHERE "isUp" = true)::numeric / NULLIF(COUNT(*), 0)) * 100, 2) AS uptime_percent,
        ROUND(AVG("responseTime")::numeric, 0) AS avg_response_time
      FROM "Ping"
      WHERE "siteId" = $1 AND "checkedAt" >= $2
      GROUP BY date
      ORDER BY date ASC`,
      id,
      cutoff
    );

    const data = rows.map((row) => ({
      date: row.date,
      totalPings: Number(row.total_pings),
      upPings: Number(row.up_pings),
      uptimePercent: Number(row.uptime_percent),
      avgResponseTime: Number(row.avg_response_time),
    }));

    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
