import { Link, createSearchParams } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { buttonVariants } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { getCountryName } from './country-names'
import type { CarFilters, CarListItem } from './types'

type CarCardProps = {
  car: CarListItem
  filters: CarFilters
}

function buildDetailLink(carId: string, filters: CarFilters) {
  const search = createSearchParams(
    Object.entries(filters).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value) {
        acc[key] = value
      }
      return acc
    }, {}),
  ).toString()

  return {
    pathname: `/cars/${carId}`,
    search: search ? `?${search}` : '',
  }
}

export function CarCard({ car, filters }: CarCardProps) {
  const locationLabel = [car.countryName ?? getCountryName(car.countryCode), car.city]
    .filter(Boolean)
    .join(' · ')
  const features =
    car.features && car.features.length > 0
      ? car.features
      : [car.timezone, `${car.currencyCode} pricing`]

  return (
    <Card className="overflow-hidden">
      <div className="relative min-h-[188px] overflow-hidden p-[18px] bg-[linear-gradient(135deg,rgba(35,88,63,0.12),rgba(255,255,255,0.4))]">
        {car.coverImage ? (
          <img
            src={car.coverImage}
            alt={car.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,249,243,0.24),rgba(32,48,36,0.34))]" />
        <span className="inline-flex rounded-full bg-white/75 px-3 py-2 text-[0.84rem] font-bold">
          {locationLabel}
        </span>
      </div>

      <CardContent className="grid gap-[18px]">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
          <div>
            <h2 className="m-0 font-(--font-heading) text-[1.35rem]">{car.name}</h2>
            <p className="m-0 text-stone-500">
              {car.brand} {car.model} · {car.year}
            </p>
          </div>
          <Badge>{car.isAvailable === false ? 'Unavailable' : 'Available'}</Badge>
        </div>

        <p className="m-0 text-stone-500">
          {car.highlight ?? `${car.category.toLowerCase()} rental in ${car.city}.`}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="chip">
            {car.category}
          </Badge>
          <Badge variant="chip">
            {car.transmission}
          </Badge>
          <Badge variant="chip">
            {car.seats} seats
          </Badge>
          <Badge variant="chip">
            {car.fuelType}
          </Badge>
        </div>

        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {features.map((feature) => (
            <li key={feature} className="text-[0.92rem] text-forest-900">
              <span className="text-clay-600">• </span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="m-0 font-(--font-heading) text-[1.6rem] leading-none">
              {car.currencyCode} {car.hourlyRate.toLocaleString()}
              <span className="ml-1 text-base text-stone-500">/hr</span>
            </p>
            <p className="m-0 text-stone-500">
              {car.currencyCode} {car.dailyRate.toLocaleString()} /day
            </p>
          </div>

          <Link
            to={buildDetailLink(car.id, filters)}
            className={buttonVariants()}
          >
            View Details
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
