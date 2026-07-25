# Tasks

Living checklist per lane (see [CONTRIBUTING.md](CONTRIBUTING.md) for lane definitions and workflow). Check items off as PRs merge to `main`; add new items under the relevant lane as they are identified.

## Person A — Channels/Frontend

- [x] PWA scaffold and offline/installable configuration.
- [x] USSD valuation and broker-comparison flow.
- [x] WhatsApp verification, signature validation, conversation flow, and Cloud API replies.
- [x] API Gateway client integration.

## Person B — Core Backend

- [x] API Gateway scaffold (`services/` — Hono, `/health` route).
- [ ] Valuation Service: replace the placeholder response with the real valuation engine and AI/Data evidence query.
- [ ] Export Assessment Service: call the AI visual assessment, apply trusted compliance rules, and add international pricing.

## Person C — AI & Data

- [x] AI visual-assessment service with Gemini structured output.
- [x] Remove caller-supplied standards text; use versioned trusted visual profiles.
- [x] Treat photo analysis as a visual check requiring human review, not final export eligibility.
- [x] Persist AI assessment metadata, model/profile versions, limitations, and image hashes.
- [x] Load Person C credentials from an ignored server-side `.env`; deployment secrets must still be added to the chosen hosting platform.
- [x] Notification Service: Africa's Talking SMS and WhatsApp Cloud API providers, delivery persistence, failures, timeouts, and `/notifications/send`.
- [x] PostgreSQL connection, readiness check, Drizzle migration, and local Docker Compose setup.
- [x] Market evidence aggregation: normalized KAMIS imports, generic cooperative/historical/international imports, and evidence queries with provenance.
- [x] Transaction verification lifecycle; verified transactions atomically become valuation evidence.
- [x] Unit coverage for configuration, KAMIS normalization, standards selection, and provider request contracts.
- [ ] Configure a production `INTERNAL_API_TOKEN` and add all secrets to deployment secret storage.
- [ ] Schedule or operator-automate KAMIS exports into `/data/market-data/kamis` if KAMIS provides a supported machine interface. Do not depend on an undocumented scraper.
- [ ] Perform provider acceptance sends to team-owned SMS/WhatsApp recipients after test numbers and Meta template/session requirements are confirmed.

## Cross-lane / shared

- [x] Root workspace baseline and independent npm-per-lane setup.
- [x] Channels ↔ Backend valuation/export contracts.
- [x] Backend ↔ AI contract is schema-validated and limited to visual evidence.
- [x] Shared formatter/linter configuration.
- [x] Initial Person C test suite.
- [ ] Implement Person B's two placeholder services against the completed Person C APIs.
- [ ] Add repository CI for all three lanes.
- [ ] Add an automated contract-drift check between `services/src/contracts/` and `channels/src/contracts/`.

### Contract drift warning

The lanes are independent npm projects, so `channels/src/contracts/` is a hand-written copy of `services/src/contracts/`. No build step currently catches divergence. Treat any public contract change as a synchronous cross-lane change until the drift check is added.
