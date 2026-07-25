import { serve } from '@hono/node-server';

import { app } from './app.js';
import { getConfig } from './config.js';
import { closeDatabaseConnection } from './db/client.js';

const config = getConfig();
const server = serve({ fetch: app.fetch, port: config.AI_DATA_PORT }, (info) => {
  console.log(`AI/Data Service listening on http://localhost:${info.port}`);
});

async function shutdown() {
  server.close();
  await closeDatabaseConnection();
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
