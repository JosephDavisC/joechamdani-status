"use client";

import { useState } from "react";

interface DayData {
  date: string;
  uptimePercent: number;
  totalPings: number;
  avgResponseTime: number;
}

interface UptimeBarProps {
  data: DayData[];
}

function getColor(uptime: number): string {
  if (uptime >= 100) return "bg-green-500";
  if (uptime >= 99.5) return "bg-green-700";
  if (uptime >= 95) return "bg-yellow-500";
  return "bg-red-500";
}

export function UptimeBar({ data }: UptimeBarProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Build 90-day array (fill gaps with "no data")
  const days: (DayData | null)[] = [];
  const today = new Date();
  const dataMap = new Map(data.map((d) => [d.date, d]));

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0]!;
    days.push(dataMap.get(key) ?? null);
  }

  return (
    <div className="relative">
      <div className="flex items-stretch" style={{ gap: "1px" }}>
        {days.map((day, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (89 - i));
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={i}
              className={`h-5 flex-1 rounded-[2px] ${
                day ? getColor(day.uptimePercent) : "bg-[var(--border)]"
              }`}
              style={{ minWidth: "2px" }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const text = day
                  ? `${dateStr} — ${day.uptimePercent}% uptime, avg ${day.avgResponseTime}ms`
                  : `${dateStr} — No data`;
                setTooltip({
                  text,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </div>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-[var(--popover)] px-3 py-1.5 text-xs font-medium text-[var(--popover-foreground)] shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          {tooltip.text}
        </div>
      )}
      <div className="mt-1 flex justify-between text-[10px] text-[var(--muted-foreground)]">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
