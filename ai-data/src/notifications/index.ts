// Notification Service — sends outbound updates via SMS (Africa's Talking)
// and WhatsApp (Meta Cloud API). See docs/tech-stack.md.

export async function sendSms(to: string, message: string): Promise<void> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;

  if (!apiKey || !username) {
    console.warn('AfricasTalking credentials not set — SMS not sent.', { to, message });
    return;
  }

  // TODO: wire up the Africa's Talking SDK/REST call.
  throw new Error('sendSms not yet implemented');
}

export async function sendWhatsApp(to: string, message: string): Promise<void> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('WhatsApp Cloud API credentials not set — message not sent.', { to, message });
    return;
  }

  // TODO: wire up the WhatsApp Cloud API call.
  throw new Error('sendWhatsApp not yet implemented');
}
