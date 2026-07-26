import assert from 'node:assert/strict';
import test from 'node:test';

import { marketsResponseSchema } from '../src/contracts/markets.js';
import { createDemoMarkets } from '../src/lib/demo-markets.js';

test('local markets calculate values for the farmer quantity', () => {
  const result = createDemoMarkets({
    crop: 'maize',
    quantityKg: 500,
    scope: 'local',
  });

  assert.equal(marketsResponseSchema.safeParse(result).success, true);
  assert.equal(result.markets.length, 2);
  assert.equal(result.markets[0]?.name, 'Wakulima Market');
  assert.equal(result.markets[0]?.estimatedValue, 24_500);
});

test('export markets retain destination currency and sort by value', () => {
  const result = createDemoMarkets({
    crop: 'beans',
    quantityKg: 100,
    scope: 'export',
  });

  assert.equal(result.markets[0]?.location, 'UAE');
  assert.equal(result.markets[0]?.currency, 'USD');
  assert.equal(result.markets[0]?.estimatedValue, 142);
  assert.equal(
    result.markets.every((market) => market.indicative),
    true,
  );
});
