// Channels → Backend contract. Frozen; see CONTRIBUTING.md § Integration flow.
//
// Hand-written mirror of services/src/contracts/export-assessment.ts, which is
// the source of truth. Change both together.
//
// Downscale the photo to ~1024px on its longest edge before base64-encoding it.
// A raw phone photo is 2–5 MB and becomes 3–7 MB of base64 crossing two hops as
// JSON; on demo-venue wifi that reads as a broken app.

export type ExportAssessmentRequest = {
  crop: string;
  quantityKg: number;
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  fertilizerOrManure?: string;
  cropProtection?: string;
  harvestDetails?: string;
  productionRecords?: string;
};

export type InternationalMarketPrice = {
  pricePerKg: number;
  currency: string; // ISO 4217, e.g. 'USD'
  estimatedExportValue: number;
};

export type ExportAssessmentResponse = {
  eligible: boolean;
  qualityIssues: string[];
  complianceGaps: string[];
  confidence: number; // 0..1
  // null when not export-eligible — there is no price to show.
  internationalMarketPrice: InternationalMarketPrice | null;
};
