# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

JuaBei is currently in the planning/documentation stage — there is no source code, build tooling, or test suite in this repo yet. The tech stack is decided (see [docs/tech-stack.md](docs/tech-stack.md)) but not yet scaffolded.

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
