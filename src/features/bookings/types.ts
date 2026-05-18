export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export type BookingOption = {
  id: string
  carOptionId: string
  name: string
  pricePerDay: number
  totalPrice: number
}

export type BookingItem = {
  id: string
  pickupAt: string
  returnAt: string
  pickupTimezone: string
  totalHours: number
  totalDays: number
  subtotal: number
  optionsTotal: number
  grandTotal: number
  currencyCode: string
  pricingMode: 'HOURLY' | 'DAILY' | 'MIXED'
  status: BookingStatus
  adminNote: string | null
  approvedAt: string | null
  createdAt: string
  car: {
    id: string
    name: string
    brand: string
    model: string
    year: number
    countryCode: string
    city: string
    timezone: string
    coverImage: string | null
  }
  options: BookingOption[]
}

export type CreateBookingPayload = {
  carId: string
  pickupAt: string
  returnAt: string
  optionIds: string[]
}
