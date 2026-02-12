import { prisma } from "@/lib/prisma";
import { pingSite } from "@/lib/ping";
import type { Site } from "@/generated/prisma/client";

async function detectIncident(site: Site, isUp: boolean) {
  const ongoingIncident = await prisma.incident.findFirst({
    where: { siteId: site.id, resolvedAt: null },
  });

  if (!isUp) {
    // 3-strike rule: only create incident after 3 consecutive failures
    const recentPings = await prisma.ping.findMany({
      where: { siteId: site.id },
      orderBy: { checkedAt: "desc" },
      take: 3,
    });
    const allDown =
      recentPings.length >= 3 && recentPings.every((p) => !p.isUp);

    if (allDown && !ongoingIncident) {
      const oldest = recentPings[recentPings.length - 1];
      await prisma.incident.create({
        data: {
          siteId: site.id,
          title: `${site.name} went down`,
          startedAt: oldest?.checkedAt ?? new Date(),
        },
      });
    }
  } else if (ongoingIncident) {
    const duration = Math.round(
      (Date.now() - ongoingIncident.startedAt.getTime()) / 1000
    );
    await prisma.incident.update({
      where: { id: ongoingIncident.id },
      data: { resolvedAt: new Date(), duration },
    });
  }
}

async function cleanupOldPings() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  await prisma.ping.deleteMany({ where: { checkedAt: { lt: cutoff } } });
}

export async function runChecks() {
  const sites = await prisma.site.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  for (const site of sites) {
    const result = await pingSite(site.url);

    await prisma.ping.create({
      data: {
        siteId: site.id,
        status: result.status,
        responseTime: result.responseTime,
        isUp: result.isUp,
      },
    });

    await detectIncident(site, result.isUp);
  }

  await cleanupOldPings();

  return sites.length;
}
