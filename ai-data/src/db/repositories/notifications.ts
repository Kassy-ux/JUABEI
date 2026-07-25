import { eq } from 'drizzle-orm';

import { getDb } from '../client.js';
import { notificationDeliveries } from '../schema.js';

export async function createNotificationDelivery(input: {
  channel: 'sms' | 'whatsapp';
  recipient: string;
  message: string;
}) {
  const rows = await getDb().insert(notificationDeliveries).values(input).returning();
  return rows[0];
}

export async function markNotificationSent(
  id: string,
  providerMessageId: string | undefined,
  providerResponse: string,
) {
  const rows = await getDb()
    .update(notificationDeliveries)
    .set({
      status: 'sent',
      providerMessageId,
      providerResponse,
      sentAt: new Date(),
      errorMessage: null,
    })
    .where(eq(notificationDeliveries.id, id))
    .returning();
  return rows[0];
}

export async function markNotificationFailed(id: string, errorMessage: string) {
  const rows = await getDb()
    .update(notificationDeliveries)
    .set({ status: 'failed', errorMessage })
    .where(eq(notificationDeliveries.id, id))
    .returning();
  return rows[0];
}
