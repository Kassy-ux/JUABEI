import { GoogleGenAI } from '@google/genai';

import { getConfig } from '../config.js';
import {
  visualAssessmentSchema,
  type AssessExportRequest,
  type VisualAssessment,
} from '../contracts/ai.js';
import type { VisualStandardsProfile } from '../standards/profiles.js';

let client: GoogleGenAI | undefined;

const visualAssessmentJsonSchema = {
  type: 'object',
  properties: {
    visualStatus: {
      type: 'string',
      enum: ['passes_visual_check', 'needs_review', 'insufficient_image'],
    },
    qualityIssues: { type: 'array', items: { type: 'string' } },
    observations: { type: 'array', items: { type: 'string' } },
    limitations: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number' },
    requiresHumanReview: { type: 'boolean' },
  },
  required: [
    'visualStatus',
    'qualityIssues',
    'observations',
    'limitations',
    'confidence',
    'requiresHumanReview',
  ],
};

function getClient() {
  const apiKey = getConfig().GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export async function assessExportPhoto(
  params: AssessExportRequest,
  profile: VisualStandardsProfile,
): Promise<VisualAssessment> {
  const config = getConfig();
  const response = await getClient().models.generateContent({
    model: config.GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              `Review this photo of ${params.crop} for visible produce quality only.`,
              `Trusted visual profile: ${profile.id}, version ${profile.version}.`,
              'Visible checks:',
              ...profile.visibleChecks.map((check) => `- ${check}`),
              'Required limitations:',
              ...profile.limitations.map((limitation) => `- ${limitation}`),
              'Never claim legal, chemical, documentary, or final export eligibility.',
              'Set requiresHumanReview to true in every response.',
              'If the image is unclear or unrepresentative, use insufficient_image.',
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
      responseJsonSchema: visualAssessmentJsonSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned no text output for visual assessment.');

  const parsed = visualAssessmentSchema.parse(JSON.parse(text));
  return {
    ...parsed,
    limitations: Array.from(new Set([...parsed.limitations, ...profile.limitations])),
    requiresHumanReview: true,
  };
}
