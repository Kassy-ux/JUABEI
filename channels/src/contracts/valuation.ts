// Channels → Backend contract. Frozen; see CONTRIBUTING.md § Integration flow.
//
// Hand-written mirror of services/src/contracts/valuation.ts, which is the
// source of truth. Plain types rather than Zod schemas: the Backend is the
// validation boundary, so this lane only needs the shapes. Change both files
// together — nothing here will catch drift for you.

export type ValuationRequest = {
  crop: string
  variety?: string
  quantityKg: number
  county: string
  grade?: string
  harvestStatus?: string
}

export type EvidenceSource =
  'kamis' | 'cooperative' | 'verified_sales' | 'historical'

export type EvidenceItem = {
  source: EvidenceSource
  pricePerKg: number
  recordedAt: string // ISO 8601
}

export type ValuationResponse = {
  weightedMedian: number // KES per kg
  priceRange: { low: number; high: number }
  confidenceScore: number // 0..1
  estimatedValue: number // weightedMedian × quantityKg
  evidence: EvidenceItem[]
}

// Broker comparison is computed client-side against priceRange — no endpoint.
export type BrokerComparison = 'above' | 'within' | 'below'

export function compareBrokerOffer(
  offerPerKg: number,
  range: ValuationResponse['priceRange'],
): BrokerComparison {
  if (offerPerKg > range.high) return 'above'
  if (offerPerKg < range.low) return 'below'
  return 'within'
}
