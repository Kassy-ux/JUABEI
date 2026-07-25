import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { aiRoutes } from './routes/ai.js';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok', service: 'ai-data' }));

app.route('/ai', aiRoutes);

const port = Number(process.env.PORT ?? 4100);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`AI Service listening on http://localhost:${info.port}`);
});
