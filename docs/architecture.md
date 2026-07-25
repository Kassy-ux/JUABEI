# System Architecture

**Channels layer**

Farmers reach the platform through one of three entry points:

- **PWA** (Progressive Web App)
- **USSD**
- **WhatsApp** (referenced in the user flow as an optional channel)

All channels route requests into the backend through a single **API Gateway**.

**Backend services**

- **API Gateway** — entry point for all channel traffic; routes requests to the appropriate service and returns responses (including SMS/WhatsApp notifications).
- **Export Assessment Service** — evaluates crop/export data against export standards and international market prices, using the AI Service for assessment logic.
- **Valuation Service** — computes fair farm-gate pricing using historical and current market data.
- **AI Service** — supports the Export Assessment Service with automated evaluation of uploaded crop data/images.
- **Notification Service** — sends outbound updates via SMS and WhatsApp, and logs verified data back to storage.

**External data sources**

- **International Market Prices** — referenced by the Export Assessment Service.
- **Export Standards** — compliance/eligibility rules referenced by the Export Assessment Service.

**Data layer**

- **PostgreSQL** — primary data store, feeding a **Market Data** aggregation layer.
- **Market Data** draws from three sources:
  - **KAMIS** (Kenya Agricultural Market Information System)
  - **Cooperative Data**
  - **Verified Sales**

```
Channels (PWA / USSD / WhatsApp)
        │
        ▼
   API Gateway
   ├──► Export Assessment Service ──► AI Service
   │         │                    └─► Export Standards / Int'l Market Prices
   │         ▼
   │    Notification Service ──► SMS / WhatsApp
   └──► Valuation Service ──► PostgreSQL ──► Market Data ──► KAMIS / Cooperative Data / Verified Sales
```
