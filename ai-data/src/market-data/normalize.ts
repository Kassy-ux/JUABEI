import type { KamisRow, MarketDataPointInput } from '../contracts/data.js';

const cropAliases: Array<[RegExp, string]> = [
  [/\bmaize\b/i, 'maize'],
  [/\bbeans?\b/i, 'beans'],
  [/\btomatoes?\b/i, 'tomatoes'],
  [/\bpotatoes?\b/i, 'potatoes'],
  [/\bonions?\b/i, 'onions'],
];

export function canonicalCropName(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return cropAliases.find(([pattern]) => pattern.test(normalized))?.[1] ?? normalized.toLowerCase();
}

function meaningful(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && normalized !== '-' ? normalized : undefined;
}

export function normalizeKamisRows(rows: KamisRow[]): MarketDataPointInput[] {
  return rows.flatMap((row) => {
    const shared = {
      source: 'kamis' as const,
      sourceRecordId: row.id,
      crop: canonicalCropName(row.commodity),
      variety: meaningful(row.classification),
      grade: meaningful(row.grade),
      county: row.county.trim(),
      country: 'Kenya',
      market: row.market.trim(),
      currency: 'KES',
      unit: 'kg' as const,
      sourceUrl: 'https://kamis.kilimo.go.ke/site/market',
      sourcePublishedAt: row.recordedAt,
    };
    const points: MarketDataPointInput[] = [];

    if (row.wholesalePricePerKg) {
      points.push({
        ...shared,
        priceType: 'wholesale',
        pricePerKg: row.wholesalePricePerKg,
      });
    }
    if (row.retailPricePerKg) {
      points.push({
        ...shared,
        priceType: 'retail',
        pricePerKg: row.retailPricePerKg,
      });
    }

    return points;
  });
}
