# JuaBei

JuaBei is a multi-channel platform that helps farmers get an evidence-backed crop price, compare broker offers, and assess the path to export markets.

## Documentation

- [System Architecture](docs/architecture.md)
- [Tech Stack](docs/tech-stack.md)
- [User Journey](docs/user-journey.md)
- [Design Principles](docs/design-principles.md)
- [AI & Data Service](ai-data/README.md)
- [Contributing / Team Workflow](CONTRIBUTING.md)
- [Tasks](TASKS.md)

## Getting started

Each lane is an independent npm project. Copy the environment template, start PostgreSQL (or supply a hosted `DATABASE_URL`), install dependencies, and migrate:

```bash
cp .env.example .env
docker compose up -d postgres
cd ai-data
npm install
npm run db:migrate
```

Install dependencies in `channels/` and `services/` as well, then run all three from separate terminals:

```bash
npm run dev:channels
npm run dev:services
npm run dev:ai-data
```

- PWA: `http://localhost:3000`
- API Gateway: `http://localhost:4000`
- AI/Data service: `http://localhost:4100`

To test USSD through Africa's Talking with an ngrok HTTPS callback, set
`NGROK_AUTHTOKEN` in `.env` and run `npm run dev:ussd`.

The root `.env` is ignored. Never commit database or provider credentials.
