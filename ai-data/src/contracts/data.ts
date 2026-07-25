import { z } from 'zod';

export const marketSourceSchema = z.enum([
  'kamis',
  'cooperative',
  'verified_sales',
  'historical',
  'international',
]);
export const marketPriceTypeSchema = z.enum(['farm_gate', 'wholesale', 'retail', 'export']);

export const marketDataPointInputSchema = z.object({
  source: marketSourceSchema,
  sourceRecordId: z.string().min(1).max(200),
  crop: z.string().min(1).max(120),
  variety: z.string().max(120).optional(),
  grade: z.string().max(80).optional(),
  county: z.string().max(120).optional(),
  country: z.string().min(2).max(120).default('Kenya'),
  market: z.string().max(160).optional(),
  priceType: marketPriceTypeSchema,
  pricePerKg: z.number().positive(),
  currency: z.string().length(3).default('KES'),
  unit: z.literal('kg').default('kg'),
  sourceUrl: z.string().url().optional(),
  sourcePublishedAt: z.string().datetime(),
});

export const marketDataImportSchema = z.object({
  points: z.array(marketDataPointInputSchema).min(1).max(2_000),
});

export type MarketDataPointInput = z.infer<typeof marketDataPointInputSchema>;

export const kamisRowSchema = z.object({
  id: z.string().min(1),
  commodity: z.string().min(1),
  classification: z.string().optional(),
  grade: z.string().optional(),
  market: z.string().min(1),
  county: z.string().min(1),
  wholesalePricePerKg: z.number().positive().optional(),
  retailPricePerKg: z.number().positive().optional(),
  recordedAt: z.string().datetime(),
});

export const kamisImportSchema = z.object({
  rows: z.array(kamisRowSchema).min(1).max(2_000),
});

export type KamisRow = z.infer<typeof kamisRowSchema>;

export const marketEvidenceQuerySchema = z.object({
  crop: z.string().min(1),
  county: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  maxAgeDays: z.coerce.number().int().min(1).max(730).default(90),
});

export const reportTransactionSchema = z.object({
  crop: z.string().min(1).max(120),
  variety: z.string().max(120).optional(),
  county: z.string().min(1).max(120),
  grade: z.string().max(80).optional(),
  quantityKg: z.number().positive(),
  pricePerKg: z.number().positive(),
  currency: z.string().length(3).default('KES'),
  channel: z.enum(['local_broker', 'export']),
  buyerReference: z.string().max(200).optional(),
  evidenceUrl: z.string().url().optional(),
  reportedBy: z.string().max(200).optional(),
  occurredAt: z.string().datetime(),
});

export const updateTransactionStatusSchema = z
  .object({
    status: z.enum(['pending_verification', 'verified', 'rejected']),
    verifiedBy: z.string().min(1).max(200),
    rejectionReason: z.string().min(1).max(1_000).optional(),
  })
  .superRefine((value, context) => {
    if (value.status === 'rejected' && !value.rejectionReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message: 'A rejection reason is required.',
      });
    }
  });

export type ReportTransaction = z.infer<typeof reportTransactionSchema>;
export type UpdateTransactionStatus = z.infer<typeof updateTransactionStatusSchema>;
