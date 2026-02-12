"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ExternalLink } from "lucide-react";
import { UptimeBar } from "./UptimeBar";
import { ResponseSparkline } from "./ResponseSparkline";

interface SiteData {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "unknown";
  responseTime: number | null;
  uptime90d: number;
  lastChecked: string | null;
}

interface DayData {
  date: string;
  uptimePercent: number;
  totalPings: number;
  avgResponseTime: number;
}

interface PingData {
  responseTime: number;
  isUp: boolean;
  checkedAt: string;
}

export function SiteCard({ site }: { site: SiteData }) {
  const [expanded, setExpanded] = useState(false);

  const { data: history = [] } = useQuery<DayData[]>({
    queryKey: ["pings", site.id],
    queryFn: async () => {
      const res = await fetch(`/api/sites/${site.id}/pings?days=90`);
      const json = (await res.json()) as { data: DayData[] };
      return json.data;
    },
    refetchInterval: 300_000,
  });

  const { data: responseTimes = [] } = useQuery<PingData[]>({
    queryKey: ["response-times", site.id],
    queryFn: async () => {
      const res = await fetch(
        `/api/sites/${site.id}/response-times?hours=24`
      );
      const json = (await res.json()) as { data: PingData[] };
      return json.data;
    },
    enabled: expanded,
    refetchInterval: 60_000,
  });

  // Show "—" for down sites instead of misleading fast response times
  const displayResponseTime =
    site.status === "down"
      ? "—"
      : site.responseTime !== null
        ? `${site.responseTime}ms`
        : null;

  const statusBadge =
    site.status === "up" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 glow-up" />
        Operational
      </span>
    ) : site.status === "down" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-500">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 glow-down" />
        Down
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)]/50 px-2.5 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)]" />
        Unknown
      </span>
    );

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--foreground)] sm:text-[15px]">
              {site.name}
            </h3>
            {statusBadge}
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
          >
            {site.url.replace(/^https?:\/\//, "")}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:gap-4">
          {displayResponseTime && (
            <span className="hidden font-[family-name:var(--font-mono)] text-sm tabular-nums text-[var(--muted-foreground)] sm:inline">
              {displayResponseTime}
            </span>
          )}
          <span className="font-[family-name:var(--font-mono)] text-sm tabular-nums font-semibold text-[var(--foreground)]">
            {site.uptime90d}%
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div className="px-3 pb-2 sm:px-4 sm:pb-3">
        <UptimeBar data={history} />
      </div>

      {expanded && (
        <div className="border-t border-[var(--border)] px-3 py-3 sm:px-4 sm:py-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-[family-name:var(--font-heading)] text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Response Time (24h)
            </h4>
            {displayResponseTime && (
              <span className="font-[family-name:var(--font-mono)] text-xs tabular-nums text-[var(--muted-foreground)] sm:hidden">
                {displayResponseTime}
              </span>
            )}
          </div>
          {responseTimes.length >= 5 ? (
            <ResponseSparkline data={responseTimes} />
          ) : (
            <p className="py-4 text-center text-xs text-[var(--muted-foreground)]">
              Collecting response data...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
