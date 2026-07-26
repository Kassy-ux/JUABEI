export type MarketScope = 'local' | 'export'

export type MarketListing = {
  id: string
  name: string
  location: string
  scope: MarketScope
  pricePerKg: number
  currency: string
  estimatedValue: number
  priceType: 'wholesale' | 'retail' | 'export'
  source: string
  updatedAt: string
  indicative: boolean
}

export type MarketsResponse = {
  markets: MarketListing[]
  dataNotice: string
}
