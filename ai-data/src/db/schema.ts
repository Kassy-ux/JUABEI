import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const transactionChannelEnum = pgEnum('transaction_channel', ['local_broker', 'export']);
export const transactionStatusEnum = pgEnum('transaction_status', [
  'reported',
  'pending_verification',
  'verified',
  'rejected',
]);
export const marketDataSourceEnum = pgEnum('market_data_source', [
  'kamis',
  'cooperative',
  'verified_sales',
  'historical',
  'international',
]);
export const marketPriceTypeEnum = pgEnum('market_price_type', [
  'farm_gate',
  'wholesale',
  'retail',
  'export',
]);
export const visualAssessmentStatusEnum = pgEnum('visual_assessment_status', [
  'passes_visual_check',
  'needs_review',
  'insufficient_image',
]);
export const notificationChannelEnum = pgEnum('notification_channel', ['sms', 'whatsapp']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed']);

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    crop: text('crop').notNull(),
    variety: text('variety'),
    county: text('county').notNull(),
    grade: text('grade'),
    quantityKg: numeric('quantity_kg', { precision: 14, scale: 3 }).notNull(),
    pricePerKg: numeric('price_per_kg', { precision: 14, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('KES'),
    channel: transactionChannelEnum('channel').notNull(),
    status: transactionStatusEnum('status').notNull().default('reported'),
    buyerReference: text('buyer_reference'),
    evidenceUrl: text('evidence_url'),
    reportedBy: text('reported_by'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verifiedBy: text('verified_by'),
    rejectionReason: text('rejection_reason'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    cropCountyStatusIndex: index('transactions_crop_county_status_idx').on(
      table.crop,
      table.county,
      table.status,
    ),
  }),
);

export const exportAssessments = pgTable(
  'export_assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    crop: text('crop').notNull(),
    standardsProfileId: text('standards_profile_id').notNull(),
    standardsProfileVersion: text('standards_profile_version').notNull(),
    model: text('model').notNull(),
    visualStatus: visualAssessmentStatusEnum('visual_status').notNull(),
    requiresHumanReview: boolean('requires_human_review').notNull().default(true),
    confidence: numeric('confidence', { precision: 4, scale: 3 }).notNull(),
    qualityIssues: text('quality_issues').array().notNull(),
    observations: text('observations').array().notNull(),
    limitations: text('limitations').array().notNull(),
    imageMimeType: text('image_mime_type').notNull(),
    imageSha256: text('image_sha256').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    imageHashIndex: index('export_assessments_image_hash_idx').on(table.imageSha256),
  }),
);

export const marketDataPoints = pgTable(
  'market_data_points',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    source: marketDataSourceEnum('source').notNull(),
    sourceRecordId: text('source_record_id').notNull(),
    crop: text('crop').notNull(),
    variety: text('variety'),
    grade: text('grade'),
    county: text('county'),
    country: text('country').notNull().default('Kenya'),
    market: text('market'),
    priceType: marketPriceTypeEnum('price_type').notNull(),
    pricePerKg: numeric('price_per_kg', { precision: 14, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('KES'),
    unit: text('unit').notNull().default('kg'),
    sourceUrl: text('source_url'),
    sourcePublishedAt: timestamp('source_published_at', { withTimezone: true }).notNull(),
    ingestedAt: timestamp('ingested_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sourceRecordUnique: uniqueIndex('market_data_source_record_unique').on(
      table.source,
      table.sourceRecordId,
      table.priceType,
    ),
    evidenceLookupIndex: index('market_data_evidence_lookup_idx').on(
      table.crop,
      table.county,
      table.sourcePublishedAt,
    ),
  }),
);

export const notificationDeliveries = pgTable(
  'notification_deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    channel: notificationChannelEnum('channel').notNull(),
    recipient: text('recipient').notNull(),
    message: text('message').notNull(),
    status: notificationStatusEnum('status').notNull().default('pending'),
    providerMessageId: text('provider_message_id'),
    providerResponse: text('provider_response'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
  },
  (table) => ({
    statusCreatedIndex: index('notification_status_created_idx').on(table.status, table.createdAt),
  }),
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type ExportAssessment = typeof exportAssessments.$inferSelect;
export type NewExportAssessment = typeof exportAssessments.$inferInsert;
export type MarketDataPoint = typeof marketDataPoints.$inferSelect;
export type NewMarketDataPoint = typeof marketDataPoints.$inferInsert;
export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
