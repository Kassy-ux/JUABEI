import { z } from 'zod';

// Backend → AI Service contract. Frozen; see CONTRIBUTING.md § Integration flow.
//
// This lane owns this contract. services/ calls it from the Export Assessment
// Service and layers Export Standards / International Market Prices on top of
// the result, so the response here is deliberately AI-only: no pricing.

export const assessExportRequestSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  crop: z.string().min(1),
  // Plain-text summary of the standards the photo is judged against. Owned by
  // this lane (one string per crop) and injected into the Gemini prompt.
  exportStandardsSummary: z.string().min(1),
});

export type AssessExportRequest = z.infer<typeof assessExportRequestSchema>;

export const assessExportResponseSchema = z.object({
  eligible: z.boolean(),
  qualityIssues: z.array(z.string()),
  complianceGaps: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type AssessExportResponse = z.infer<typeof assessExportResponseSchema>;
