"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceStrict } from "date-fns";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Incident {
  id: string;
  siteId: string;
  type: string;
  title: string;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
  site: {
    name: string;
    url: string;
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function IncidentFeed() {
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["incidents"],
    queryFn: async () => {
      const res = await fetch("/api/incidents?days=90");
      const json = (await res.json()) as { data: Incident[] };
      return json.data;
    },
    refetchInterval: 60_000,
  });

  const ongoing = incidents.filter((i) => !i.resolvedAt);
  const resolved = incidents.filter((i) => i.resolvedAt);

  return (
    <div className="glass-card p-4 sm:p-6">
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-[var(--foreground)]">
        Incident History
      </h2>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-sm text-[var(--muted-foreground)]">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>No incidents in the last 90 days</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Ongoing incidents first */}
          {ongoing.map((incident) => (
            <div
              key={incident.id}
              className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3"
            >
              <div className="relative mt-0.5 shrink-0">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {incident.title}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Started{" "}
                  {formatDistanceStrict(
                    new Date(incident.startedAt),
                    new Date(),
                    { addSuffix: true }
                  )}{" "}
                  — Ongoing
                </p>
              </div>
            </div>
          ))}

          {/* Resolved incidents */}
          {resolved.map((incident) => (
            <div
              key={incident.id}
              className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {incident.title}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {format(new Date(incident.startedAt), "MMM d, HH:mm")}
                  {incident.duration !== null &&
                    ` — Duration: ${formatDuration(incident.duration)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
