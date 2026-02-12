import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        pings: {
          orderBy: { checkedAt: "desc" },
          take: 1,
          select: {
            status: true,
            responseTime: true,
            isUp: true,
            checkedAt: true,
          },
        },
      },
    });

    // Calculate 90-day uptime for each site
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const result = await Promise.all(
      sites.map(async (site) => {
        const [totalCount, upCount] = await Promise.all([
          prisma.ping.count({
            where: { siteId: site.id, checkedAt: { gte: ninetyDaysAgo } },
          }),
          prisma.ping.count({
            where: {
              siteId: site.id,
              checkedAt: { gte: ninetyDaysAgo },
              isUp: true,
            },
          }),
        ]);

        const latestPing = site.pings[0];
        const uptime90d = totalCount > 0 ? (upCount / totalCount) * 100 : 100;

        return {
          id: site.id,
          name: site.name,
          url: site.url,
          status: latestPing?.isUp ? "up" : totalCount === 0 ? "unknown" : "down",
          responseTime: latestPing?.responseTime ?? null,
          uptime90d: Math.round(uptime90d * 100) / 100,
          lastChecked: latestPing?.checkedAt ?? null,
        };
      })
    );

    return NextResponse.json({ data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
