# Tasks

Living checklist per lane (see [CONTRIBUTING.md](CONTRIBUTING.md) for lane definitions and workflow). Check items off as PRs merge to `main`; add new items under the relevant lane as they're identified.

## Person A — Channels/Frontend

- [ ] PWA scaffold
- [ ] USSD menu flow
- [ ] WhatsApp entry point
- [ ] API Gateway client integration

## Person B — Core Backend

- [ ] API Gateway scaffold
- [ ] Valuation Service (fair farm-gate pricing)
- [ ] Export Assessment Service

## Person C — AI & Data

- [ ] AI Service (crop/export image assessment via Gemini API)
- [ ] `GEMINI_API_KEY` provisioned and stored as a server-side secret (not committed)
- [ ] Notification Service (SMS/WhatsApp outbound)
- [ ] PostgreSQL schema + Market Data aggregation (KAMIS, Cooperative Data, Verified Sales)

## Cross-lane / shared

- [ ] Agree on shared formatter/linter config
- [ ] CI pipeline (build + test gate on `main`)
- [ ] Valuation API contract (Channels ↔ Backend)
- [ ] Export Assessment contract (Backend ↔ AI Service)
