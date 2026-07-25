import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/app.js';
import { resetConfigForTests } from '../src/config.js';

test('health endpoint does not depend on providers or the database', async () => {
  const response = await createApp().request('/health');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'ai-data',
  });
});

test('production internal routes require the configured bearer token', async () => {
  const previousNodeEnvironment = process.env.NODE_ENV;
  const previousToken = process.env.INTERNAL_API_TOKEN;
  process.env.NODE_ENV = 'production';
  process.env.INTERNAL_API_TOKEN = 'integration-token';
  resetConfigForTests();

  try {
    const app = createApp();
    const unauthorized = await app.request('/ai/standards-profiles');
    assert.equal(unauthorized.status, 401);

    const authorized = await app.request('/ai/standards-profiles', {
      headers: { authorization: 'Bearer integration-token' },
    });
    assert.equal(authorized.status, 200);
  } finally {
    if (previousNodeEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnvironment;
    if (previousToken === undefined) delete process.env.INTERNAL_API_TOKEN;
    else process.env.INTERNAL_API_TOKEN = previousToken;
    resetConfigForTests();
  }
});
