# CropWorth

CropWorth is a multi-channel platform that helps farmers get a fair, evidence-backed price for their crops, compare that price against broker offers, and — where eligible — assess and price their produce for export markets.

---

## 1. System Architecture

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

---

## 2. Export Assessment Flow

This is the path a farmer follows when checking whether their crop qualifies for export and what it could be worth internationally.

1. **Start**
2. **Enter Crop Details**
3. **Get Fair Farm Gate Price**
4. **Need Export Check?**
   - **No** → skip ahead to **Compare Broker Offer**
   - **Yes** → continue
5. **Upload Images and Export Details**
6. **AI Export Assessment**
7. **Eligible?**
   - **No** → **Show Missing Requirements** → **Compare Broker Offer**
   - **Yes** → **Show International Market Price** → **Compare Broker Offer**
8. **Compare Broker Offer**
9. **Sell Crop**
10. **Verification**
11. **Evidence Database** (record persisted for future valuations)

---

## 3. Full User Journey

### Entry

- **Farmer Opens CropWorth**
- **Choose Access Channel** → **PWA**, **USSD**, or **WhatsApp (Optional)**
- All channels converge at **Enter Crop Details**, capturing:
  - Crop, Variety, Quantity, County, Grade, Harvest Status

### Valuation

- Details are sent to the **Valuation API**
- **Evidence Selection** pulls from four sources:
  - KAMIS Data
  - Cooperative Records
  - Verified Farmer Sales
  - Historical Sources
- These feed the **Valuation Engine**, which produces:
  - Weighted Median, Confidence Score, Price Range
- **Return Valuation** → **Fair Price Range** (Estimated Value, Confidence, Evidence)

### Branch A: Sell Locally (Broker Path)

- **Broker Offer?**
  - **No** → **Finish**
  - **Yes** → **Compare Offer** → classified as *Above / Within / Below Range*
    → **Negotiation Guidance** → **Sale Completed?**
    - **No** → **Finish**
    - **Yes** → **Report Transaction** → **Agent Verification** → **Verified Transaction Added to Evidence Database**

### Branch B: Export Path

- **Check Export Eligibility?**
  - **Yes** → **Upload Crop Photos** → **Enter Export Information** (Fertilizer/Manure, Crop Protection, Harvest Details, Production Records) → **AI Export Assessment** → **Export Ready?**
    - **Yes** → **Show International Market Price** (Price per Kg, Estimated Export Value, Export Opportunities) → **Farmer Decides to Export** → **Verified Transaction Added to Evidence Database**
    - **No** → **Show Missing Requirements** (Quality Issues, Compliance Gaps) → **Improve Crop and Reassess**

### Feedback Loop

Both branches ultimately feed verified outcomes back into the **Evidence Database**, which strengthens future valuations via the Valuation Engine's evidence sources (KAMIS, Cooperative Records, Verified Farmer Sales, Historical Sources).

---

## Key Design Principles

- **Multi-channel access** — same core flow available on PWA, USSD, and WhatsApp so farmers without smartphones or reliable internet aren't excluded.
- **Evidence-based pricing** — valuations are grounded in multiple independent data sources rather than a single price feed, with a confidence score attached.
- **Dual monetization paths** — farmers can pursue a local broker sale or an export opportunity from the same valuation starting point.
- **Continuous learning loop** — every verified transaction (local or export) is written back to the Evidence Database, improving future valuations.
