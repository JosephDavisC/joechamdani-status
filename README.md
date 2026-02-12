# Status Page – joechamdani.com

[![Website](https://img.shields.io/badge/Website-status.joechamdani.com-60A5FA?style=for-the-badge&logo=vercel&logoColor=white)](https://status.joechamdani.com)
[![Uptime](https://img.shields.io/badge/Monitoring-6_Sites-22c55e?style=for-the-badge)](https://status.joechamdani.com)

---

## About

A **public status page** that monitors uptime and response times for all joechamdani.com services. Fully standalone, no authentication required.

Live Site: **[status.joechamdani.com](https://status.joechamdani.com)**

---

## Features

- **Real-time monitoring** of 6 websites with 60-second ping intervals
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

| Site | URL |
|------|-----|
| Portfolio | [joechamdani.com](https://joechamdani.com) |
| Dashboard | [dashboard.joechamdani.com](https://dashboard.joechamdani.com) |
| UW Portfolio | [uw.joechamdani.com](https://uw.joechamdani.com) |
| Transfer Tool | [transfer.joechamdani.cloud](https://transfer.joechamdani.cloud) |
| INFO 340 | [info340.joechamdani.com](https://info340.joechamdani.com) |
| INFO 200 | [info200.joechamdani.cloud](https://info200.joechamdani.cloud) |

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
│   ├── seed.ts              # Seed 6 monitored sites
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

## Local Development

```bash
# install dependencies
pnpm install

# create local database (assumes PostgreSQL running)
createdb status_dev

# configure environment
cp .env.example .env.local
# edit .env.local with your DATABASE_URL and CRON_SECRET

# run migrations
pnpm prisma migrate dev

# seed sites
pnpm tsx prisma/seed.ts

# start dev server
pnpm dev

# trigger a monitoring round
curl "http://localhost:3000/api/cron?token=YOUR_CRON_SECRET"
```

---

## Deployment

Runs as a Docker sidecar alongside the dashboard on the same VPS (port 3003). Uses a separate `status` database in the shared PostgreSQL instance.

External cron job (cron-job.org) pings `/api/cron?token=SECRET` every 60 seconds to trigger monitoring rounds.

---

## Architecture

```
cron-job.org (every 60s)
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
