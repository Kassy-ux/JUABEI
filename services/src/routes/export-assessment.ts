import { Hono } from 'hono';

import { exportAssessmentRequestSchema } from '../contracts/export-assessment.js';
import type { ExportAssessmentResponse } from '../contracts/export-assessment.js';

export const exportAssessmentRoutes = new Hono();

exportAssessmentRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = exportAssessmentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  // TODO(Person B): POST the photo to the AI Service at
  // `${AI_SERVICE_URL}/ai/assess-export` with an exportStandardsSummary for
  // this crop, then layer Export Standards / International Market Prices on
  // top of the result. Give the fetch an explicit timeout — a hung Gemini call
  // must not hang the demo.
  //
  // Shape is already contract-correct so Channels can build against it today;
  // only the values are placeholders.
  const response: ExportAssessmentResponse = {
    eligible: false,
    qualityIssues: [],
    complianceGaps: [],
    confidence: 0,
    internationalMarketPrice: null,
  };

  return c.json(response);
});
