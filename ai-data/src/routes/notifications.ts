import { Hono } from 'hono';

import { sendNotificationSchema } from '../contracts/notifications.js';
import {
  createNotificationDelivery,
  markNotificationFailed,
  markNotificationSent,
} from '../db/repositories/notifications.js';
import { sendSms, sendWhatsApp } from '../notifications/index.js';

export const notificationRoutes = new Hono();

notificationRoutes.post('/send', async (context) => {
  const body = await context.req.json().catch(() => null);
  const parsed = sendNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return context.json({ error: parsed.error.flatten() }, 400);
  }

  const delivery = await createNotificationDelivery({
    channel: parsed.data.channel,
    recipient: parsed.data.to,
    message: parsed.data.message,
  });
  if (!delivery) return context.json({ error: 'Could not create delivery record.' }, 500);

  try {
    const result =
      parsed.data.channel === 'sms'
        ? await sendSms(parsed.data.to, parsed.data.message)
        : await sendWhatsApp(parsed.data.to, parsed.data.message);
    const updated = await markNotificationSent(
      delivery.id,
      result.providerMessageId,
      result.providerResponse,
    );
    return context.json({ delivery: updated }, 202);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notification failed.';
    await markNotificationFailed(delivery.id, message);
    return context.json({ error: message, deliveryId: delivery.id }, 502);
  }
});
