import { GoogleGenAI } from '@google/genai';

import { assessExportResponseSchema } from '../contracts/ai.js';
import type { AssessExportRequest, AssessExportResponse } from '../contracts/ai.js';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set — AI Service calls will fail.');
}

const ai = new GoogleGenAI({ apiKey });

// TODO: pick the current Flash-tier model name from ai.google.dev before
// shipping — model names change over time. Move to a Pro-tier model only if
// Flash accuracy is insufficient on ambiguous cases (see docs/tech-stack.md).
const MODEL = 'gemini-2.5-flash';

// Mirrors assessExportResponseSchema in ../contracts/ai.ts — this is the shape
// Gemini is asked to return, and the response is validated against the contract
// below before it leaves this module.
const exportAssessmentSchema = {
  type: 'object',
  properties: {
    eligible: { type: 'boolean' },
    qualityIssues: { type: 'array', items: { type: 'string' } },
    complianceGaps: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number' },
  },
  required: ['eligible', 'qualityIssues', 'complianceGaps', 'confidence'],
};

export async function assessExportPhoto(
  params: AssessExportRequest,
): Promise<AssessExportResponse> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              `You are assessing a photo of ${params.crop} for export eligibility.`,
              `Export standards: ${params.exportStandardsSummary}`,
              'Return quality issues and compliance gaps you can identify from the photo, and an overall eligibility call with a confidence score between 0 and 1.',
            ].join('\n'),
          },
          {
            inlineData: {
              mimeType: params.mimeType,
              data: params.imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: exportAssessmentSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned no text output for export assessment');
  }

  // Parse, don't cast — a model can return well-formed JSON that still doesn't
  // match the schema (confidence out of range, missing array). Failing here
  // surfaces as a 502 from the route rather than as bad data downstream.
  return assessExportResponseSchema.parse(JSON.parse(text));
}
