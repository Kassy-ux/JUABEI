# Tasks

Living checklist per lane (see [CONTRIBUTING.md](CONTRIBUTING.md) for lane definitions and workflow). Check items off as PRs merge to `main`; add new items under the relevant lane as they're identified.

## Person A — Channels/Frontend

- [x] PWA scaffold (`channels/` — TanStack Start blank starter, builds clean)
- [ ] USSD menu flow (server route)
- [ ] WhatsApp entry point (server route)
- [ ] API Gateway client integration

## Person B — Core Backend

- [x] API Gateway scaffold (`services/` — Hono, `/health` route)
- [ ] Valuation Service (placeholder route in `services/src/routes/valuation.ts` — wire up the real Valuation Engine)
- [ ] Export Assessment Service (placeholder route in `services/src/routes/export-assessment.ts` — wire up to AI Service + Export Standards)

## Person C — AI & Data

- [x] AI Service scaffold (`ai-data/` — Gemini client + `/ai/assess-export` route, structured JSON output)
- [ ] `GEMINI_API_KEY` provisioned and stored as a server-side secret (not committed)
- [ ] Notification Service (`ai-data/src/notifications/` — SMS via Africa's Talking, WhatsApp Cloud API; both currently stubbed)
- [x] PostgreSQL schema drafted (`ai-data/src/db/schema.ts` — verified transactions, export assessments, market data points)
- [ ] Provision a real PostgreSQL instance and run `db:push`; wire Market Data aggregation (KAMIS, Cooperative Data, Verified Sales)

## Cross-lane / shared

- [x] Root workspace baseline: `package.json` convenience scripts, `tsconfig.base.json`, root `.gitignore`, `.env.example`
- [ ] Agree on shared formatter/linter config (each lane currently has its own — channels/ ships ESLint + Prettier from the scaffold; services/ and ai-data/ don't have one yet)
- [ ] CI pipeline (build + test gate on `main`)
- [ ] Valuation API contract (Channels ↔ Backend)
- [ ] Export Assessment contract (Backend ↔ AI Service)
