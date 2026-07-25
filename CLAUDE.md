# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

All three lanes are scaffolded and typecheck clean. There is **no test suite and no CI** yet — deliberately deferred (see [TASKS.md](TASKS.md)).

- `channels/` — TanStack Start PWA, one index route. No `vite-plugin-pwa` yet; no USSD/WhatsApp routes yet.
- `services/` — Hono API Gateway on `:4000` with `/health`, `/valuation`, `/export-assessment`. Both service routes validate against the frozen contracts but return placeholder values.
- `ai-data/` — Hono on `:4100` with `/health` and `/ai/assess-export`. The Gemini call is real and returns validated structured output. Drizzle schema is drafted but no database is provisioned. SMS/WhatsApp senders are stubs that throw.

Each lane is an independent npm project with its own `package-lock.json` — **npm, not pnpm**, and no workspace at the root. Run `npm install` inside each lane.

## Cross-lane contracts

The Zod schemas in `services/src/contracts/` are the source of truth for the Channels ↔ Backend contract. Because the lanes are independent npm projects, they are **hand-mirrored** in `channels/src/contracts/` as plain TypeScript types — nothing catches drift automatically, so change both files in the same edit. `ai-data/src/contracts/ai.ts` owns the Backend ↔ AI contract.

When changing a contract, follow the "Integration flow" section of [CONTRIBUTING.md](CONTRIBUTING.md): agree first, land it as its own small PR, then build both sides against it.

## Where things live

- [README.md](README.md) — short overview, links out to the docs below.
- [docs/architecture.md](docs/architecture.md) — system architecture: channels layer, backend services, data layer, and how they connect.
- [docs/tech-stack.md](docs/tech-stack.md) — concrete technology choices per lane (TanStack Start, Node/TS + Hono, Gemini API for the AI Service, PostgreSQL).
- [docs/user-journey.md](docs/user-journey.md) — the export assessment flow and full user journey (entry → valuation → broker/export branches → evidence database feedback loop).
- [docs/design-principles.md](docs/design-principles.md) — the four design principles the architecture is built around.
- [CONTRIBUTING.md](CONTRIBUTING.md) — the 3-person branching/workflow model (GitHub Flow, lane ownership, merge-conflict avoidance, integration flow).
- [TASKS.md](TASKS.md) — living per-lane task checklist.

## AI Service note

The AI Service (crop/export image assessment) calls the **Google Gemini API**, not Claude/Anthropic — see [docs/tech-stack.md](docs/tech-stack.md). If you're generating code for this service, use the Google `@google/genai` SDK, not an Anthropic SDK. Auth is via `GEMINI_API_KEY`, server-side only — never commit it or expose it to client code.

## Team lanes

Work is split into three lanes (defined in [CONTRIBUTING.md](CONTRIBUTING.md)), each expected to map to its own top-level folder once code exists:

- **Channels/Frontend** (`channels/`) — PWA, USSD, WhatsApp entry points, API Gateway client integration.
- **Core Backend** (`services/`) — API Gateway, Valuation Service, Export Assessment Service.
- **AI & Data** (`ai-data/`) — AI Service, Notification Service, PostgreSQL, Market Data aggregation.

When making changes, respect these lane boundaries — avoid touching another lane's folder unless the change is a cross-lane contract, in which case follow the "Integration flow" section of [CONTRIBUTING.md](CONTRIBUTING.md) (agree on the contract first, land it as its own small PR).

## Workflow conventions

Branch naming, PR size, rebase cadence, and merge strategy are all defined in [CONTRIBUTING.md](CONTRIBUTING.md) — follow them when creating branches or commits on this repo (e.g. `feature/<lane>-<short-description>`, squash merge into `main`, no direct commits to `main`).
