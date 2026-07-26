import assert from 'node:assert/strict';
import test from 'node:test';

import { parseConfig } from '../src/config.js';

test('configuration supplies safe local defaults', () => {
  const config = parseConfig({});

  assert.equal(config.AI_DATA_PORT, 4100);
  assert.equal(config.NODE_ENV, 'development');
  assert.match(config.DATABASE_URL, /^postgres:/);
  assert.equal(config.ANTHROPIC_API_KEY, undefined);
});

test('configuration rejects invalid provider URLs', () => {
  assert.throws(() => parseConfig({ AFRICASTALKING_SMS_URL: 'not-a-url' }));
});
