import type {
  ValuationRequest,
  ValuationResponse,
} from '../contracts/valuation'

export const cropOptions = [
  { key: '1', label: 'Maize', value: 'maize' },
  { key: '2', label: 'Beans', value: 'beans' },
  { key: '3', label: 'Tomatoes', value: 'tomatoes' },
] as const

export const countyOptions = [
  { key: '1', label: 'Nakuru', value: 'Nakuru' },
  { key: '2', label: 'Kiambu', value: 'Kiambu' },
  { key: '3', label: 'Uasin Gishu', value: 'Uasin Gishu' },
] as const

type MenuOption = {
  key: string
  label: string
  value: string
}

export function optionMenu(options: readonly MenuOption[]) {
  return options.map((option) => `${option.key}. ${option.label}`).join('\n')
}

export function resolveOption(input: string, options: readonly MenuOption[]) {
  const normalized = input.trim().toLowerCase()
  return options.find(
    (option) =>
      option.key === normalized ||
      option.label.toLowerCase() === normalized ||
      option.value.toLowerCase() === normalized,
  )
}

export function positiveNumber(input: string) {
  const value = Number(input.trim())
  return Number.isFinite(value) && value > 0 ? value : null
}

export function makeValuationRequest(
  crop: string,
  quantityKg: number,
  county: string,
): ValuationRequest {
  return { crop, quantityKg, county }
}

export function compactPrice(value: number) {
  return new Intl.NumberFormat('en-KE', {
    maximumFractionDigits: 2,
  }).format(value)
}

export function valuationSummary(valuation: ValuationResponse) {
  return `KES ${compactPrice(valuation.priceRange.low)}-${compactPrice(
    valuation.priceRange.high,
  )}/kg. Best estimate: KES ${compactPrice(valuation.weightedMedian)}/kg.`
}

export function hasUsableValuation(valuation: ValuationResponse) {
  return valuation.priceRange.high > 0 && valuation.weightedMedian > 0
}
