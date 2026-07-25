# System Architecture

## Channels layer

Farmers reach JuaBei through the PWA, USSD, or WhatsApp. All channels send valuation and export-assessment work through the API Gateway.

## Backend services

- **API Gateway** — validates public channel requests and coordinates downstream services.
- **Export Assessment Service** — combines trusted compliance rules and international prices with visual evidence from the AI Service.
- **Valuation Service** — computes evidence-backed farm-gate pricing.
- **AI Service** — records a limited visual review of uploaded crop photos; it never declares final regulatory eligibility.
- **Notification Service** — sends asynchronous SMS and WhatsApp updates and persists delivery status.

## Data layer

The AI/Data service normalizes market evidence into PostgreSQL:

- KAMIS spreadsheet/export rows.
- Cooperative submissions.
- Verified farmer sales.
- Historical and international sources.

Every price carries source, record ID, unit, currency, price type, publication time, and available location metadata. Reported transactions have an explicit verification lifecycle. Only a verified transaction becomes `verified_sales` evidence.

Person C's data APIs and database are implemented. Person B's valuation route still needs to replace its fixture response with live evidence queries.

```text
Channels (PWA / USSD / WhatsApp)
                 |
                 v
            API Gateway
              /      \
             v        v
    Valuation       Export Assessment
        |              |       |
        v              v       v
  AI/Data API     AI visual   Trusted compliance
        |          evidence   + international price
        v
   PostgreSQL <--- KAMIS / Cooperative / Verified Sales
        |
        v
 Notification Service ---> SMS / WhatsApp
```

All internal `/ai`, `/data`, and `/notifications` routes require bearer authentication in production.
