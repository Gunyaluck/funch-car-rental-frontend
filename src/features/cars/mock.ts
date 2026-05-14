import type { CarFilters, CarListItem } from './types'

export const mockCars: CarListItem[] = [
  {
    id: 'tokyo-yaris-at',
    name: 'Toyota Yaris Urban AT',
    brand: 'Toyota',
    model: 'Yaris',
    year: 2024,
    category: 'SEDAN',
    countryCode: 'JP',
    countryName: 'Japan',
    city: 'Tokyo',
    timezone: 'Asia/Tokyo',
    currencyCode: 'JPY',
    hourlyRate: 900,
    dailyRate: 5200,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'Petrol',
    status: 'AVAILABLE',
    highlight: 'Best for compact city travel and station pickup.',
    features: ['Unlimited km', 'Bluetooth', 'Airport pickup'],
    unavailableDates: [{ from: '2026-05-16T00:00', to: '2026-05-18T18:00' }],
  },
  {
    id: 'osaka-serena-family',
    name: 'Nissan Serena Family Van',
    brand: 'Nissan',
    model: 'Serena',
    year: 2023,
    category: 'VAN',
    countryCode: 'JP',
    countryName: 'Japan',
    city: 'Osaka',
    timezone: 'Asia/Tokyo',
    currencyCode: 'JPY',
    hourlyRate: 1200,
    dailyRate: 7500,
    seats: 7,
    transmission: 'AUTOMATIC',
    fuelType: 'Hybrid',
    status: 'AVAILABLE',
    highlight: 'Large cabin for family routes and luggage-heavy trips.',
    features: ['7 seats', 'Sliding doors', 'Child-seat ready'],
  },
  {
    id: 'bangkok-accord-exec',
    name: 'Honda Accord Executive',
    brand: 'Honda',
    model: 'Accord',
    year: 2024,
    category: 'LUXURY',
    countryCode: 'TH',
    countryName: 'Thailand',
    city: 'Bangkok',
    timezone: 'Asia/Bangkok',
    currencyCode: 'THB',
    hourlyRate: 350,
    dailyRate: 2100,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'Petrol',
    status: 'AVAILABLE',
    highlight: 'Comfort-focused sedan for business transfers.',
    features: ['Leather seats', 'Premium insurance', 'Fast approval'],
    unavailableDates: [{ from: '2026-05-20T08:00', to: '2026-05-21T20:00' }],
  },
  {
    id: 'chiangmai-atto-3',
    name: 'BYD Atto 3 Touring',
    brand: 'BYD',
    model: 'Atto 3',
    year: 2025,
    category: 'ELECTRIC',
    countryCode: 'TH',
    countryName: 'Thailand',
    city: 'Chiang Mai',
    timezone: 'Asia/Bangkok',
    currencyCode: 'THB',
    hourlyRate: 420,
    dailyRate: 2400,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'Electric',
    status: 'AVAILABLE',
    highlight: 'Low running cost with ideal range for northern loops.',
    features: ['EV charging card', 'Rear camera', 'Quiet cabin'],
  },
  {
    id: 'paris-peugeot-3008',
    name: 'Peugeot 3008 Crosscity',
    brand: 'Peugeot',
    model: '3008',
    year: 2024,
    category: 'SUV',
    countryCode: 'FR',
    countryName: 'France',
    city: 'Paris',
    timezone: 'Europe/Paris',
    currencyCode: 'EUR',
    hourlyRate: 18,
    dailyRate: 110,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'Diesel',
    status: 'AVAILABLE',
    highlight: 'Balanced SUV for city arrival and regional drives.',
    features: ['Navigation', 'Low-emission zone ready', '2 luggage'],
  },
  {
    id: 'zurich-xc60-snow',
    name: 'Volvo XC60 Alpine',
    brand: 'Volvo',
    model: 'XC60',
    year: 2025,
    category: 'SUV',
    countryCode: 'CH',
    countryName: 'Switzerland',
    city: 'Zurich',
    timezone: 'Europe/Zurich',
    currencyCode: 'CHF',
    hourlyRate: 24,
    dailyRate: 155,
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'Hybrid',
    status: 'MAINTENANCE',
    highlight: 'Winter-capable SUV with premium long-distance comfort.',
    features: ['Snow-ready tires', 'Adaptive cruise', 'Mountain assist'],
  },
]

export const defaultCarFilters: CarFilters = {
  countryCode: '',
  city: '',
  category: '',
  transmission: '',
  seats: '',
  pickupAt: '',
  returnAt: '',
}

export const carFilterOptions = {
  countries: [...new Set(mockCars.map((car) => `${car.countryCode}|${car.countryName}`))].map(
    (entry) => {
      const [code, name] = entry.split('|')
      return { code, name }
    },
  ),
  cities: [...new Set(mockCars.map((car) => car.city))].sort(),
  categories: [...new Set(mockCars.map((car) => car.category))].sort(),
  transmissions: [...new Set(mockCars.map((car) => car.transmission))].sort(),
  seats: [...new Set(mockCars.map((car) => String(car.seats)))].sort(),
}

function isOverlappingRange(
  pickupAt: string,
  returnAt: string,
  blockedRanges: CarListItem['unavailableDates'] = [],
) {
  if (!pickupAt || !returnAt) {
    return false
  }

  const pickupTime = new Date(pickupAt).getTime()
  const returnTime = new Date(returnAt).getTime()

  return blockedRanges.some((range) => {
    const blockedStart = new Date(range.from).getTime()
    const blockedEnd = new Date(range.to).getTime()
    return pickupTime < blockedEnd && returnTime > blockedStart
  })
}

export function filterCars(cars: CarListItem[], filters: CarFilters) {
  return cars.filter((car) => {
    const matchesCountry =
      !filters.countryCode || car.countryCode === filters.countryCode
    const matchesCity =
      !filters.city || car.city.toLowerCase() === filters.city.toLowerCase()
    const matchesCategory = !filters.category || car.category === filters.category
    const matchesTransmission =
      !filters.transmission || car.transmission === filters.transmission
    const matchesSeats = !filters.seats || car.seats === Number(filters.seats)
    const matchesAvailability =
      car.status === 'AVAILABLE' &&
      !isOverlappingRange(filters.pickupAt, filters.returnAt, car.unavailableDates)

    return (
      matchesCountry &&
      matchesCity &&
      matchesCategory &&
      matchesTransmission &&
      matchesSeats &&
      matchesAvailability
    )
  })
}
