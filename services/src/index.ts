import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { exportAssessmentRoutes } from './routes/export-assessment.js';
import { valuationRoutes } from './routes/valuation.js';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok', service: 'services' }));

app.route('/valuation', valuationRoutes);
app.route('/export-assessment', exportAssessmentRoutes);

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API Gateway listening on http://localhost:${info.port}`);
});
