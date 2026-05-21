import { minimumAdvanceBookingHours } from '../constants'
import type { CarFilters, CarListItem } from '../types'
import { EMPTY_SELECT_VALUE } from './cars-filter-utils'

export const CARS_PER_PAGE = 6

export function getStoredCustomerCountryCode() {
  return window.localStorage.getItem('customerCountryCode') ?? 'TH'
}

export function getMinimumPickupTime() {
  return Date.now() + minimumAdvanceBookingHours * 60 * 60 * 1000
}

export function isBookableCar(car: CarListItem) {
  return car.status === 'AVAILABLE' && car.isAvailable !== false
}

export function getCarsPageFilterError(filters: CarFilters) {
  if ((filters.pickupAt && !filters.returnAt) || (!filters.pickupAt && filters.returnAt)) {
    return 'Pickup and return must be selected together.'
  }

  if (filters.pickupAt && new Date(filters.pickupAt).getTime() < getMinimumPickupTime()) {
    return `Pickup must be at least ${minimumAdvanceBookingHours} hours from now.`
  }

  if (
    filters.pickupAt &&
    filters.returnAt &&
    new Date(filters.pickupAt) >= new Date(filters.returnAt)
  ) {
    return 'Return must be later than pickup.'
  }

  return ''
}

export function buildNextDraftFilters({
  currentFilters,
  filtersKey,
  name,
  value,
}: {
  currentFilters: CarFilters
  filtersKey: string
  name: keyof CarFilters
  value: string
}) {
  return {
    key: filtersKey,
    filters: {
      ...currentFilters,
      [name]: value === EMPTY_SELECT_VALUE ? '' : value,
      ...(name === 'pickupAt' &&
      currentFilters.returnAt &&
      value &&
      new Date(currentFilters.returnAt) <= new Date(value)
        ? { returnAt: '' }
        : {}),
    },
  }
}
