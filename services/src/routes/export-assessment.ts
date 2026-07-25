import { Hono } from 'hono';
import { z } from 'zod';

export const exportAssessmentRoutes = new Hono();

const exportAssessmentRequestSchema = z.object({
  crop: z.string(),
  fertilizerOrManure: z.string().optional(),
  cropProtection: z.string().optional(),
  harvestDetails: z.string().optional(),
  productionRecords: z.string().optional(),
  // Photo(s) are sent to the AI Service (see ai-data/); this endpoint expects
  // an already-computed AI assessment reference, not raw image bytes.
  aiAssessmentId: z.string().optional(),
});

exportAssessmentRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = exportAssessmentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  // TODO: call the AI Service (ai-data/) for the export assessment, then
  // compare against Export Standards / International Market Prices.
  return c.json({
    eligible: null,
    missingRequirements: [],
    internationalMarketPrice: null,
    message: 'Export Assessment Service placeholder — not yet implemented',
  });
});
