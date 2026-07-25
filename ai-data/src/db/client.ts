import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getConfig } from '../config.js';
import * as schema from './schema.js';

let pool: Pool | undefined;
let database: NodePgDatabase<typeof schema> | undefined;

export function getPool() {
  pool ??= new Pool({
    connectionString: getConfig().DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return pool;
}

export function getDb() {
  database ??= drizzle(getPool(), { schema });
  return database;
}

export async function checkDatabaseConnection() {
  const result = await getPool().query<{ now: Date }>('select now() as now');
  return result.rows[0]?.now;
}

export async function closeDatabaseConnection() {
  if (pool) await pool.end();
  pool = undefined;
  database = undefined;
}
