import type { ExportAssessmentRequest } from '../contracts/export-assessment.js';

type ExportRecords = Pick<
  ExportAssessmentRequest,
  'fertilizerOrManure' | 'cropProtection' | 'harvestDetails' | 'productionRecords'
>;

export function findRecordComplianceGaps(records: ExportRecords) {
  const gaps: string[] = [];

  if (!records.fertilizerOrManure?.trim()) {
    gaps.push('Fertilizer or manure history has not been provided.');
  }
  if (!records.cropProtection?.trim()) {
    gaps.push('Crop-protection products and application dates are not documented.');
  }
  if (!records.harvestDetails?.trim()) {
    gaps.push('Harvest date, handling, and storage details are missing.');
  }
  if (!records.productionRecords?.trim()) {
    gaps.push('Traceable production or batch records are missing.');
  }

  return gaps;
}
