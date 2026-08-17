# Status Page – joechamdani.com

[![Website](https://img.shields.io/badge/Website-status.joechamdani.com-60A5FA?style=for-the-badge&logo=vercel&logoColor=white)](https://status.joechamdani.com)
[![Uptime](https://img.shields.io/badge/Monitoring-9_Sites-22c55e?style=for-the-badge)](https://status.joechamdani.com)

---

## About

A **public status page** that monitors uptime and response times for all joechamdani.com services. Fully standalone, no authentication required.

Live Site: **[status.joechamdani.com](https://status.joechamdani.com)**

---

## Features

- **Real-time monitoring** of 9 websites with 60-second ping intervals
- **90-day uptime bars** with per-day color coding and hover tooltips
- **24h response time charts** per site (expandable) and multi-site overlay
- **Incident detection** with 3-strike rule (3 consecutive failures before alerting)
- **Incident history** with ongoing/resolved timeline
- **Dual theme system** matching joechamdani.com (warm light mode + navy glassmorphism dark mode)
- **System-aware theme** with manual toggle
- **Mobile-friendly** responsive layout across all components
- **SEO optimized** with Open Graph, Twitter Cards, JSON-LD, sitemap, robots.txt

---

## Monitored Sites

| Group | Site | URL |
|-------|------|-----|
| Personal | Portfolio | [joechamdani.com](https://joechamdani.com) |
| Personal | Freelance | [freelance.joechamdani.com](https://freelance.joechamdani.com) |
| Personal | CDN | [cdn.joechamdani.com](https://cdn.joechamdani.com) |
| UW Projects | UW Portfolio | [uw.joechamdani.com](https://uw.joechamdani.com) |
| UW Projects | Transfer Tool | [transfer.joechamdani.cloud](https://transfer.joechamdani.cloud) |
| UW Projects | INFO 340 | [info340.joechamdani.com](https://info340.joechamdani.com) |
| UW Projects | INFO 200 | [info200.joechamdani.cloud](https://info200.joechamdani.cloud) |
| UW Projects | INFO 360 | [info360.joechamdani.com](https://info360.joechamdani.com) |
| UW Projects | INFO 380 | [info380.joechamdani.com](https://info380.joechamdani.com) |

dashboard.joechamdani.com exists in the database with `active: false` — it is private and monitored from the personal dashboard instead of this public page.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, standalone output)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with custom CSS variables
- **Database**: PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- **Charts**: Recharts
- **Data Fetching**: TanStack React Query (polling)
- **Theme**: next-themes (system preference + toggle)
- **Fonts**: Manrope, Plus Jakarta Sans, JetBrains Mono
- **Deployment**: Docker (4-stage build), sidecar on same VPS as dashboard

---

## Project Structure

```
status/
├── prisma/
│   ├── schema.prisma        # Site, Ping, Incident models
│   ├── seed.ts              # Seed monitored sites
│   └── migrations/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Fonts, metadata, JSON-LD, viewport
│   │   ├── page.tsx         # Main status page (React Query polling)
│   │   ├── globals.css      # Dual theme vars, glassmorphism
│   │   └── api/
│   │       ├── health/      # Health check
│   │       ├── cron/        # Token-protected monitoring trigger
│   │       ├── sites/       # All sites with status + uptime
│   │       ├── sites/[id]/pings/           # 90-day daily aggregates
│   │       ├── sites/[id]/response-times/  # Raw 24h pings
│   │       └── incidents/   # Incident history
│   ├── components/
│   │   ├── StatusHeader.tsx      # Logo, status banner, pulse dot, theme toggle
│   │   ├── SiteCard.tsx          # Expandable card with badge, URL, uptime bar
│   │   ├── UptimeBar.tsx         # 90-day cells with floating tooltip
│   │   ├── ResponseSparkline.tsx # Per-site 24h area chart
│   │   ├── ResponseTimeChart.tsx # Multi-site overlay chart with legend
│   │   ├── IncidentFeed.tsx      # Ongoing + resolved incidents
│   │   ├── Footer.tsx            # Attribution + live "last checked" timer
│   │   └── providers.tsx         # QueryClient + ThemeProvider
│   └── lib/
│       ├── prisma.ts        # PrismaPg adapter singleton
│       ├── ping.ts          # HEAD request with 10s timeout
│       └── monitor.ts       # 3-strike incident detection, cleanup
└── docker/
    └── Dockerfile           # 4-stage: deps → builder → prod-deps → runner
```

---

## Architecture

```
Cron (every 60s)
  → GET /api/cron?token=SECRET
    → pingSite() for each active site (HEAD, 10s timeout)
    → Store Ping record in DB
    → detectIncident() (3 consecutive failures → create incident)
    → cleanupOldPings() (90-day retention)

Client (React Query polling)
  → /api/sites (30s)        → site list + status + uptime
  → /api/incidents (60s)    → incident timeline
  → /api/sites/[id]/pings (5m)  → 90-day uptime bars
  → /api/sites/[id]/response-times (60s, on expand)  → sparkline
```
