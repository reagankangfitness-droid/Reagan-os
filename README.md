# Reagan OS

Atomic Habits-based daily execution and performance tracking system for a solo founder-athlete.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/reagankangfitness-droid/Reagan-os)

## What it does

Single-page dashboard with 6 tabs:

- **Today** — Daily habit checklist with progress ring and streak counter
- **Scorecard** — Weekly 7-day habit grid with streak stats
- **Income** — 3-pillar income tracker toward $10k/month goal
- **Pipeline** — SaaS idea scoring (0-4) with validation filters
- **Content** — Content idea bank with pillar/format tagging and status tracking
- **Training** — 13-week CrossFit + Hyrox program tracker with biometric check-ins

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Vercel KV (Redis) for persistence
- SWR for data fetching

## Getting Started

```bash
npm install
cp .env.local.example .env.local  # Add your Vercel KV credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel deployment steps.

## Architecture

See [CLAUDE.md](./CLAUDE.md) for detailed architecture docs, KV schema, API routes, and extension guide.
