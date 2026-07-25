import { z } from 'zod';

// Channels → Backend contract. Frozen; see CONTRIBUTING.md § Integration flow.
// Hand-written mirror in channels/src/contracts/export-assessment.ts.
//
// The photo travels inline as base64 rather than via a separate upload
// endpoint — one hop fewer for the demo. Channels MUST downscale to ~1024px
// before encoding: a raw phone photo is 2–5 MB, which becomes 3–7 MB of
// base64 crossing Channels → Backend → AI Service as JSON.

export const exportAssessmentRequestSchema = z.object({
  crop: z.string().min(1),
  quantityKg: z.number().positive(),
  imageBase64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fertilizerOrManure: z.string().optional(),
  cropProtection: z.string().optional(),
  harvestDetails: z.string().optional(),
  productionRecords: z.string().optional(),
});

export type ExportAssessmentRequest = z.infer<typeof exportAssessmentRequestSchema>;

export const internationalMarketPriceSchema = z.object({
  pricePerKg: z.number(),
  currency: z.string(), // ISO 4217, e.g. 'USD'
  estimatedExportValue: z.number(),
});

export const exportAssessmentResponseSchema = z.object({
  eligible: z.boolean(),
  qualityIssues: z.array(z.string()),
  complianceGaps: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  // null when the crop is not export-eligible — there is no price to show.
  internationalMarketPrice: internationalMarketPriceSchema.nullable(),
});

export type ExportAssessmentResponse = z.infer<typeof exportAssessmentResponseSchema>;
