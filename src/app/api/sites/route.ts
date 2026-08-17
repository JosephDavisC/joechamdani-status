import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The sites list only changes once per cron tick (60s), so serve a short-lived
// in-memory copy instead of hitting Postgres for every viewer poll.
let cache: { at: number; payload: unknown } | null = null;
const CACHE_TTL_MS = 15_000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      return NextResponse.json(cache.payload);
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Do NOT use Prisma include { pings: { take: 1 } } here: it compiles to a
    // window-function query that scans the Ping table (4s+ at 1M rows). The
    // lateral join does one backward index lookup per site instead.
    const [sites, latestPings, aggregates] = await Promise.all([
      prisma.site.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      prisma.$queryRaw<
        Array<{
          siteId: string;
          status: number;
          responseTime: number;
          isUp: boolean;
          checkedAt: Date;
        }>
      >`
        SELECT p."siteId", p.status, p."responseTime", p."isUp", p."checkedAt"
        FROM "Site" s
        CROSS JOIN LATERAL (
          SELECT "siteId", status, "responseTime", "isUp", "checkedAt"
          FROM "Ping"
          WHERE "siteId" = s.id
          ORDER BY "checkedAt" DESC
          LIMIT 1
        ) p
        WHERE s.active = true`,
      // One index-only aggregation for all sites, instead of two counts per site
      prisma.$queryRaw<Array<{ siteId: string; total: bigint; up: bigint }>>`
        SELECT
          "siteId",
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (WHERE "isUp")::bigint AS up
        FROM "Ping"
        WHERE "checkedAt" >= ${ninetyDaysAgo}
        GROUP BY "siteId"`,
    ]);

    const latestBySite = new Map(latestPings.map((p) => [p.siteId, p]));
    const aggBySite = new Map(aggregates.map((a) => [a.siteId, a]));

    const result = sites.map((site) => {
      const agg = aggBySite.get(site.id);
      const totalCount = Number(agg?.total ?? 0);
      const upCount = Number(agg?.up ?? 0);
      const latestPing = latestBySite.get(site.id);
      const uptime90d = totalCount > 0 ? (upCount / totalCount) * 100 : 100;

      return {
        id: site.id,
        name: site.name,
        url: site.url,
        group: site.group ?? null,
        status: latestPing?.isUp ? "up" : totalCount === 0 ? "unknown" : "down",
        responseTime: latestPing?.responseTime ?? null,
        uptime90d: Math.round(uptime90d * 100) / 100,
        lastChecked: latestPing?.checkedAt ?? null,
      };
    });

    const payload = { data: result };
    cache = { at: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
