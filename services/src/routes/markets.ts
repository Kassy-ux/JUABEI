import { Hono } from 'hono';

import { marketsQuerySchema } from '../contracts/markets.js';
import { createDemoMarkets } from '../lib/demo-markets.js';

export const marketRoutes = new Hono();

marketRoutes.get('/', (context) => {
  const parsed = marketsQuerySchema.safeParse(context.req.query());
  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  return context.json(createDemoMarkets(parsed.data));
});
