import { z } from 'zod';

export const sendNotificationSchema = z.object({
  channel: z.enum(['sms', 'whatsapp']),
  to: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'Use an E.164 phone number, for example +254700000000.'),
  message: z.string().min(1).max(1_500),
});

export type SendNotificationRequest = z.infer<typeof sendNotificationSchema>;
