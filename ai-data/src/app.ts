import { Hono } from 'hono';

import { checkDatabaseConnection } from './db/client.js';
import { internalAuth } from './middleware/internal-auth.js';
import { aiRoutes } from './routes/ai.js';
import { dataRoutes } from './routes/data.js';
import { notificationRoutes } from './routes/notifications.js';

export function createApp() {
  const app = new Hono();

  app.get('/health', (context) => context.json({ status: 'ok', service: 'ai-data' }));
  app.get('/ready', async (context) => {
    try {
      await checkDatabaseConnection();
      return context.json({
        status: 'ready',
        service: 'ai-data',
        database: 'connected',
      });
    } catch {
      return context.json(
        {
          status: 'not-ready',
          service: 'ai-data',
          database: 'unavailable',
        },
        503,
      );
    }
  });

  app.use('/ai/*', internalAuth);
  app.use('/data/*', internalAuth);
  app.use('/notifications/*', internalAuth);
  app.route('/ai', aiRoutes);
  app.route('/data', dataRoutes);
  app.route('/notifications', notificationRoutes);

  app.onError((error, context) => {
    console.error(error);
    return context.json({ error: 'Internal service error.' }, 500);
  });

  return app;
}

export const app = createApp();
