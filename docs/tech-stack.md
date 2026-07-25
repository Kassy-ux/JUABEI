# Tech Stack

Concrete technology choices per lane (see [CONTRIBUTING.md](../CONTRIBUTING.md) for lane ownership).

## Person A — Channels/Frontend

- **TanStack Start** (React + Vite + TanStack Router) for the PWA — file-based routing, SSR, type-safe server functions.
- `vite-plugin-pwa` for offline/installable PWA support.
- USSD and WhatsApp are webhook endpoints (Africa's Talking POSTs to a URL for USSD; Meta's WhatsApp Cloud API does the same for WhatsApp) — implemented as TanStack Start server routes, so this lane owns one deployable for the whole channels layer. USSD supports valuation and broker comparison but hands photo-based export checks to the PWA. Immediate WhatsApp conversation replies stay in the Channels lane; asynchronous alerts remain the Notification Service's responsibility.

## Person B — Core Backend

- **Node.js + TypeScript** for the API Gateway, Valuation Service, and Export Assessment Service — using **Hono** (lightweight, fast, works well as separate services or serverless).
- **Zod** for request/response schemas — this is also the "contract" CONTRIBUTING.md's integration flow refers to between lanes.

## Person C — AI & Data

- **AI Service — Google Gemini API** for crop/export image assessment. The service sends the uploaded crop photo plus a prompt describing export standards to Gemini and gets back a structured assessment (eligibility, quality issues, compliance gaps) using Gemini's JSON/structured-output mode. Node/TypeScript via the official `@google/genai` SDK — keeps this lane in the same language as the rest of the stack (no separate Python/ML service needed).
  - Auth via a `GEMINI_API_KEY` environment variable, obtained from Google AI Studio. **Server-side only** — never expose it to the PWA/USSD/WhatsApp clients.
  - Model choice: start with a Flash-tier Gemini model for cost-effective per-image assessment; move to a Pro-tier model only if accuracy on ambiguous cases needs it. Check ai.google.dev for current model names before implementing — they change over time.
- **PostgreSQL** for the data layer, with **Drizzle** or **Prisma** as the TypeScript ORM.
- **Notification Service** — Node/TS, using the Africa's Talking SDK for SMS and the WhatsApp Cloud API for WhatsApp.

## Why this shape

Every lane ends up in TypeScript, so the team can read across lanes without a language switch, and the Valuation/Export Assessment contracts (Zod schemas) can be shared as types between Channels and Backend if useful.
