import { z } from 'zod';

// Channels → Backend contract. Frozen; see CONTRIBUTING.md § Integration flow.
//
// The lanes are independent npm projects, so this file has a hand-written
// mirror in channels/src/contracts/valuation.ts. Change the two together, in
// the same sitting — there is no build step that will catch drift for you.

export const valuationRequestSchema = z.object({
  crop: z.string().min(1),
  variety: z.string().optional(),
  quantityKg: z.number().positive(),
  county: z.string().min(1),
  grade: z.string().optional(),
  harvestStatus: z.string().optional(),
});

export type ValuationRequest = z.infer<typeof valuationRequestSchema>;

export const evidenceSourceSchema = z.enum([
  'kamis',
  'cooperative',
  'verified_sales',
  'historical',
]);

export type EvidenceSource = z.infer<typeof evidenceSourceSchema>;

export const evidenceItemSchema = z.object({
  source: evidenceSourceSchema,
  pricePerKg: z.number(),
  recordedAt: z.string(), // ISO 8601
});

export const valuationResponseSchema = z.object({
  weightedMedian: z.number(), // KES per kg
  priceRange: z.object({ low: z.number(), high: z.number() }),
  confidenceScore: z.number().min(0).max(1),
  estimatedValue: z.number(), // weightedMedian × quantityKg
  evidence: z.array(evidenceItemSchema),
});

export type ValuationResponse = z.infer<typeof valuationResponseSchema>;
