import { Hono } from 'hono';

import { valuationRequestSchema } from '../contracts/valuation.js';
import type { ValuationResponse } from '../contracts/valuation.js';

export const valuationRoutes = new Hono();

valuationRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = valuationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  // TODO(Person B): wire up the real Valuation Engine — pull evidence from
  // KAMIS, Cooperative Data, Verified Sales, and Historical Sources (see
  // docs/user-journey.md), then compute weighted median / confidence / range.
  // For the demo this reads from a committed price fixture, not a live feed.
  //
  // Shape is already contract-correct so Channels can build against it today;
  // only the numbers are placeholders.
  const response: ValuationResponse = {
    weightedMedian: 0,
    priceRange: { low: 0, high: 0 },
    confidenceScore: 0,
    estimatedValue: 0,
    evidence: [],
  };

  return c.json(response);
});
