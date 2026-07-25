# Tech Stack

Concrete technology choices per lane (see [CONTRIBUTING.md](../CONTRIBUTING.md) for lane ownership).

## Person A — Channels/Frontend

- **TanStack Start** (React + Vite + TanStack Router) for the PWA.
- `vite-plugin-pwa` for offline/installable support.
- TanStack Start server routes for Africa's Talking USSD and Meta WhatsApp webhooks.

## Person B — Core Backend

- **Node.js + TypeScript + Hono** for the API Gateway, valuation, and export-assessment services.
- **Zod** request and response schemas as the public Channels ↔ Backend contract.

## Person C — AI & Data

- **Google Gemini via `@google/genai`** for structured crop-photo observations. The model is limited to visible checks from versioned, server-controlled profiles. It cannot establish final export eligibility, pesticide residues, certificates, traceability, or production-record compliance; results always require human review.
- **PostgreSQL + Drizzle ORM** for assessment audit records, market evidence, transaction verification, and notification delivery state.
- **KAMIS export adapter** plus normalized cooperative, verified-sale, historical, and international price inputs. KAMIS does not document a stable public API, so the service does not depend on an unsupported scraper.
- **Africa's Talking REST API** for SMS and **Meta WhatsApp Cloud API** for WhatsApp notifications.
- **Zod** for internal AI/Data request and response validation.

Secrets are server-side environment variables only. Production deployments must configure `INTERNAL_API_TOKEN` as well as provider and database credentials.

## Why this shape

Every lane uses TypeScript, while the model is kept behind a narrow evidence contract. Deterministic application code owns compliance decisions, transaction verification, persistence, and provider delivery state.
