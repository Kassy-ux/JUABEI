import type { MiddlewareHandler } from 'hono';

import { getConfig } from '../config.js';

export const internalAuth: MiddlewareHandler = async (context, next) => {
  const config = getConfig();
  if (!config.INTERNAL_API_TOKEN && config.NODE_ENV !== 'production') {
    await next();
    return;
  }

  const authorization = context.req.header('authorization');
  if (!config.INTERNAL_API_TOKEN || authorization !== `Bearer ${config.INTERNAL_API_TOKEN}`) {
    return context.json({ error: 'Unauthorized.' }, 401);
  }

  await next();
};
