"use client";

import { useQuery } from "@tanstack/react-query";
import { StatusHeader } from "@/components/StatusHeader";
import { SiteCard } from "@/components/SiteCard";
import { ResponseTimeChart } from "@/components/ResponseTimeChart";
import { IncidentFeed } from "@/components/IncidentFeed";
import { Footer } from "@/components/Footer";

interface SiteData {
  id: string;
  name: string;
  url: string;
  group: string | null;
  status: "up" | "down" | "unknown";
  responseTime: number | null;
  uptime90d: number;
  lastChecked: string | null;
}

export default function StatusPage() {
  const { data: sites = [], isLoading } = useQuery<SiteData[]>({
    queryKey: ["sites"],
    queryFn: async () => {
      const res = await fetch("/api/sites");
      const json = (await res.json()) as { data: SiteData[] };
      return json.data;
    },
    refetchInterval: 30_000,
  });

  const knownSites = sites.filter((s) => s.status !== "unknown");
  const downSites = knownSites.filter((s) => s.status === "down");
  const allUp = knownSites.length > 0 && downSites.length === 0;
  const someDown = downSites.length > 0;
  const majorOutage = downSites.length > knownSites.length / 2;

  // Calculate overall uptime across all sites
  const overallUptime =
    sites.length > 0
      ? Math.round(
          (sites.reduce((sum, s) => sum + s.uptime90d, 0) / sites.length) * 100
        ) / 100
      : null;

  const lastChecked =
    sites
      .map((s) => s.lastChecked)
      .filter(Boolean)
      .sort()
      .reverse()[0] ?? null;

  // Group sites by their group field, preserving order
  const groups: { label: string | null; sites: SiteData[] }[] = [];
  const seen = new Set<string | null>();
  for (const site of sites) {
    if (!seen.has(site.group)) {
      seen.add(site.group);
      groups.push({ label: site.group, sites: [] });
    }
    groups.find((g) => g.label === site.group)!.sites.push(site);
  }
  const hasGroups = groups.some((g) => g.label !== null);

  return (
    <main className="mx-auto max-w-3xl px-3 py-6 sm:px-6 sm:py-12">
      <StatusHeader
        allUp={allUp}
        someDown={someDown}
        majorOutage={majorOutage}
        loading={isLoading}
        overallUptime={overallUptime}
      />

      {hasGroups ? (
        <div className="space-y-6 sm:space-y-8">
          {groups.map((group) => (
            <section key={group.label ?? "other"}>
              {group.label && (
                <h2 className="mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </h2>
              )}
              <div className="space-y-2 sm:space-y-3">
                {group.sites.map((site) => (
                  <SiteCard key={site.id} site={site} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="space-y-2 sm:space-y-3">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </section>
      )}

      {sites.length > 0 && (
        <section className="mt-6 sm:mt-8">
          <ResponseTimeChart
            sites={sites.map((s) => ({ id: s.id, name: s.name }))}
          />
        </section>
      )}

      <section className="mt-6 sm:mt-8">
        <IncidentFeed />
      </section>

      <Footer lastChecked={lastChecked} />
    </main>
  );
}
