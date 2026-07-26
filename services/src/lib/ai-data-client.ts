import { z } from 'zod';

import type { ExportAssessmentRequest } from '../contracts/export-assessment.js';

const visualAssessmentResponseSchema = z.object({
  visualStatus: z.enum(['passes_visual_check', 'needs_review', 'insufficient_image']),
  qualityIssues: z.array(z.string()),
  observations: z.array(z.string()),
  limitations: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
  requiresHumanReview: z.literal(true),
  assessmentId: z.string().uuid(),
  standardsProfileId: z.string(),
  standardsProfileVersion: z.string(),
  model: z.string(),
});

export type VisualAssessmentResponse = z.infer<typeof visualAssessmentResponseSchema>;

export class AiDataServiceError extends Error {
  constructor(
    message: string,
    readonly status: 502 | 503 | 504,
  ) {
    super(message);
    this.name = 'AiDataServiceError';
  }
}

export async function requestVisualAssessment(
  input: Pick<ExportAssessmentRequest, 'crop' | 'imageBase64' | 'mimeType'>,
  fetchImplementation: typeof fetch = fetch,
) {
  const serviceUrl = (process.env.AI_SERVICE_URL ?? 'http://localhost:4100').replace(/\/$/, '');
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (process.env.INTERNAL_API_TOKEN) {
    headers.authorization = `Bearer ${process.env.INTERNAL_API_TOKEN}`;
  }

  let response: Response;
  try {
    response = await fetchImplementation(`${serviceUrl}/ai/assess-export`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new AiDataServiceError('AI assessment timed out.', 504);
    }
    throw new AiDataServiceError('AI assessment service is unavailable.', 503);
  }

  if (!response.ok) {
    throw new AiDataServiceError(
      `AI assessment failed with status ${response.status}.`,
      response.status === 503 ? 503 : 502,
    );
  }

  const body: unknown = await response.json().catch(() => null);
  const parsed = visualAssessmentResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new AiDataServiceError('AI assessment returned an invalid response.', 502);
  }

  return parsed.data;
}
