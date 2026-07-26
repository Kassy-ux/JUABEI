import Anthropic from '@anthropic-ai/sdk';

import { getConfig } from '../config.js';
import {
  visualAssessmentSchema,
  type AssessExportRequest,
  type VisualAssessment,
} from '../contracts/ai.js';
import type { VisualStandardsProfile } from '../standards/profiles.js';

export class AnthropicNotConfiguredError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY is not configured.');
    this.name = 'AnthropicNotConfiguredError';
  }
}

// The `contracts/ai.ts` Zod schema (v3) still owns validation; this JSON Schema mirror only
// constrains Claude's structured output. Numeric/array-length bounds aren't representable
// here (see the claude-api skill's structured-outputs limitations), so `visualAssessmentSchema
// .parse()` below is what actually enforces them.
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
  additionalProperties: false,
};

let client: Anthropic | undefined;

function getClient(): Anthropic {
  const apiKey = getConfig().ANTHROPIC_API_KEY;
  if (!apiKey) throw new AnthropicNotConfiguredError();
  client ??= new Anthropic({ apiKey });
  return client;
}

export async function assessExportPhoto(
  params: AssessExportRequest,
  profile: VisualStandardsProfile,
): Promise<VisualAssessment> {
  const config = getConfig();

  const prompt = [
    `Review this photo of ${params.crop} for visible produce quality only.`,
    `Trusted visual profile: ${profile.id}, version ${profile.version}.`,
    'Visible checks:',
    ...profile.visibleChecks.map((check) => `- ${check}`),
    'Required limitations:',
    ...profile.limitations.map((limitation) => `- ${limitation}`),
    'Never claim legal, chemical, documentary, or final export eligibility.',
    'Set requiresHumanReview to true in every response.',
    'If the image is unclear or unrepresentative, use insufficient_image.',
  ].join('\n');

  const response = await getClient().messages.create({
    model: config.ANTHROPIC_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: params.mimeType,
              data: params.imageBase64,
            },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: visualAssessmentJsonSchema },
    },
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Claude declined to assess this photo.');
  }

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock) throw new Error('Claude returned no structured visual assessment.');

  const parsed = visualAssessmentSchema.parse(JSON.parse(textBlock.text));
  return {
    ...parsed,
    limitations: Array.from(new Set([...parsed.limitations, ...profile.limitations])),
    requiresHumanReview: true,
  };
}
