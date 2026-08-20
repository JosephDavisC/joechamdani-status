const NTFY_URL = "https://ntfy.joechamdani.com/alerts";

type NtfyPriority = "high" | "default";

// Push a notification to the self-hosted ntfy server.
// Never throws: a push failure must not break the monitoring cron.
export async function sendPush(
  title: string,
  message: string,
  priority: NtfyPriority = "default"
) {
  const token = process.env.NTFY_TOKEN;
  if (!token) {
    console.warn("[ntfy] NTFY_TOKEN not set, skipping push");
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(NTFY_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Title: title,
        Priority: priority,
      },
      body: message,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`[ntfy] push failed: HTTP ${res.status}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`[ntfy] push failed: ${msg}`);
  }
}

// Format seconds as a compact human duration, e.g. "45s", "6m", "1h 12m"
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}
