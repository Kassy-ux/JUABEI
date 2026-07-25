import { boolean, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Transactions — a farmer-reported sale (local broker or export) that has not
// necessarily been confirmed yet. `status` tracks the verification lifecycle;
// only `verified` rows should feed back into the Valuation Engine's evidence
// sources (see docs/user-journey.md § Feedback Loop). A table can't be
// unconditionally called "verified" while its rows default to unverified —
// hence `status` instead of a single always-false-by-default boolean.
//
// Not wired up yet: for the demo the evidence feedback loop is faked with an
// in-memory array (see TASKS.md) rather than a real database. This schema
// documents the intended shape for when persistence is actually built.
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  crop: text('crop').notNull(),
  variety: text('variety'),
  county: text('county').notNull(),
  quantityKg: numeric('quantity_kg').notNull(),
  pricePerKg: numeric('price_per_kg').notNull(),
  currency: text('currency').notNull().default('KES'),
  channel: text('channel').notNull(), // 'local_broker' | 'export'
  status: text('status').notNull().default('reported'), // 'reported' | 'pending_verification' | 'verified' | 'rejected'
  verifiedAt: timestamp('verified_at'),
  verifiedBy: text('verified_by'), // agent identifier who verified the transaction
  evidenceUrl: text('evidence_url'), // receipt/photo/reference supporting the sale
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AI export assessments — mirrors the Backend<->AI contract in
// ai-data/src/contracts/ai.ts (kept for audit/traceability of Gemini calls).
// Not wired up yet — see the note above.
export const exportAssessments = pgTable('export_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  crop: text('crop').notNull(),
  eligible: boolean('eligible'),
  confidence: numeric('confidence'),
  qualityIssues: text('quality_issues').array(),
  complianceGaps: text('compliance_gaps').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Market Data aggregation — raw price points ingested from external sources
// (KAMIS, cooperative records, verified sales) before they're combined by
// the Valuation Engine. Enough context to compare prices across sources
// without silently mixing incompatible bases (currency, unit, price type).
// Not wired up yet — see the note above.
export const marketDataPoints = pgTable('market_data_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(), // 'kamis' | 'cooperative' | 'verified_sales'
  sourceRecordId: text('source_record_id'), // ID/reference in the source system, for traceability
  crop: text('crop').notNull(),
  variety: text('variety'),
  grade: text('grade'),
  county: text('county'),
  market: text('market'), // named market/destination, e.g. "Wakulima Market" or an export destination
  priceType: text('price_type').notNull(), // 'farm_gate' | 'wholesale' | 'retail' | 'export'
  pricePerKg: numeric('price_per_kg').notNull(),
  currency: text('currency').notNull().default('KES'),
  unit: text('unit').notNull().default('kg'),
  sourcePublishedAt: timestamp('source_published_at'), // when the source published/recorded the price
  ingestedAt: timestamp('ingested_at').notNull().defaultNow(), // when JuaBei pulled it in
});
