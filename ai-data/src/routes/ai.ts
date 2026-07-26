import { createHash } from 'node:crypto';

import Anthropic from '@anthropic-ai/sdk';
import { Hono } from 'hono';

import { AnthropicNotConfiguredError, assessExportPhoto } from '../ai/claude.js';
import { getConfig } from '../config.js';
import { assessExportRequestSchema } from '../contracts/ai.js';
import { saveExportAssessment } from '../db/repositories/assessments.js';
import { getVisualStandardsProfile, listVisualStandardsProfiles } from '../standards/profiles.js';

export const aiRoutes = new Hono();

aiRoutes.get('/standards-profiles', (context) =>
  context.json({ profiles: listVisualStandardsProfiles() }),
);

aiRoutes.post('/assess-export', async (context) => {
  const body = await context.req.json().catch(() => null);
  const parsed = assessExportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  let profile;
  try {
    profile = getVisualStandardsProfile(parsed.data.crop, parsed.data.standardsProfileId);
  } catch (error) {
    return context.json(
      { error: error instanceof Error ? error.message : 'Invalid standards profile.' },
      400,
    );
  }

  try {
    const result = await assessExportPhoto(parsed.data, profile);
    const imageSha256 = createHash('sha256')
      .update(Buffer.from(parsed.data.imageBase64, 'base64'))
      .digest('hex');
    const saved = await saveExportAssessment({
      crop: parsed.data.crop,
      standardsProfileId: profile.id,
      standardsProfileVersion: profile.version,
      model: getConfig().ANTHROPIC_MODEL,
      visualStatus: result.visualStatus,
      requiresHumanReview: true,
      confidence: result.confidence.toFixed(3),
      qualityIssues: result.qualityIssues,
      observations: result.observations,
      limitations: result.limitations,
      imageMimeType: parsed.data.mimeType,
      imageSha256,
    });

    if (!saved) throw new Error('The assessment could not be persisted.');

    return context.json({
      ...result,
      assessmentId: saved.id,
      standardsProfileId: profile.id,
      standardsProfileVersion: profile.version,
      model: getConfig().ANTHROPIC_MODEL,
    });
  } catch (error) {
    if (error instanceof AnthropicNotConfiguredError) {
      console.error('Claude visual assessment is not configured', error);
      return context.json({ error: 'AI assessment is not configured.' }, 503);
    }
    if (error instanceof Anthropic.RateLimitError) {
      console.error('Claude visual assessment rate limited', error);
      return context.json({ error: 'AI assessment is temporarily rate limited.' }, 429);
    }
    console.error('Claude visual assessment failed', error);
    return context.json({ error: 'AI assessment failed.' }, 502);
  }
});
