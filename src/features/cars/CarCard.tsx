import { Link, createSearchParams } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { buttonVariants } from '../../components/ui/button-variants'
import { Card, CardContent } from '../../components/ui/card'
import { cn } from '../../lib/utils'
import { getCountryName } from './country-names'
import type { CarFilters, CarListItem } from './types'
import { formatMoney, getApproximateLocalMoney } from './utils/car-detail-utils'

type CarCardProps = {
  car: CarListItem
  filters: CarFilters
  customerCountryCode?: string
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

export function CarCard({ car, filters, customerCountryCode }: CarCardProps) {
  const isAvailable = car.isAvailable !== false
  const locationLabel = [car.countryName ?? getCountryName(car.countryCode), car.city]
    .filter(Boolean)
    .join(' · ')
  const features =
    car.features && car.features.length > 0
      ? car.features
      : [car.timezone, `${car.currencyCode} pricing`]
  const hourlyLocalEstimate = getApproximateLocalMoney(
    car.currencyCode,
    car.hourlyRate,
    customerCountryCode,
  )
  const dailyLocalEstimate = getApproximateLocalMoney(
    car.currencyCode,
    car.dailyRate,
    customerCountryCode,
  )

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
          <Badge
            variant={isAvailable ? 'success' : 'danger'}
            className="gap-2 px-3 py-2"
          >
            <span className="relative flex size-2">
              {isAvailable ? (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-forest-700/35" />
              ) : null}
              <span
                className={cn(
                  'relative inline-flex size-2 rounded-full',
                  isAvailable ? 'bg-forest-700' : 'bg-red-600',
                )}
              />
            </span>
            {isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
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
              {formatMoney(car.currencyCode, car.hourlyRate)}
              <span className="ml-1 text-base text-stone-500">/hr</span>
            </p>
            {hourlyLocalEstimate ? (
              <p className="m-0 text-sm text-stone-500">
                Approx. {hourlyLocalEstimate.formattedValue} /hr
              </p>
            ) : null}
            <p className="m-0 text-stone-500">
              {formatMoney(car.currencyCode, car.dailyRate)} /day
            </p>
            {dailyLocalEstimate ? (
              <p className="m-0 text-sm text-stone-500">
                Approx. {dailyLocalEstimate.formattedValue} /day
              </p>
            ) : null}
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
