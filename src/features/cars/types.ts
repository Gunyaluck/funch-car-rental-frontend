export type CarCategory =
  | 'SEDAN'
  | 'SUV'
  | 'VAN'
  | 'LUXURY'
  | 'ELECTRIC'

export type Transmission = 'AUTOMATIC' | 'MANUAL'

export type CarListItem = {
  id: string
  name: string
  brand: string
  model: string
  year: number
  category: CarCategory
  countryCode: string
  countryName: string
  city: string
  timezone: string
  currencyCode: string
  hourlyRate: number
  dailyRate: number
  seats: number
  transmission: Transmission
  fuelType: string
  status: 'AVAILABLE' | 'MAINTENANCE'
  highlight: string
  features: string[]
  unavailableDates?: Array<{
    from: string
    to: string
  }>
}

export type CarFilters = {
  countryCode: string
  city: string
  category: string
  transmission: string
  seats: string
  pickupAt: string
  returnAt: string
}
