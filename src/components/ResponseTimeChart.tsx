"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { format } from "date-fns";

interface SiteInfo {
  id: string;
  name: string;
}

interface PingData {
  responseTime: number;
  isUp: boolean;
  checkedAt: string;
}

const SITE_COLORS = [
  "#22c55e",
  "#60a5fa",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#ec4899",
];

export function ResponseTimeChart({ sites }: { sites: SiteInfo[] }) {
  const { theme } = useTheme();
  const [activeSite, setActiveSite] = useState<string | null>(null);

  const queries = useQueries({
    queries: sites.map((site) => ({
      queryKey: ["response-times-chart", site.id],
      queryFn: async () => {
        const res = await fetch(
          `/api/sites/${site.id}/response-times?hours=24`
        );
        const json = (await res.json()) as { data: PingData[] };
        return { siteId: site.id, data: json.data };
      },
      refetchInterval: 60_000,
    })),
  });

  const allLoaded = queries.every((q) => q.data);
  if (!allLoaded) return null;

  // Merge all site data into a single time series
  type MergedRow = { time: number } & Record<string, number | null>;
  const mergedMap = new Map<number, MergedRow>();

  queries.forEach((q) => {
    if (!q.data) return;
    const { siteId, data } = q.data;
    data.forEach((p) => {
      // Round to nearest minute for alignment
      const time =
        Math.round(new Date(p.checkedAt).getTime() / 60000) * 60000;
      const existing = mergedMap.get(time) ?? ({ time } as MergedRow);
      existing[siteId] = p.isUp ? p.responseTime : null;
      mergedMap.set(time, existing);
    });
  });

  const chartData = Array.from(mergedMap.values()).sort(
    (a, b) => a.time - b.time
  );

  if (chartData.length < 2) return null;

  const tickColor = theme === "dark" ? "#8b95a5" : "#78716c";

  return (
    <div className="glass-card p-4 sm:p-6">
      <h2 className="mb-1 font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-[var(--foreground)]">
        Response Time
      </h2>
      <p className="mb-3 text-xs text-[var(--muted-foreground)] sm:mb-4">Last 24 hours</p>

      {/* Custom legend */}
      <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
        {sites.map((site, i) => {
          const color = SITE_COLORS[i % SITE_COLORS.length]!;
          const isActive = activeSite === null || activeSite === site.id;
          return (
            <button
              key={site.id}
              onClick={() =>
                setActiveSite(activeSite === site.id ? null : site.id)
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all sm:px-2.5 sm:py-1 sm:text-xs ${
                isActive
                  ? "border-[var(--border)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted-foreground)] opacity-40"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: color }}
              />
              {site.name}
            </button>
          );
        })}
      </div>

      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {sites.map((site, i) => (
                <linearGradient
                  key={site.id}
                  id={`grad-${site.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={SITE_COLORS[i % SITE_COLORS.length]}
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor={SITE_COLORS[i % SITE_COLORS.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(val: number) => format(new Date(val), "HH:mm")}
              tick={{ fontSize: 10, fill: tickColor }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10, fill: tickColor }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: number) => `${val}ms`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: 12,
              }}
              labelFormatter={(val) =>
                format(new Date(val as number), "MMM d, HH:mm")
              }
              formatter={(value, name) => {
                const site = sites.find((s) => s.id === name);
                return [`${value}ms`, site?.name ?? name];
              }}
            />
            <Legend content={() => null} />
            {sites.map((site, i) => {
              const color = SITE_COLORS[i % SITE_COLORS.length]!;
              const visible =
                activeSite === null || activeSite === site.id;
              return (
                <Area
                  key={site.id}
                  type="monotone"
                  dataKey={site.id}
                  stroke={visible ? color : "transparent"}
                  fill={visible ? `url(#grad-${site.id})` : "transparent"}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
