import { boolean, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Evidence Database — verified transactions feed back into future valuations
// (see docs/user-journey.md § Feedback Loop).
export const verifiedTransactions = pgTable('verified_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  crop: text('crop').notNull(),
  variety: text('variety'),
  county: text('county').notNull(),
  quantityKg: numeric('quantity_kg').notNull(),
  pricePerKg: numeric('price_per_kg').notNull(),
  channel: text('channel').notNull(), // 'local_broker' | 'export'
  verifiedByAgent: boolean('verified_by_agent').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AI export assessments, kept for audit/traceability of Gemini calls.
export const exportAssessments = pgTable('export_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  crop: text('crop').notNull(),
  eligible: boolean('eligible'),
  confidence: numeric('confidence'),
  qualityIssues: text('quality_issues').array(),
  complianceGaps: text('compliance_gaps').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Market Data aggregation sources referenced by the Valuation Engine.
export const marketDataPoints = pgTable('market_data_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(), // 'kamis' | 'cooperative' | 'verified_sales'
  crop: text('crop').notNull(),
  county: text('county'),
  pricePerKg: numeric('price_per_kg').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
});
