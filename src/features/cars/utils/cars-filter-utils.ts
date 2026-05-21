import { defaultCarFilters } from '../constants'
import { getCountryName } from '../country-names'
import type { CarFilters, CarListItem } from '../types'

export const EMPTY_SELECT_VALUE = '__all__'

export type SelectOption = {
  value: string
  label: string
}

export function filtersFromSearchParams(searchParams: URLSearchParams): CarFilters {
  return {
    countryCode: searchParams.get('countryCode') ?? defaultCarFilters.countryCode,
    city: searchParams.get('city') ?? defaultCarFilters.city,
    category: searchParams.get('category') ?? defaultCarFilters.category,
    transmission:
      searchParams.get('transmission') ?? defaultCarFilters.transmission,
    seats: searchParams.get('seats') ?? defaultCarFilters.seats,
    pickupAt: searchParams.get('pickupAt') ?? defaultCarFilters.pickupAt,
    returnAt: searchParams.get('returnAt') ?? defaultCarFilters.returnAt,
  }
}

export function selectValue(value: string) {
  return value || EMPTY_SELECT_VALUE
}

function optionItems(items: string[], suffix = '') {
  return items.map((item) => ({
    value: item,
    label: suffix ? `${item} ${suffix}` : item,
  }))
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

export function optionsFromCars(cars: CarListItem[]) {
  return {
    countries: [
      ...new Map(
        cars.map((car) => [
          car.countryCode,
          {
            value: car.countryCode,
            label: car.countryName ?? getCountryName(car.countryCode),
          },
        ]),
      ).values(),
    ].sort((a, b) => a.label.localeCompare(b.label)),
    cities: optionItems(uniqueSorted(cars.map((car) => car.city))),
    categories: optionItems(uniqueSorted(cars.map((car) => car.category))),
    transmissions: optionItems(uniqueSorted(cars.map((car) => car.transmission))),
    seats: optionItems(uniqueSorted(cars.map((car) => String(car.seats))), 'seats'),
  }
}
