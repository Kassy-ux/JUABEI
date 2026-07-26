import { Hono } from 'hono';

import { exportAssessmentRequestSchema } from '../contracts/export-assessment.js';
import type { ExportAssessmentResponse } from '../contracts/export-assessment.js';
import { AiDataServiceError, requestVisualAssessment } from '../lib/ai-data-client.js';
import { findRecordComplianceGaps } from '../lib/export-records.js';

export const exportAssessmentRoutes = new Hono();

exportAssessmentRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = exportAssessmentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  try {
    const visualAssessment = await requestVisualAssessment({
      crop: parsed.data.crop,
      imageBase64: parsed.data.imageBase64,
      mimeType: parsed.data.mimeType,
    });
    const recordGaps = findRecordComplianceGaps(parsed.data);

    // `eligible` is retained for the frozen Channels contract, but represents
    // only whether the photo passed the visual check. The limitations and
    // required human review prevent it being presented as final export approval.
    const response: ExportAssessmentResponse = {
      eligible: visualAssessment.visualStatus === 'passes_visual_check',
      qualityIssues: visualAssessment.qualityIssues,
      complianceGaps: Array.from(
        new Set([
          ...visualAssessment.limitations,
          ...recordGaps,
          'Human review is required before any final export decision.',
        ]),
      ),
      confidence: visualAssessment.confidence,
      internationalMarketPrice: null,
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof AiDataServiceError) {
      return c.json({ error: error.message }, error.status);
    }
    throw error;
  }
});
