import { Hono } from 'hono';

import { valuationRequestSchema } from '../contracts/valuation.js';
import { createDemoValuation } from '../lib/demo-valuation.js';

export const valuationRoutes = new Hono();

valuationRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = valuationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const response = createDemoValuation(parsed.data);
  if (!response) {
    return c.json({ error: `No demo market price is available for ${parsed.data.crop}.` }, 404);
  }

  return c.json(response);
});
