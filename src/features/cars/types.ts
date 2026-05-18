export type CarCategory =
  | 'SEDAN'
  | 'SUV'
  | 'VAN'
  | 'TRUCK'
  | 'SPORTS'
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
  countryName?: string
  city: string
  timezone: string
  currencyCode: string
  hourlyRate: number
  dailyRate: number
  seats: number
  transmission: Transmission
  fuelType: string
  status: 'AVAILABLE' | 'MAINTENANCE' | 'RETIRED'
  coverImage?: string | null
  isAvailable?: boolean
  highlight?: string
  features?: string[]
  unavailableDates?: Array<{
    from: string
    to: string
  }>
}

export type CarDetailImage = {
  id: string
  url: string
  sortOrder: number
  isCover: boolean
}

export type CarOption = {
  id: string
  name: string
  pricePerDay: number
  description: string | null
}

export type LocationHour = {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

export type CarDetailItem = Omit<
  CarListItem,
  'coverImage' | 'isAvailable' | 'highlight' | 'features'
> & {
  description: string | null
  is24Hours: boolean
  minAdvanceBookingHr: number
  maxBookingDays: number
  bufferHours: number
  images: CarDetailImage[]
  options: CarOption[]
  locationHours: LocationHour[]
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
