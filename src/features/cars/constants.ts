import type { CarFilters } from './types'

export const defaultCarFilters: CarFilters = {
  countryCode: '',
  city: '',
  category: '',
  transmission: '',
  seats: '',
  pickupAt: '',
  returnAt: '',
}

export const minimumAdvanceBookingHours = 4
