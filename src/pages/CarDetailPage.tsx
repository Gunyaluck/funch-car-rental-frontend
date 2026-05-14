import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CarFront,
  Clock3,
  Fuel,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, createSearchParams, useParams, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Badge } from '../components/ui/badge'
import { buttonVariants } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { DateTimePicker } from '../components/ui/date-time-picker'
import { FieldLabel, Label } from '../components/ui/label'
import { cn } from '../lib/utils'
import { getCarById } from '../features/cars/api'
import type { CarDetailItem } from '../features/cars/types'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatMoney(currencyCode: string, value: number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value)
}

function estimateRentalDays(pickupAt: string, returnAt: string) {
  if (!pickupAt || !returnAt) {
    return 1
  }

  const pickupTime = new Date(pickupAt).getTime()
  const returnTime = new Date(returnAt).getTime()

  if (Number.isNaN(pickupTime) || Number.isNaN(returnTime) || returnTime <= pickupTime) {
    return 1
  }

  return Math.max(1, Math.ceil((returnTime - pickupTime) / (24 * 60 * 60 * 1000)))
}

function buildCheckoutLink(params: {
  carId: string
  pickupAt: string
  returnAt: string
  optionIds: string[]
}) {
  const search = createSearchParams(
    Object.entries({
      carId: params.carId,
      pickupAt: params.pickupAt,
      returnAt: params.returnAt,
      optionIds: params.optionIds.join(','),
    }).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value) {
        acc[key] = value
      }
      return acc
    }, {}),
  ).toString()

  return {
    pathname: '/checkout',
    search: search ? `?${search}` : '',
  }
}

export function CarDetailPage() {
  const { carId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [car, setCar] = useState<CarDetailItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])

  const pickupAt = searchParams.get('pickupAt') ?? ''
  const returnAt = searchParams.get('returnAt') ?? ''

  useEffect(() => {
    let isCurrent = true

    async function fetchCarDetail() {
      if (!carId) {
        setErrorMessage('Missing car id.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await getCarById(carId)

        if (isCurrent) {
          setCar(result)
        }
      } catch (error) {
        if (isCurrent) {
          setCar(null)
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load this vehicle from the backend.',
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    fetchCarDetail()

    return () => {
      isCurrent = false
    }
  }, [carId])

  const selectedOptions = useMemo(
    () => car?.options.filter((option) => selectedOptionIds.includes(option.id)) ?? [],
    [car?.options, selectedOptionIds],
  )
  const rentalDays = estimateRentalDays(pickupAt, returnAt)
  const optionsTotal = selectedOptions.reduce(
    (total, option) => total + option.pricePerDay * rentalDays,
    0,
  )
  const estimatedTotal = car ? car.dailyRate * rentalDays + optionsTotal : 0
  const coverImage = car?.images.find((image) => image.isCover)?.url ?? car?.images[0]?.url
  const checkoutLink =
    car && carId
      ? buildCheckoutLink({
          carId,
          pickupAt,
          returnAt,
          optionIds: selectedOptionIds,
        })
      : '/checkout'

  function updateSearchDate(name: 'pickupAt' | 'returnAt', value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set(name, value)
    } else {
      nextParams.delete(name)
    }

    setSearchParams(nextParams)
  }

  function toggleOption(optionId: string) {
    setSelectedOptionIds((currentIds) =>
      currentIds.includes(optionId)
        ? currentIds.filter((id) => id !== optionId)
        : [...currentIds, optionId],
    )
  }

  if (isLoading) {
    return (
      <PageSection
        eyebrow="Car Detail"
        title="Loading vehicle details"
        description="Fetching the selected vehicle from the backend database."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <div className="h-[430px] animate-pulse rounded-[32px] bg-black/5" />
          <div className="h-[430px] animate-pulse rounded-[32px] bg-black/5" />
        </div>
      </PageSection>
    )
  }

  if (errorMessage || !car) {
    return (
      <PageSection
        eyebrow="Car Detail"
        title="Vehicle not available"
        description="The selected vehicle could not be loaded from the backend."
      >
        <Card>
          <CardContent className="grid justify-items-start gap-3">
            <Badge>No Vehicle</Badge>
            <p className="m-0 text-stone-500">{errorMessage || 'Car not found.'}</p>
            <Link to="/cars" className={buttonVariants({ variant: 'outline' })}>
              <ArrowLeft className="size-4" />
              Back to Cars
            </Link>
          </CardContent>
        </Card>
      </PageSection>
    )
  }

  const isBookable = car.status === 'AVAILABLE'

  return (
    <PageSection
      eyebrow={`${car.countryCode} · ${car.city}`}
      title={car.name}
      description={car.description ?? `${car.brand} ${car.model} rental details.`}
    >
      <div className="grid gap-5">
        <Link
          to="/cars"
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-fit')}
        >
          <ArrowLeft className="size-4" />
          Back to results
        </Link>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.55fr)]">
          <div className="grid gap-5">
            <section className="relative min-h-[430px] overflow-hidden rounded-[34px] border border-black/10 bg-forest-900 shadow-[0_30px_80px_rgba(32,48,36,0.18)] max-md:min-h-[320px]">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={car.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,48,36,0.08),rgba(32,48,36,0.74))]" />
              <div className="absolute right-5 bottom-5 left-5 grid gap-3 text-sand-50">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/18 px-3 py-2 text-sm backdrop-blur">
                    {car.category}
                  </span>
                  <span className="rounded-full bg-white/18 px-3 py-2 text-sm backdrop-blur">
                    {car.transmission}
                  </span>
                  <span className="rounded-full bg-white/18 px-3 py-2 text-sm backdrop-blur">
                    {car.status}
                  </span>
                </div>
                <h2 className="m-0 font-(--font-heading) text-[clamp(2rem,4vw,3.3rem)] leading-none">
                  {car.brand} {car.model}
                </h2>
              </div>
            </section>

            {car.images.length > 1 ? (
              <section className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
                {car.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-28 overflow-hidden rounded-3xl border border-black/10 bg-black/5"
                  >
                    <img
                      src={image.url}
                      alt={`${car.name} ${image.sortOrder + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </section>
            ) : null}

            <section className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {[
                { icon: Users, label: 'Seats', value: `${car.seats} passengers` },
                { icon: Fuel, label: 'Fuel', value: car.fuelType },
                { icon: CarFront, label: 'Vehicle', value: `${car.year} ${car.category}` },
                { icon: MapPin, label: 'Pickup city', value: car.city },
              ].map((spec) => {
                const Icon = spec.icon
                return (
                  <Card key={spec.label}>
                    <CardContent className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-forest-700/10 text-forest-700">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="m-0 text-[0.84rem] text-stone-500">{spec.label}</p>
                        <strong>{spec.value}</strong>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </section>
          </div>

          <aside className="grid gap-4 self-start lg:sticky lg:top-28">
            <Card>
              <CardContent className="grid gap-5">
                <div>
                  <Badge variant={isBookable ? 'default' : 'muted'}>
                    {isBookable ? 'Ready to book' : 'Not bookable'}
                  </Badge>
                  <div className="mt-3">
                    <p className="m-0 font-(--font-heading) text-[2.1rem] leading-none">
                      {formatMoney(car.currencyCode, car.dailyRate)}
                      <span className="ml-1 text-base text-stone-500">/day</span>
                    </p>
                    <p className="m-0 text-stone-500">
                      {formatMoney(car.currencyCode, car.hourlyRate)} /hr
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label>
                    <FieldLabel>Pickup</FieldLabel>
                    <DateTimePicker
                      value={pickupAt}
                      onChange={(value) => updateSearchDate('pickupAt', value)}
                      placeholder="Pick pickup date"
                    />
                  </Label>
                  <Label>
                    <FieldLabel>Return</FieldLabel>
                    <DateTimePicker
                      value={returnAt}
                      onChange={(value) => updateSearchDate('returnAt', value)}
                      placeholder="Pick return date"
                    />
                  </Label>
                </div>

                <div className="grid gap-2 rounded-3xl border border-black/10 bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-stone-500">Rental days</span>
                    <strong>{rentalDays}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-stone-500">Options</span>
                    <strong>{formatMoney(car.currencyCode, optionsTotal)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
                    <span className="font-semibold">Estimated total</span>
                    <strong>{formatMoney(car.currencyCode, estimatedTotal)}</strong>
                  </div>
                </div>

                <Link
                  to={checkoutLink}
                  className={cn(buttonVariants(), !isBookable && 'pointer-events-none opacity-55')}
                >
                  Continue to Checkout
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-forest-700" />
                <h2 className="m-0 font-(--font-heading) text-[1.45rem]">
                  Add-ons
                </h2>
              </div>
              <div className="grid gap-3">
                {car.options.length > 0 ? (
                  car.options.map((option) => {
                    const isSelected = selectedOptionIds.includes(option.id)
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={cn(
                          'grid gap-1 rounded-3xl border p-4 text-left transition',
                          isSelected
                            ? 'border-forest-700/35 bg-forest-700/10'
                            : 'border-black/10 bg-white/58 hover:bg-white/78',
                        )}
                        onClick={() => toggleOption(option.id)}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <strong>{option.name}</strong>
                          <span>{formatMoney(car.currencyCode, option.pricePerDay)} /day</span>
                        </span>
                        {option.description ? (
                          <span className="text-sm text-stone-500">{option.description}</span>
                        ) : null}
                      </button>
                    )
                  })
                ) : (
                  <p className="m-0 text-stone-500">No optional add-ons for this vehicle.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-3">
                <Clock3 className="size-5 text-forest-700" />
                <h2 className="m-0 font-(--font-heading) text-[1.45rem]">
                  Pickup Hours
                </h2>
              </div>
              <div className="grid gap-2">
                {car.locationHours.map((hour) => (
                  <div
                    key={hour.dayOfWeek}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/58 px-4 py-3"
                  >
                    <span className="font-semibold">{dayNames[hour.dayOfWeek]}</span>
                    <span className="text-stone-500">
                      {hour.isClosed ? 'Closed' : `${hour.openTime} - ${hour.closeTime}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 rounded-3xl border border-black/10 bg-white/58 p-4">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <CalendarClock className="size-4" />
                  Rental rules
                </span>
                <p className="m-0 text-stone-500">
                  Book at least {car.minAdvanceBookingHr} hours ahead. Maximum rental
                  length is {car.maxBookingDays} days. A {car.bufferHours}-hour buffer is
                  reserved after each return.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageSection>
  )
}
