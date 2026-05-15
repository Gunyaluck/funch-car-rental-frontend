export type PricingBreakdownItem = {
  label: string
  type: 'DAILY' | 'HOURLY'
  quantity: number
  unitPrice: number
  total: number
}

export type QuotedOption = {
  id: string
  name: string
  pricePerDay: number
  total: number
}

export type PricingQuote = {
  carId: string
  pickupAt: string
  returnAt: string
  timezone: string
  currencyCode: string
  pricingMode: 'HOURLY' | 'DAILY' | 'MIXED'
  totalDays: number
  totalHours: number
  subtotal: number
  optionsTotal: number
  grandTotal: number
  breakdown: PricingBreakdownItem[]
  selectedOptions: QuotedOption[]
}

export type PricingQuoteRequest = {
  carId: string
  pickupAt: string
  returnAt: string
  optionIds: string[]
}
