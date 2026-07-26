import { z } from 'zod';

export const marketScopeSchema = z.enum(['local', 'export']);

export const marketsQuerySchema = z.object({
  crop: z.string().min(1),
  quantityKg: z.coerce.number().positive(),
  scope: marketScopeSchema.default('local'),
});

export const marketListingSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  scope: marketScopeSchema,
  pricePerKg: z.number().positive(),
  currency: z.string().length(3),
  estimatedValue: z.number().positive(),
  priceType: z.enum(['wholesale', 'retail', 'export']),
  source: z.string(),
  updatedAt: z.string(),
  indicative: z.boolean(),
});

export const marketsResponseSchema = z.object({
  markets: z.array(marketListingSchema),
  dataNotice: z.string(),
});

export type MarketsQuery = z.infer<typeof marketsQuerySchema>;
export type MarketsResponse = z.infer<typeof marketsResponseSchema>;
