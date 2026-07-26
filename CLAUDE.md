# CLAUDE.md

Repository guidance for coding agents.

## Project status

- `channels/` — completed Person A PWA, USSD, WhatsApp, and API Gateway client work.
- `services/` — Hono API Gateway on `:4000`. Valuation and export assessment validate the public contracts but still return placeholder values; these are Person B's remaining implementation tasks.
- `ai-data/` — Person C service on `:4100`: trusted-profile Claude (Anthropic API) visual review, PostgreSQL persistence and migrations, market evidence imports/queries, verified-sale lifecycle, and SMS/WhatsApp notification delivery.

Each lane is an independent npm project with its own `package-lock.json`. Use npm, not pnpm, and run installs/checks inside each lane. The AI/Data scripts automatically load the ignored root `.env`.

## Cross-lane contracts

The Zod schemas in `services/src/contracts/` are the source of truth for Channels ↔ Backend. They are hand-mirrored in `channels/src/contracts/`; update both in the same change. `ai-data/src/contracts/ai.ts` owns Backend ↔ AI.

The AI contract returns visual evidence only. It uses server-controlled, versioned standards profiles and always requires human review. Never reintroduce caller-supplied standards prompt text or treat a photo as proof of chemical, documentary, traceability, or final export compliance.

When changing a contract, follow the integration flow in [CONTRIBUTING.md](CONTRIBUTING.md).

## Important files

- [README.md](README.md) — repository setup.
- [ai-data/README.md](ai-data/README.md) — Person C setup, routes, and checks.
- [docs/architecture.md](docs/architecture.md) — current system boundaries.
- [docs/tech-stack.md](docs/tech-stack.md) — implementation choices.
- [docs/user-journey.md](docs/user-journey.md) — farmer journey.
- [docs/design-principles.md](docs/design-principles.md) — product principles.
- [TASKS.md](TASKS.md) — current completion checklist.
- [CONTRIBUTING.md](CONTRIBUTING.md) — branches, lanes, and PR workflow.

## Security and runtime rules

- Never commit `.env` or provider/database credentials.
- Configure `INTERNAL_API_TOKEN` in production; internal callers use a bearer token.
- Use Drizzle migrations (`npm run db:generate`, then `npm run db:migrate`) rather than ad hoc database changes.
- KAMIS currently has a validated export-row adapter. Do not build an undocumented scraper without an approved, stable source interface.
- Do not perform live notification acceptance sends without an approved recipient and the required Meta session/template context.

## Team lanes

- Person A owns `channels/`.
- Person B owns `services/`.
- Person C owns `ai-data/` and data infrastructure.

Respect lane boundaries. Cross-lane edits should be limited to agreed contracts or documentation required to keep integrations accurate.
