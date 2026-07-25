# JuaBei

JuaBei is a multi-channel platform that helps farmers get a fair, evidence-backed price for their crops, compare that price against broker offers, and — where eligible — assess and price their produce for export markets.

## Docs

- [System Architecture](docs/architecture.md)
- [Tech Stack](docs/tech-stack.md)
- [User Journey](docs/user-journey.md)
- [Design Principles](docs/design-principles.md)
- [Contributing / Team Workflow](CONTRIBUTING.md)
- [Tasks](TASKS.md)

## Getting Started

Each lane (`channels/`, `services/`, `ai-data/`) is its own npm project with its own `package.json` and lockfile — install and run them independently:

```bash
cp .env.example .env   # fill in secrets per docs/tech-stack.md, then export/load them
cd channels && npm install && npm run dev    # PWA — http://localhost:3000
cd services && npm install && npm run dev    # API Gateway — http://localhost:4000
cd ai-data && npm install && npm run dev     # AI Service — http://localhost:4100
```

Or from the repo root, once each lane's dependencies are installed:

```bash
npm run dev:channels
npm run dev:services
npm run dev:ai-data
```
