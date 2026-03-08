"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface SiteOption {
  id: string;
  name: string;
}

interface DayData {
  date: string;
  uptimePercent: number;
  totalPings: number;
  avgResponseTime: number;
}

function getColor(uptime: number): string {
  if (uptime >= 100) return "bg-green-500";
  if (uptime >= 99.5) return "bg-green-700";
  if (uptime >= 95) return "bg-yellow-500";
  if (uptime >= 90) return "bg-orange-500";
  return "bg-red-500";
}

function getColorHex(uptime: number): string {
  if (uptime >= 100) return "#22c55e";
  if (uptime >= 99.5) return "#15803d";
  if (uptime >= 95) return "#eab308";
  if (uptime >= 90) return "#f97316";
  return "#ef4444";
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function formatMonth(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Custom dropdown component
function SiteDropdown({
  sites,
  selectedId,
  onChange,
}: {
  sites: SiteOption[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = sites.find((s) => s.id === selectedId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
      >
        <span>{selected?.name ?? "Select site"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-xl">
          {sites.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onChange(s.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--accent)] ${
                s.id === selectedId
                  ? "font-medium text-[var(--primary)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function UptimeHistory({ sites }: { sites: SiteOption[] }) {
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id ?? "");
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const endMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset * 3);
  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    for (let i = -2; i <= 0; i++) {
      const d = new Date(endMonth.getFullYear(), endMonth.getMonth() + i);
      result.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return result;
  }, [endMonth.getFullYear(), endMonth.getMonth()]);

  const rangeLabel = useMemo(() => {
    const first = months[0]!;
    const last = months[months.length - 1]!;
    const f = new Date(first.year, first.month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const l = new Date(last.year, last.month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return `${f} to ${l}`;
  }, [months]);

  const { data: history = [] } = useQuery<DayData[]>({
    queryKey: ["uptime-history", selectedSiteId],
    queryFn: async () => {
      const res = await fetch(`/api/sites/${selectedSiteId}/pings?days=180`);
      const json = (await res.json()) as { data: DayData[] };
      return json.data;
    },
    enabled: !!selectedSiteId,
    refetchInterval: 300_000,
  });

  const dataMap = useMemo(
    () => new Map(history.map((d) => [d.date, d])),
    [history]
  );

  const monthlyUptimes = useMemo(() => {
    return months.map(({ year, month }) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let totalPings = 0;
      let weightedUptime = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const day = dataMap.get(key);
        if (day) {
          totalPings += day.totalPings;
          weightedUptime += day.uptimePercent * day.totalPings;
        }
      }

      return totalPings > 0
        ? Math.round((weightedUptime / totalPings) * 100) / 100
        : null;
    });
  }, [months, dataMap]);

  const isCurrentRange = monthOffset === 0;
  const today = now.toISOString().split("T")[0]!;

  const [tooltip, setTooltip] = useState<{
    text: string;
    anchorX: number;
    anchorY: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipLeft, setTooltipLeft] = useState(0);

  // After tooltip renders, measure it and clamp to viewport
  const updateTooltipPos = useCallback(() => {
    if (!tooltip || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const w = el.offsetWidth;
    const left = Math.max(8, Math.min(window.innerWidth - w - 8, tooltip.anchorX - w / 2));
    setTooltipLeft(left);
  }, [tooltip]);

  useEffect(() => {
    updateTooltipPos();
  }, [updateTooltipPos]);

  const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="glass-card p-4 sm:p-6">
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--foreground)] sm:text-base">
        Uptime History
      </h2>

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SiteDropdown
          sites={sites}
          selectedId={selectedSiteId}
          onChange={setSelectedSiteId}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="rounded-md border border-[var(--border)] p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-0 flex-1 text-center text-xs font-medium text-[var(--muted-foreground)] sm:text-sm">
            {rangeLabel}
          </span>
          <button
            onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
            disabled={isCurrentRange}
            className="rounded-md border border-[var(--border)] p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Month grids */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {months.map(({ year, month }, mi) => {
          const cells = getMonthGrid(year, month);
          const uptimePct = monthlyUptimes[mi];

          return (
            <div key={`${year}-${month}`}>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-xs font-semibold text-[var(--foreground)] sm:text-sm">
                  {formatMonth(year, month)}
                </h3>
                {uptimePct != null && (
                  <span
                    className="font-[family-name:var(--font-mono)] text-xs font-semibold tabular-nums"
                    style={{ color: getColorHex(uptimePct) }}
                  >
                    {uptimePct}%
                  </span>
                )}
              </div>

              <div className="mb-1 grid grid-cols-7 gap-[3px]">
                {DOW_LABELS.map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-[9px] font-medium text-[var(--muted-foreground)]"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-[3px]">
                {cells.map((day, i) => {
                  if (day === null) {
                    return <div key={i} className="aspect-square" />;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isFuture = dateStr > today;
                  const data = dataMap.get(dateStr);

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-[3px] ${
                        isFuture
                          ? "bg-[var(--border)] opacity-30"
                          : data
                            ? getColor(data.uptimePercent)
                            : "bg-[var(--border)]"
                      }`}
                      onMouseEnter={(e) => {
                        if (isFuture) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const label = new Date(year, month, day).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        );
                        const text = data
                          ? `${label} — ${data.uptimePercent}% uptime, avg ${data.avgResponseTime}ms`
                          : `${label} — No data`;
                        setTooltip({
                          text,
                          anchorX: rect.left + rect.width / 2,
                          anchorY: rect.top,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-[var(--muted-foreground)]">
        <span>Downtime</span>
        <div className="flex gap-[2px]">
          <div className="h-2.5 w-2.5 rounded-[2px] bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-orange-500" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-green-600" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-green-500" />
        </div>
        <span>No downtime</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md bg-[var(--popover)] px-3 py-1.5 text-xs font-medium text-[var(--popover-foreground)] shadow-lg"
          style={{
            left: tooltipLeft,
            top: tooltip.anchorY - 8,
            transform: "translateY(-100%)",
            border: "1px solid var(--border)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
