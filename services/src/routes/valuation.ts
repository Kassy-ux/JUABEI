import { Hono } from 'hono';
import { z } from 'zod';

export const valuationRoutes = new Hono();

const valuationRequestSchema = z.object({
  crop: z.string(),
  variety: z.string().optional(),
  quantityKg: z.number().positive(),
  county: z.string(),
  grade: z.string().optional(),
  harvestStatus: z.string().optional(),
});

valuationRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = valuationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  // TODO: wire up the real Valuation Engine — pull evidence from KAMIS,
  // Cooperative Data, Verified Sales, and Historical Sources (see
  // docs/user-journey.md), then compute weighted median / confidence / range.
  return c.json({
    weightedMedian: null,
    confidenceScore: null,
    priceRange: null,
    evidence: [],
    message: 'Valuation Service placeholder — not yet implemented',
  });
});
