# Reagan OS

**Atomic Habits-based daily execution and performance tracking system for a solo founder-athlete.**

## Architecture

- **Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui components
- **Persistence**: Vercel KV (Redis) — syncs across all devices
- **Auth**: None — single-user personal tool
- **Data fetching**: SWR with optimistic updates

## Tabs

| Tab | File | Purpose |
|-----|------|---------|
| Today | `components/tabs/today.tsx` | Daily habit checklist, progress ring, streak counter |
| Scorecard | `components/tabs/scorecard.tsx` | Weekly 7×6 habit grid with streak stats |
| Income | `components/tabs/income.tsx` | 3-pillar income tracker toward $10k/mo goal |
| Pipeline | `components/tabs/pipeline.tsx` | SaaS idea scoring (0–4) and status tracking |
| Content | `components/tabs/content-bank.tsx` | Content idea bank with pillar/format tagging |
| Training | `components/tabs/training.tsx` | 13-week CrossFit+Hyrox program tracker |

## KV Schema

| Key Pattern | Data Type | Description |
|-------------|-----------|-------------|
| `reagan:habits:{YYYY-MM-DD}` | `HabitDay` | Daily habit check-ins |
| `reagan:income:{YYYY-MM}` | `IncomeMonth` | Monthly income per pillar |
| `reagan:saas_ideas` | `SaasIdea[]` | All SaaS pipeline ideas |
| `reagan:content_bank` | `ContentIdea[]` | All content ideas |
| `reagan:training:sessions:{YYYY-MM-DD}` | `SessionLog` | Training session logs per day |
| `reagan:training:biometrics:{YYYY-MM-DD}` | `BiometricCheckin` | Sunday biometric check-ins |
| `reagan:training:config` | `TrainingConfig` | Program start date, overrides |

## API Routes

| Route | Methods | Params |
|-------|---------|--------|
| `/api/habits` | GET, POST | `?date=YYYY-MM-DD` |
| `/api/income` | GET, POST | `?month=YYYY-MM` |
| `/api/ideas` | GET, POST | — |
| `/api/content` | GET, POST | — |
| `/api/training/sessions` | GET, POST | `?date=YYYY-MM-DD` |
| `/api/training/biometrics` | GET, POST | `?date=YYYY-MM-DD` |
| `/api/training/config` | GET, POST | — |

All routes include origin checking — returns 401 if not from Vercel domain or localhost.

## Training Program Structure

**13 weeks, 3 phases:**
- Phase 1 (Wk 1–4): Base Building — aerobic foundation, movement quality
- Phase 2 (Wk 5–9): Build — zone 2 progression, gymnastics skill work
- Phase 3 (Wk 10–13): Peak + Test — race effort, PRs, benchmark

**Session types and colors:**
- FF (Functional Fitness): `#e8a030` amber
- HX (Hyrox): `#3ab8d0` cyan
- GYM (Gymnastics): `#a060e0` purple
- MOB (Mobility): `#3ab87a` green
- LIFT (Strength): `#e06050` red
- REST: `#666` gray

## Extending

### Add a new habit
1. Add key to `HabitDay.habits` in `lib/types.ts`
2. Add entry to `HABITS` array with `key`, `label`, `daily`, `dayOnly`, `color`
3. Update default object in `/api/habits/route.ts` GET handler

### Add an income pillar
1. Add field to `IncomeMonth` in `lib/types.ts`
2. Add card in `components/tabs/income.tsx`
3. Update total calculation

### Add a training phase
1. Add to `PHASES` array in `lib/types.ts`
2. Update week-to-phase mapping in training component

## Environment Variables

```
KV_URL              — Redis connection URL
KV_REST_API_URL     — Vercel KV REST endpoint
KV_REST_API_TOKEN   — Read/write token
KV_REST_API_READ_ONLY_TOKEN — Read-only token
```

## Development

```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build — must pass with zero type errors
npm run lint   # ESLint check
```
