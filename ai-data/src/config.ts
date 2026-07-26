import { z } from 'zod';

const optionalSecret = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AI_DATA_PORT: z.coerce.number().int().positive().max(65_535).default(4100),
  DATABASE_URL: z.string().min(1).default('postgres://juabei:juabei@127.0.0.1:5432/juabei'),
  INTERNAL_API_TOKEN: optionalSecret,
  ANTHROPIC_API_KEY: optionalSecret,
  ANTHROPIC_MODEL: z.string().min(1).default('claude-opus-5'),
  AFRICASTALKING_API_KEY: optionalSecret,
  AFRICASTALKING_USERNAME: optionalSecret,
  AFRICASTALKING_SENDER_ID: optionalSecret,
  AFRICASTALKING_SMS_URL: z
    .string()
    .url()
    .default('https://api.africastalking.com/version1/messaging'),
  WHATSAPP_CLOUD_API_TOKEN: optionalSecret,
  WHATSAPP_PHONE_NUMBER_ID: optionalSecret,
  WHATSAPP_GRAPH_API_BASE_URL: optionalSecret.pipe(z.string().url().optional()),
});

export type AppConfig = z.infer<typeof configSchema>;

let cachedConfig: AppConfig | undefined;

export function getConfig(): AppConfig {
  cachedConfig ??= configSchema.parse(process.env);

  if (cachedConfig.NODE_ENV === 'production' && !cachedConfig.INTERNAL_API_TOKEN) {
    throw new Error('INTERNAL_API_TOKEN is required in production.');
  }

  return cachedConfig;
}

export function parseConfig(environment: NodeJS.ProcessEnv): AppConfig {
  return configSchema.parse(environment);
}

export function resetConfigForTests() {
  cachedConfig = undefined;
}
