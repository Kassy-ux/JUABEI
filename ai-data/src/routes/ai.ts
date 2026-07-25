import { Hono } from 'hono';

import { assessExportRequestSchema } from '../contracts/ai.js';
import { assessExportPhoto } from '../ai/gemini.js';

export const aiRoutes = new Hono();

aiRoutes.post('/assess-export', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = assessExportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  try {
    const result = await assessExportPhoto(parsed.data);
    return c.json(result);
  } catch (err) {
    console.error('Gemini export assessment failed', err);
    return c.json({ error: 'AI assessment failed' }, 502);
  }
});
