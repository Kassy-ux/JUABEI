import assert from 'node:assert/strict';
import test from 'node:test';

import { AiDataServiceError, requestVisualAssessment } from '../src/lib/ai-data-client.js';

const validResponse = {
  visualStatus: 'needs_review',
  qualityIssues: ['Visible bruising'],
  observations: ['Produce is visible'],
  limitations: ['A photo cannot verify certificates.'],
  confidence: 0.73,
  requiresHumanReview: true,
  assessmentId: 'f67060d4-5073-4ea6-bc44-65ab2230f3da',
  standardsProfileId: 'maize-visual',
  standardsProfileVersion: '2026-07-01',
  model: 'gemini-3.5-flash',
} as const;

test('Gateway sends the narrow visual-assessment contract', async () => {
  let requestBody: unknown;
  const result = await requestVisualAssessment(
    {
      crop: 'maize',
      imageBase64: 'AQID',
      mimeType: 'image/jpeg',
    },
    async (_url, init) => {
      requestBody = JSON.parse(String(init?.body));
      return Response.json(validResponse);
    },
  );

  assert.deepEqual(requestBody, {
    crop: 'maize',
    imageBase64: 'AQID',
    mimeType: 'image/jpeg',
  });
  assert.equal(result.confidence, 0.73);
});

test('Gateway rejects malformed AI responses', async () => {
  await assert.rejects(
    requestVisualAssessment(
      {
        crop: 'maize',
        imageBase64: 'AQID',
        mimeType: 'image/jpeg',
      },
      async () => Response.json({ eligible: true }),
    ),
    (error: unknown) => error instanceof AiDataServiceError && error.status === 502,
  );
});
