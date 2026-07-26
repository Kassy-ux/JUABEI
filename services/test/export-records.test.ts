import assert from 'node:assert/strict';
import test from 'node:test';

import { findRecordComplianceGaps } from '../src/lib/export-records.js';

test('complete demo records add no deterministic compliance gaps', () => {
  assert.deepEqual(
    findRecordComplianceGaps({
      fertilizerOrManure: 'Composted manure applied before planting.',
      cropProtection: 'Approved product recorded with application dates.',
      harvestDetails: 'Harvested dry and stored in clean labelled bags.',
      productionRecords: 'Batch JB-2026-001 with dated field records.',
    }),
    [],
  );
});

test('missing demo records explain what must be supplied', () => {
  const gaps = findRecordComplianceGaps({
    fertilizerOrManure: '',
    cropProtection: '',
    harvestDetails: '',
    productionRecords: '',
  });

  assert.equal(gaps.length, 4);
  assert.match(gaps.join(' '), /production or batch records/i);
});
