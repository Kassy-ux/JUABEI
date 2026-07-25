// Notification Service — sends outbound updates via SMS (Africa's Talking)
// and WhatsApp (Meta Cloud API), and reports whether the send succeeded. See
// docs/tech-stack.md. Callers must be able to tell "sent" from "not sent" —
// these functions never resolve successfully without actually attempting
// delivery. (Building the Notification Service itself is on the demo cut
// list — see TASKS.md — this only fixes the existing stub's behavior.)

export class NotificationConfigError extends Error {}

export async function sendSms(_to: string, _message: string): Promise<void> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;

  if (!apiKey || !username) {
    throw new NotificationConfigError(
      'AfricasTalking credentials not set (AFRICASTALKING_API_KEY / AFRICASTALKING_USERNAME) — SMS not sent.',
    );
  }

  // TODO: wire up the Africa's Talking SDK/REST call.
  throw new Error('sendSms not yet implemented');
}

export async function sendWhatsApp(_to: string, _message: string): Promise<void> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new NotificationConfigError(
      'WhatsApp Cloud API credentials not set (WHATSAPP_CLOUD_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID) — message not sent.',
    );
  }

  // TODO: wire up the WhatsApp Cloud API call.
  throw new Error('sendWhatsApp not yet implemented');
}
