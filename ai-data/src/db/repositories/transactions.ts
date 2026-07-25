import { eq } from 'drizzle-orm';

import type { ReportTransaction, UpdateTransactionStatus } from '../../contracts/data.js';
import { getDb } from '../client.js';
import { marketDataPoints, transactions } from '../schema.js';

type TransactionStatus = 'reported' | 'pending_verification' | 'verified' | 'rejected';

const allowedTransitions: Record<TransactionStatus, TransactionStatus[]> = {
  reported: ['pending_verification'],
  pending_verification: ['verified', 'rejected'],
  verified: [],
  rejected: ['pending_verification'],
};

export class InvalidTransactionTransitionError extends Error {
  constructor(from: TransactionStatus, to: TransactionStatus) {
    super(`Transaction status cannot change from ${from} to ${to}.`);
    this.name = 'InvalidTransactionTransitionError';
  }
}

export function isAllowedTransactionTransition(from: TransactionStatus, to: TransactionStatus) {
  return allowedTransitions[from].includes(to);
}

export async function reportTransaction(input: ReportTransaction) {
  const rows = await getDb()
    .insert(transactions)
    .values({
      ...input,
      currency: input.currency.toUpperCase(),
      quantityKg: input.quantityKg.toFixed(3),
      pricePerKg: input.pricePerKg.toFixed(2),
      occurredAt: new Date(input.occurredAt),
    })
    .returning();
  return rows[0];
}

export async function getTransaction(id: string) {
  const rows = await getDb().select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return rows[0];
}

export async function updateTransactionStatus(id: string, input: UpdateTransactionStatus) {
  return getDb().transaction(async (transaction) => {
    const existingRows = await transaction
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    const existing = existingRows[0];
    if (!existing) return undefined;
    if (!isAllowedTransactionTransition(existing.status, input.status)) {
      throw new InvalidTransactionTransitionError(existing.status, input.status);
    }

    const verifiedAt = input.status === 'verified' ? new Date() : null;
    const updatedRows = await transaction
      .update(transactions)
      .set({
        status: input.status,
        verifiedBy: input.verifiedBy,
        verifiedAt,
        rejectionReason: input.status === 'rejected' ? input.rejectionReason : null,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();
    const updated = updatedRows[0];

    if (input.status === 'verified' && updated) {
      await transaction
        .insert(marketDataPoints)
        .values({
          source: 'verified_sales',
          sourceRecordId: updated.id,
          crop: updated.crop,
          variety: updated.variety,
          grade: updated.grade,
          county: updated.county,
          market: updated.buyerReference,
          priceType: updated.channel === 'export' ? 'export' : 'farm_gate',
          pricePerKg: updated.pricePerKg,
          currency: updated.currency,
          unit: 'kg',
          sourcePublishedAt: updated.occurredAt,
        })
        .onConflictDoNothing();
    }

    return updated;
  });
}
