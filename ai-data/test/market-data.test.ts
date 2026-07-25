import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalCropName, normalizeKamisRows } from '../src/market-data/normalize.js';

test('canonical crop names handle common KAMIS labels', () => {
  assert.equal(canonicalCropName('  Dry Maize '), 'maize');
  assert.equal(canonicalCropName('RED BEANS'), 'beans');
  assert.equal(canonicalCropName('French Peas'), 'french peas');
});

test('KAMIS rows become traceable wholesale and retail evidence', () => {
  const points = normalizeKamisRows([
    {
      id: 'kamis-42',
      commodity: 'Dry Maize',
      classification: '-',
      grade: 'Grade 1',
      market: 'Wakulima',
      county: 'Nairobi',
      wholesalePricePerKg: 52,
      retailPricePerKg: 65,
      recordedAt: '2026-07-25T09:00:00.000Z',
    },
  ]);

  assert.equal(points.length, 2);
  assert.deepEqual(
    points.map((point) => point.priceType),
    ['wholesale', 'retail'],
  );
  assert.equal(points[0]?.crop, 'maize');
  assert.equal(points[0]?.variety, undefined);
  assert.equal(points[0]?.sourceUrl, 'https://kamis.kilimo.go.ke/site/market');
});
