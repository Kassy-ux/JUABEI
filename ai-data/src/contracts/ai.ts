import { z } from 'zod';

export const assessExportRequestSchema = z.object({
  imageBase64: z.string().min(1).max(4_500_000),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  crop: z.string().min(1).max(120),
  standardsProfileId: z.string().min(1).max(120).optional(),
});

export type AssessExportRequest = z.infer<typeof assessExportRequestSchema>;

export const visualAssessmentSchema = z.object({
  visualStatus: z.enum(['passes_visual_check', 'needs_review', 'insufficient_image']),
  qualityIssues: z.array(z.string()),
  observations: z.array(z.string()),
  limitations: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
  requiresHumanReview: z.literal(true),
});

export type VisualAssessment = z.infer<typeof visualAssessmentSchema>;

export const assessExportResponseSchema = visualAssessmentSchema.extend({
  assessmentId: z.string().uuid(),
  standardsProfileId: z.string(),
  standardsProfileVersion: z.string(),
  model: z.string(),
});

export type AssessExportResponse = z.infer<typeof assessExportResponseSchema>;
