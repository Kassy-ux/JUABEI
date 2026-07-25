import { and, desc, eq, gte, ilike, sql } from 'drizzle-orm';

import type { MarketDataPointInput } from '../../contracts/data.js';
import { getDb } from '../client.js';
import { marketDataPoints } from '../schema.js';

export async function upsertMarketDataPoints(points: MarketDataPointInput[]) {
  if (points.length === 0) return [];

  return getDb()
    .insert(marketDataPoints)
    .values(
      points.map((point) => ({
        ...point,
        currency: point.currency.toUpperCase(),
        sourcePublishedAt: new Date(point.sourcePublishedAt),
        pricePerKg: point.pricePerKg.toFixed(2),
      })),
    )
    .onConflictDoUpdate({
      target: [
        marketDataPoints.source,
        marketDataPoints.sourceRecordId,
        marketDataPoints.priceType,
      ],
      set: {
        crop: sql`excluded.crop`,
        market: sql`excluded.market`,
        county: sql`excluded.county`,
        country: sql`excluded.country`,
        unit: sql`excluded.unit`,
        priceType: sql`excluded.price_type`,
        pricePerKg: sql`excluded.price_per_kg`,
        currency: sql`excluded.currency`,
        sourceUrl: sql`excluded.source_url`,
        sourcePublishedAt: sql`excluded.source_published_at`,
        ingestedAt: new Date(),
      },
    })
    .returning();
}

export async function findMarketEvidence(input: {
  crop: string;
  county?: string;
  limit: number;
  maxAgeDays: number;
}) {
  const cutoff = new Date(Date.now() - input.maxAgeDays * 24 * 60 * 60 * 1_000);
  const filters = [
    ilike(marketDataPoints.crop, input.crop),
    eq(marketDataPoints.currency, 'KES'),
    eq(marketDataPoints.unit, 'kg'),
    gte(marketDataPoints.sourcePublishedAt, cutoff),
  ];
  if (input.county) filters.push(ilike(marketDataPoints.county, input.county));

  const rows = await getDb()
    .select()
    .from(marketDataPoints)
    .where(and(...filters))
    .orderBy(desc(marketDataPoints.sourcePublishedAt))
    .limit(input.limit);

  return rows.map((row) => ({
    ...row,
    pricePerKg: Number(row.pricePerKg),
  }));
}
