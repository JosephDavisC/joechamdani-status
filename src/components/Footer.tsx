"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface FooterProps {
  lastChecked: string | null;
}

export function Footer({ lastChecked }: FooterProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const lastCheckedText = lastChecked
    ? formatDistanceToNow(new Date(lastChecked), { addSuffix: true })
    : "never";

  // Suppress hydration warning by only showing dynamic time on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <footer className="mt-8 border-t border-[var(--border)] pt-6 pb-8">
      <div className="flex flex-col items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <p>
          Powered by{" "}
          <a
            href="https://joechamdani.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
          >
            Joseph Davis Chamdani
          </a>
        </p>
        {mounted && (
          <p className="font-[family-name:var(--font-mono)] tabular-nums" suppressHydrationWarning>
            Last checked: {lastCheckedText} &middot; Auto-refreshes every 30s
          </p>
        )}
      </div>
    </footer>
  );
}
