import assert from 'node:assert/strict';
import test from 'node:test';

import { resetConfigForTests } from '../src/config.js';
import { sendSms, sendWhatsApp } from '../src/notifications/index.js';

function withEnvironment(values: Record<string, string | undefined>) {
  const previous = new Map(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  resetConfigForTests();
  return () => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    resetConfigForTests();
  };
}

test('SMS uses the Africa Talking REST contract', { concurrency: false }, async () => {
  const restore = withEnvironment({
    AFRICASTALKING_API_KEY: 'test-key',
    AFRICASTALKING_USERNAME: 'sandbox',
    AFRICASTALKING_SMS_URL: 'https://example.test/messaging',
  });
  let request: { url: string; init?: RequestInit } | undefined;

  try {
    const result = await sendSms('+254700000000', 'Market update', async (url, init) => {
      request = { url: String(url), init };
      return new Response(
        JSON.stringify({
          SMSMessageData: { Recipients: [{ messageId: 'sms-1' }] },
        }),
        { status: 201 },
      );
    });

    assert.equal(request?.url, 'https://example.test/messaging');
    assert.match(String(request?.init?.body), /username=sandbox/);
    assert.match(String(request?.init?.body), /to=%2B254700000000/);
    assert.equal(result.providerMessageId, 'sms-1');
  } finally {
    restore();
  }
});

test('WhatsApp uses the Cloud API message contract', { concurrency: false }, async () => {
  const restore = withEnvironment({
    WHATSAPP_CLOUD_API_TOKEN: 'test-token',
    WHATSAPP_PHONE_NUMBER_ID: 'phone-1',
    WHATSAPP_GRAPH_API_BASE_URL: 'https://graph.example.test/v23.0',
  });
  let request: { url: string; init?: RequestInit } | undefined;

  try {
    const result = await sendWhatsApp('254700000000', 'Market update', async (url, init) => {
      request = { url: String(url), init };
      return new Response(JSON.stringify({ messages: [{ id: 'wa-1' }] }), {
        status: 200,
      });
    });

    assert.equal(request?.url, 'https://graph.example.test/v23.0/phone-1/messages');
    assert.equal(request?.init?.method, 'POST');
    assert.match(String(request?.init?.body), /"messaging_product":"whatsapp"/);
    assert.equal(result.providerMessageId, 'wa-1');
  } finally {
    restore();
  }
});
