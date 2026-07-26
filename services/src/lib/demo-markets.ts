import type { MarketsQuery, MarketsResponse } from '../contracts/markets.js';

type DemoMarket = Omit<MarketsResponse['markets'][number], 'estimatedValue'>;

const UPDATED_AT = '2026-07-01T09:00:00.000Z';

const DEMO_MARKETS: Record<string, DemoMarket[]> = {
  maize: [
    localMarket('maize-wakulima', 'Wakulima Market', 'Nairobi', 49),
    localMarket('maize-nakuru', 'Nakuru Wholesale Market', 'Nakuru', 46),
    exportMarket('maize-kigali', 'Kigali Regional Buyers', 'Rwanda', 0.58),
    exportMarket('maize-dubai', 'Dubai Produce Buyers', 'UAE', 0.71),
  ],
  beans: [
    localMarket('beans-wakulima', 'Wakulima Market', 'Nairobi', 124),
    localMarket('beans-nakuru', 'Nakuru Wholesale Market', 'Nakuru', 116),
    exportMarket('beans-kigali', 'Kigali Regional Buyers', 'Rwanda', 1.18),
    exportMarket('beans-dubai', 'Dubai Produce Buyers', 'UAE', 1.42),
  ],
  tomatoes: [
    localMarket('tomatoes-wakulima', 'Wakulima Market', 'Nairobi', 68),
    localMarket('tomatoes-kongowea', 'Kongowea Market', 'Mombasa', 61),
    exportMarket('tomatoes-kigali', 'Kigali Fresh Market', 'Rwanda', 0.86),
    exportMarket('tomatoes-dubai', 'Dubai Fresh Produce Market', 'UAE', 1.12),
  ],
};

export function createDemoMarkets(query: MarketsQuery): MarketsResponse {
  const crop = query.crop.trim().toLowerCase();
  const markets = (DEMO_MARKETS[crop] ?? [])
    .filter((market) => market.scope === query.scope)
    .map((market) => ({
      ...market,
      estimatedValue: roundMoney(market.pricePerKg * query.quantityKg),
    }))
    .sort((left, right) => right.estimatedValue - left.estimatedValue);

  return {
    markets,
    dataNotice:
      'Indicative demo prices for product demonstration only. Confirm the latest price, grade, logistics, fees, and buyer terms before selling.',
  };
}

function localMarket(id: string, name: string, location: string, pricePerKg: number): DemoMarket {
  return {
    id,
    name,
    location,
    scope: 'local',
    pricePerKg,
    currency: 'KES',
    priceType: 'wholesale',
    source: 'JuaBei demo market fixture',
    updatedAt: UPDATED_AT,
    indicative: true,
  };
}

function exportMarket(id: string, name: string, location: string, pricePerKg: number): DemoMarket {
  return {
    id,
    name,
    location,
    scope: 'export',
    pricePerKg,
    currency: 'USD',
    priceType: 'export',
    source: 'JuaBei demo export fixture',
    updatedAt: UPDATED_AT,
    indicative: true,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
