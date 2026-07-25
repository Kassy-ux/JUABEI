# Tasks

Living checklist per lane (see [CONTRIBUTING.md](CONTRIBUTING.md) for lane definitions and workflow). Check items off as PRs merge to `main`; add new items under the relevant lane as they're identified.

## Person A — Channels/Frontend

- [x] PWA scaffold (`channels/` — TanStack Start blank starter, builds clean)
- [x] PWA config (`vite-plugin-pwa`, manifest, theme color, SW registration in `__root.tsx`) — **caveat:** the build doesn't currently emit an actual `sw.js`; `vite-plugin-pwa`'s `generateSW` hook doesn't appear to fire under TanStack Start's Vite Environments (client+SSR) build. Manifest generation and the registration code path both work and are verified by build output. Real icon PNGs (`public/pwa-192x192.png`, `pwa-512x512.png`) are still placeholders too.
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

Deliberately not building for the demo — don't quietly start these:

- USSD and WhatsApp channels
- Notification Service (SMS / WhatsApp sending)
- PostgreSQL provisioning; valuation reads from a committed fixture instead
- Agent verification flow
- Tests and CI

Worth the twenty minutes anyway: fake the **evidence feedback loop** with an in-memory array so a verified sale visibly affects the next valuation. It's one of the four [design principles](docs/design-principles.md) and the most likely thing a judge asks about.
