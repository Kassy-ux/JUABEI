# Tasks

Living checklist per lane (see [CONTRIBUTING.md](CONTRIBUTING.md) for lane definitions and workflow). Check items off as PRs merge to `main`; add new items under the relevant lane as they're identified.

## Person A — Channels/Frontend

- [x] PWA scaffold (`channels/` — TanStack Start blank starter, builds clean)
- [x] PWA config (`vite-plugin-pwa` manifest, static service worker, offline fallback, install icons, theme color)
- [x] USSD menu flow (`/webhooks/ussd` — Africa's Talking form callback, session valuation, broker comparison)
- [x] WhatsApp entry point (`/webhooks/whatsapp` — Meta verification/signature handling, conversation flow, Cloud API replies)
- [x] API Gateway client integration (same-origin PWA proxies plus server-side USSD/WhatsApp client)

## Person B — Core Backend

- [x] API Gateway scaffold (`services/` — Hono, `/health` route)
- [ ] Valuation Service (placeholder route in `services/src/routes/valuation.ts` — wire up the real Valuation Engine)
- [ ] Export Assessment Service (placeholder route in `services/src/routes/export-assessment.ts` — wire up to AI Service + Export Standards)

## Person C — AI & Data

- [x] AI Service scaffold (`ai-data/` — Gemini client + `/ai/assess-export` route, structured JSON output)
- [ ] `GEMINI_API_KEY` provisioned and stored as a server-side secret (not committed)
- [ ] Notification Service (`ai-data/src/notifications/` — SMS via Africa's Talking, WhatsApp Cloud API; deferred for the demo per the cut list below). The stubs now throw `NotificationConfigError` on missing credentials instead of silently resolving — a caller can no longer mistake a skipped send for a delivered one.
- [x] PostgreSQL schema drafted (`ai-data/src/db/schema.ts`) — `transactions` (renamed from `verified_transactions`, now with a `status` lifecycle: `reported` → `pending_verification` → `verified`/`rejected`, plus `verifiedAt`/`verifiedBy`/`evidenceUrl`), `export_assessments`, and `market_data_points` (now carries `currency`, `unit`, `grade`, `variety`, `market`, `priceType`, `sourceRecordId`, `sourcePublishedAt`, `ingestedAt` so KAMIS/cooperative/verified-sale/export prices can't get silently mixed on incompatible bases). **Not wired to a database** — matches the demo cut list below (in-memory array instead).
- [ ] Provision a real PostgreSQL instance and run `db:push`; wire Market Data aggregation (KAMIS, Cooperative Data, Verified Sales) — post-demo

## Cross-lane / shared

- [x] Root workspace baseline: `package.json` convenience scripts, `tsconfig.base.json`, root `.gitignore`, `.env.example`
- [x] Package manager settled: **npm, per-lane, no root workspace**. Stub root `pnpm-lock.yaml` deleted; deps installed and all three lanes typecheck clean.
- [x] Valuation API contract (Channels ↔ Backend) — `services/src/contracts/valuation.ts` (Zod, source of truth), hand-mirrored in `channels/src/contracts/valuation.ts` (plain types + `compareBrokerOffer`)
- [x] Export Assessment contract (Channels ↔ Backend) — `services/src/contracts/export-assessment.ts` + mirror in `channels/`. Photo travels **inline as base64**; the old `aiAssessmentId` two-step upload shape is gone.
- [x] Backend ↔ AI Service contract — `ai-data/src/contracts/ai.ts`; Gemini output is now schema-validated instead of cast
- [x] Shared formatter/linter config — `services/` and `ai-data/` now ship the same ESLint (`typescript-eslint`) + Prettier setup as `channels/`. `npm run lint` passes clean in every lane. `npm run check` (Prettier) doesn't pass yet on the pre-existing route/contract files in `services/`/`ai-data/` — deliberately left unformatted rather than reformat files outside this change's scope; whoever next touches those files, run `npm run format` once.
- [ ] Deferred for the demo: CI pipeline, test suite
- [ ] **Discussion, not urgent:** the AI contract's `eligible` comes straight from Gemini reading a photo, and `exportStandardsSummary` is free text from the caller — a photo can't verify pesticide records/traceability/MRLs, and free text is a prompt-injection surface if the caller is ever untrusted. Worth a short conversation before the contract gets used more widely; not a demo blocker.

### Contract drift warning

The lanes are independent npm projects, so `channels/src/contracts/` is a **hand-written copy** of `services/src/contracts/`. No build step will catch divergence. Treat any contract change as a synchronous, all-three-people event.

## Demo cut list

Still deliberately deferred for the demo:

- Notification Service (SMS / WhatsApp sending)
- PostgreSQL provisioning; valuation reads from a committed fixture instead
- Agent verification flow
- Tests and CI

Worth the twenty minutes anyway: fake the **evidence feedback loop** with an in-memory array so a verified sale visibly affects the next valuation. It's one of the four [design principles](docs/design-principles.md) and the most likely thing a judge asks about.
