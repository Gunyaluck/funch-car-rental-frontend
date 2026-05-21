import { CalendarDays, CarFront, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { CarListItem } from '../cars/types'
import { formatMoney } from '../cars/utils/car-detail-utils'

export const homeMetrics = [
  { value: '24/7', label: 'self-service booking' },
  { value: '6', label: 'pickup cities' },
  { value: '2 hr', label: 'minimum advance' },
]

export const fallbackHeroSlide = {
  image: '',
  alt: 'Featured rental car',
  label: 'Featured cars',
  title: 'Find your next rental',
  tags: ['Flexible pickup', 'Local pricing', 'Easy booking'],
}

export type HomeHeroSlide = {
  image: string
  alt: string
  label: string
  title: string
  tags: string[]
}

export type HomeStep = {
  icon: LucideIcon
  title: string
  description: string
}

export function carToHeroSlide(car: CarListItem): HomeHeroSlide {
  return {
    image: car.coverImage ?? '',
    alt: car.name,
    label: `${car.city} pickup`,
    title: car.name,
    tags: [
      car.transmission,
      `${car.seats} seats`,
      `From ${formatMoney(car.currencyCode, car.hourlyRate)}/hr`,
    ],
  }
}

export const homeSteps: HomeStep[] = [
  {
    icon: CarFront,
    title: 'Choose a vehicle',
    description: 'Filter by destination, car type, seats, and transmission.',
  },
  {
    icon: CalendarDays,
    title: 'Set the schedule',
    description: 'Pick pickup and return times before checking availability.',
  },
  {
    icon: ShieldCheck,
    title: 'Reserve with confidence',
    description: 'Booking rules and approval states are ready for the next flow.',
  },
]
