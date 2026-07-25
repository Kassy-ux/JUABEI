import type { NewExportAssessment } from '../schema.js';
import { getDb } from '../client.js';
import { exportAssessments } from '../schema.js';

export async function saveExportAssessment(input: NewExportAssessment) {
  const rows = await getDb().insert(exportAssessments).values(input).returning();
  return rows[0];
}
