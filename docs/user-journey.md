# User Journey

## Export Assessment Flow

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

## Full User Journey

### Entry

- **Farmer Opens JuaBei**
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
    - **Yes** → **Show International Market Price** (Price per Kg, Estimated Export Value, Export Opportunities) → **Farmer Decides to Export** → **Report Export Sale** (buyer, quantity, price, currency, date, evidence) → **Agent Verification** → **Verified Transaction Added to Evidence Database**
    - **No** → **Show Missing Requirements** (Quality Issues, Compliance Gaps) → **Improve Crop and Reassess**

### Feedback Loop

Both branches ultimately feed verified outcomes back into the **Evidence Database**, which strengthens future valuations via the Valuation Engine's evidence sources (KAMIS, Cooperative Records, Verified Farmer Sales, Historical Sources).
