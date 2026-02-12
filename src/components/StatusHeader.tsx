"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatusHeaderProps {
  allUp: boolean;
  someDown: boolean;
  majorOutage: boolean;
  loading: boolean;
  overallUptime: number | null;
}

export function StatusHeader({
  allUp,
  someDown,
  majorOutage,
  loading,
  overallUptime,
}: StatusHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const statusText = loading
    ? "Checking systems..."
    : majorOutage
      ? "Major Outage"
      : someDown
        ? "Partial Outage"
        : "All Systems Operational";

  const statusColor = loading
    ? "bg-[var(--muted-foreground)]"
    : majorOutage
      ? "bg-[var(--status-down)]"
      : someDown
        ? "bg-[var(--status-degraded)]"
        : "bg-[var(--status-up)]";

  const statusGlow = loading
    ? ""
    : majorOutage
      ? "glow-down"
      : someDown
        ? "glow-degraded"
        : "glow-up";

  // Pulse on all non-loading states to draw attention
  const showPulse = !loading && (allUp || someDown || majorOutage);
  const pulseColor = majorOutage
    ? "bg-[var(--status-down)]"
    : someDown
      ? "bg-[var(--status-degraded)]"
      : "bg-[var(--status-up)]";

  return (
    <header className="glass-card mb-8 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://joechamdani.com/Logo_Joseph.webp"
            alt="Joseph Davis Chamdani"
            className="h-8 w-8 rounded-full"
          />
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-[var(--foreground)]">
              status.joechamdani.com
            </h1>
          </div>
        </div>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div
              className={`h-3 w-3 rounded-full ${statusColor} ${statusGlow}`}
            />
            {showPulse && (
              <div
                className={`absolute inset-0 h-3 w-3 animate-ping rounded-full ${pulseColor} opacity-30`}
              />
            )}
          </div>
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight">
            {statusText}
          </span>
        </div>

        {overallUptime !== null && (
          <span className="font-[family-name:var(--font-mono)] text-sm tabular-nums text-[var(--muted-foreground)]">
            {overallUptime}% overall
          </span>
        )}
      </div>
    </header>
  );
}
