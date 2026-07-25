import { createHash } from 'node:crypto';

import { Hono } from 'hono';

import { assessExportPhoto } from '../ai/gemini.js';
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
      model: getConfig().GEMINI_MODEL,
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
      model: getConfig().GEMINI_MODEL,
    });
  } catch (error) {
    console.error('Gemini visual assessment failed', error);
    const message =
      error instanceof Error && error.message.includes('GEMINI_API_KEY')
        ? 'AI assessment is not configured.'
        : 'AI assessment failed.';
    return context.json({ error: message }, message.includes('configured') ? 503 : 502);
  }
});
