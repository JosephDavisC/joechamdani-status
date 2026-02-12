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

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <StatusHeader
        allUp={allUp}
        someDown={someDown}
        majorOutage={majorOutage}
        loading={isLoading}
        overallUptime={overallUptime}
      />

      <section className="space-y-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </section>

      {sites.length > 0 && (
        <section className="mt-8">
          <ResponseTimeChart
            sites={sites.map((s) => ({ id: s.id, name: s.name }))}
          />
        </section>
      )}

      <section className="mt-8">
        <IncidentFeed />
      </section>

      <Footer lastChecked={lastChecked} />
    </main>
  );
}
