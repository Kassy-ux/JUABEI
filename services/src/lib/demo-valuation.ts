import type {
  EvidenceSource,
  ValuationRequest,
  ValuationResponse,
} from '../contracts/valuation.js';

const CROP_PRICES: Record<string, number> = {
  beans: 118,
  maize: 46,
  tomatoes: 64,
};

const COUNTY_MULTIPLIERS: Record<string, number> = {
  kiambu: 1.06,
  nakuru: 0.97,
  'uasin gishu': 0.94,
};

const EVIDENCE: Array<{
  source: EvidenceSource;
  multiplier: number;
  daysAgo: number;
}> = [
  { source: 'cooperative', multiplier: 0.96, daysAgo: 2 },
  { source: 'verified_sales', multiplier: 1, daysAgo: 1 },
  { source: 'historical', multiplier: 1.04, daysAgo: 7 },
];

/**
 * Produces a deterministic, contract-correct valuation for the supported demo
 * crops. Replace this adapter when live market evidence is connected.
 */
export function createDemoValuation(request: ValuationRequest): ValuationResponse | null {
  const cropPrice = CROP_PRICES[request.crop.trim().toLowerCase()];
  if (!cropPrice) return null;

  const countyMultiplier = COUNTY_MULTIPLIERS[request.county.trim().toLowerCase()] ?? 1;
  const weightedMedian = roundPrice(cropPrice * countyMultiplier);
  const now = Date.now();

  return {
    weightedMedian,
    priceRange: {
      low: roundPrice(weightedMedian * 0.9),
      high: roundPrice(weightedMedian * 1.1),
    },
    confidenceScore: 0.68,
    estimatedValue: roundPrice(weightedMedian * request.quantityKg),
    evidence: EVIDENCE.map(({ source, multiplier, daysAgo }) => ({
      source,
      pricePerKg: roundPrice(weightedMedian * multiplier),
      recordedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    })),
  };
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}
