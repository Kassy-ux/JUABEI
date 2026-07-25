import { Hono, type Context } from 'hono';
import { z } from 'zod';

import {
  kamisImportSchema,
  marketDataImportSchema,
  marketEvidenceQuerySchema,
  reportTransactionSchema,
  updateTransactionStatusSchema,
} from '../contracts/data.js';
import { findMarketEvidence, upsertMarketDataPoints } from '../db/repositories/market-data.js';
import {
  getTransaction,
  InvalidTransactionTransitionError,
  reportTransaction,
  updateTransactionStatus,
} from '../db/repositories/transactions.js';
import { normalizeKamisRows } from '../market-data/normalize.js';

export const dataRoutes = new Hono();

dataRoutes.get('/market-data', async (context) => {
  const parsed = marketEvidenceQuerySchema.safeParse(context.req.query());
  if (!parsed.success) return validationError(context, parsed.error);

  const evidence = await findMarketEvidence(parsed.data);
  return context.json({ evidence });
});

dataRoutes.post('/market-data/import', async (context) => {
  const body = await context.req.json().catch(() => null);
  const parsed = marketDataImportSchema.safeParse(body);
  if (!parsed.success) return validationError(context, parsed.error);

  const imported = await upsertMarketDataPoints(parsed.data.points);
  return context.json({ imported: imported.length }, 201);
});

dataRoutes.post('/market-data/kamis', async (context) => {
  const body = await context.req.json().catch(() => null);
  const parsed = kamisImportSchema.safeParse(body);
  if (!parsed.success) return validationError(context, parsed.error);

  const points = normalizeKamisRows(parsed.data.rows);
  if (points.length === 0) {
    return context.json({ error: 'No wholesale or retail prices were present.' }, 400);
  }
  const imported = await upsertMarketDataPoints(points);
  return context.json({ imported: imported.length }, 201);
});

dataRoutes.post('/transactions', async (context) => {
  const body = await context.req.json().catch(() => null);
  const parsed = reportTransactionSchema.safeParse(body);
  if (!parsed.success) return validationError(context, parsed.error);

  const transaction = await reportTransaction(parsed.data);
  return context.json({ transaction }, 201);
});

dataRoutes.get('/transactions/:id', async (context) => {
  const id = context.req.param('id');
  if (!z.string().uuid().safeParse(id).success) {
    return context.json({ error: 'Invalid transaction ID.' }, 400);
  }

  const transaction = await getTransaction(id);
  return transaction
    ? context.json({ transaction })
    : context.json({ error: 'Transaction not found.' }, 404);
});

dataRoutes.patch('/transactions/:id/status', async (context) => {
  const id = context.req.param('id');
  if (!z.string().uuid().safeParse(id).success) {
    return context.json({ error: 'Invalid transaction ID.' }, 400);
  }

  const body = await context.req.json().catch(() => null);
  const parsed = updateTransactionStatusSchema.safeParse(body);
  if (!parsed.success) return validationError(context, parsed.error);

  try {
    const transaction = await updateTransactionStatus(id, parsed.data);
    return transaction
      ? context.json({ transaction })
      : context.json({ error: 'Transaction not found.' }, 404);
  } catch (error) {
    if (error instanceof InvalidTransactionTransitionError) {
      return context.json({ error: error.message }, 409);
    }
    throw error;
  }
});

function validationError(context: Context, error: z.ZodError) {
  return context.json({ error: error.flatten() }, 400);
}
