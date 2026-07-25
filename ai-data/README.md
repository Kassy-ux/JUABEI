# AI & Data Service

Person C's service owns visual crop assessment, market evidence, verified-sale persistence, and asynchronous notification delivery.

## Local setup

From the repository root:

```bash
copy .env.example .env
docker compose up -d postgres
cd ai-data
npm install
npm run db:migrate
npm run dev
```

The service automatically loads the ignored root `.env`. `GET /health` checks the process; `GET /ready` also verifies PostgreSQL.

For a hosted database, set `DATABASE_URL` and run `npm run db:migrate`. For production, `INTERNAL_API_TOKEN` is required and callers must send `Authorization: Bearer <token>` to `/ai/*`, `/data/*`, and `/notifications/*`.

## Endpoints

- `GET /ai/standards-profiles` — list versioned trusted visual profiles.
- `POST /ai/assess-export` — analyze a crop photo, persist the result, and return visual evidence that always requires human review.
- `GET /data/market-data` — query recent normalized evidence by crop and optional county.
- `POST /data/market-data/import` — import cooperative, historical, or international data with source provenance.
- `POST /data/market-data/kamis` — normalize supported KAMIS export rows into wholesale and retail prices.
- `POST /data/transactions` — report a farmer transaction.
- `PATCH /data/transactions/:id/status` — verify or reject it; verification atomically adds a `verified_sales` evidence point.
- `POST /notifications/send` — persist and send an SMS or WhatsApp notification.

KAMIS exposes web tables and spreadsheet export but does not document a stable public API. The service therefore accepts validated KAMIS export rows instead of relying on a brittle, unsupported scraper.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run check
npm run build
```
