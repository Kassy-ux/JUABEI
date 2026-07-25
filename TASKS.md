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
- [x] Package manager settled: **npm, per-lane, no root workspace**. Stub root `pnpm-lock.yaml` deleted; deps installed and all three lanes typecheck clean.
- [x] Valuation API contract (Channels ↔ Backend) — `services/src/contracts/valuation.ts` (Zod, source of truth), hand-mirrored in `channels/src/contracts/valuation.ts` (plain types + `compareBrokerOffer`)
- [x] Export Assessment contract (Channels ↔ Backend) — `services/src/contracts/export-assessment.ts` + mirror in `channels/`. Photo travels **inline as base64**; the old `aiAssessmentId` two-step upload shape is gone.
- [x] Backend ↔ AI Service contract — `ai-data/src/contracts/ai.ts`; Gemini output is now schema-validated instead of cast
- [ ] Agree on shared formatter/linter config (channels/ ships ESLint + Prettier from the scaffold; services/ and ai-data/ don't have one yet)
- [ ] Deferred for the demo: CI pipeline, test suite

### Contract drift warning

The lanes are independent npm projects, so `channels/src/contracts/` is a **hand-written copy** of `services/src/contracts/`. No build step will catch divergence. Treat any contract change as a synchronous, all-three-people event.

## Demo cut list

Deliberately not building for the demo — don't quietly start these:

- USSD and WhatsApp channels
- Notification Service (SMS / WhatsApp sending)
- PostgreSQL provisioning; valuation reads from a committed fixture instead
- Agent verification flow
- Tests and CI

Worth the twenty minutes anyway: fake the **evidence feedback loop** with an in-memory array so a verified sale visibly affects the next valuation. It's one of the four [design principles](docs/design-principles.md) and the most likely thing a judge asks about.
