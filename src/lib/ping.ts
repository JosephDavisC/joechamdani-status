export interface PingResult {
  status: number;
  responseTime: number;
  isUp: boolean;
}

export async function pingSite(url: string): Promise<PingResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
    });
    clearTimeout(timeout);
    return {
      status: res.status,
      responseTime: Date.now() - start,
      isUp: res.status >= 200 && res.status < 400,
    };
  } catch {
    return { status: 0, responseTime: Date.now() - start, isUp: false };
  }
}
