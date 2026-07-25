import { getConfig } from '../config.js';

export type NotificationProviderResult = {
  providerMessageId?: string;
  providerResponse: string;
};

export class NotificationConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationConfigError';
  }
}

export async function sendSms(
  to: string,
  message: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<NotificationProviderResult> {
  const config = getConfig();
  if (!config.AFRICASTALKING_API_KEY || !config.AFRICASTALKING_USERNAME) {
    throw new NotificationConfigError('Africa’s Talking credentials are not configured.');
  }

  const form = new URLSearchParams({
    username: config.AFRICASTALKING_USERNAME,
    to,
    message,
  });
  if (config.AFRICASTALKING_SENDER_ID) {
    form.set('from', config.AFRICASTALKING_SENDER_ID);
  }

  const response = await fetchImplementation(config.AFRICASTALKING_SMS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      apiKey: config.AFRICASTALKING_API_KEY,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form,
    signal: AbortSignal.timeout(10_000),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Africa’s Talking SMS failed with ${response.status}: ${responseText}`);
  }

  let providerMessageId: string | undefined;
  try {
    const parsed = JSON.parse(responseText) as {
      SMSMessageData?: { Recipients?: Array<{ messageId?: string }> };
    };
    providerMessageId = parsed.SMSMessageData?.Recipients?.[0]?.messageId;
  } catch {
    // The raw response is retained even when the provider returns non-JSON.
  }

  return { providerMessageId, providerResponse: responseText };
}

export async function sendWhatsApp(
  to: string,
  message: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<NotificationProviderResult> {
  const config = getConfig();
  if (
    !config.WHATSAPP_CLOUD_API_TOKEN ||
    !config.WHATSAPP_PHONE_NUMBER_ID ||
    !config.WHATSAPP_GRAPH_API_BASE_URL
  ) {
    throw new NotificationConfigError('WhatsApp Cloud API credentials are not configured.');
  }

  const response = await fetchImplementation(
    `${config.WHATSAPP_GRAPH_API_BASE_URL.replace(/\/$/, '')}/${
      config.WHATSAPP_PHONE_NUMBER_ID
    }/messages`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.WHATSAPP_CLOUD_API_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: message },
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp message failed with ${response.status}: ${responseText}`);
  }

  let providerMessageId: string | undefined;
  try {
    const parsed = JSON.parse(responseText) as {
      messages?: Array<{ id?: string }>;
    };
    providerMessageId = parsed.messages?.[0]?.id;
  } catch {
    // The raw response is retained even when the provider returns non-JSON.
  }

  return { providerMessageId, providerResponse: responseText };
}
