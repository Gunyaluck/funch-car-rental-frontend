import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Badge } from '../components/ui/badge'
import { buttonVariants } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { cn } from '../lib/utils'
import { getCarById } from '../features/cars/api'
import { BookingQuotePanel } from '../features/cars/BookingQuotePanel'
import { CarDetailHero } from '../features/cars/CarDetailHero'
import { CarImageStrip } from '../features/cars/CarImageStrip'
import { CarOptionsPanel } from '../features/cars/CarOptionsPanel'
import { CarSpecsGrid } from '../features/cars/CarSpecsGrid'
import { LocationHoursPanel } from '../features/cars/LocationHoursPanel'
import type { CarDetailItem } from '../features/cars/types'
import { buildCheckoutLink, estimateRentalDays } from '../features/cars/utils/car-detail-utils'

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
            <CarDetailHero car={car} coverImage={coverImage} />
            <CarImageStrip carName={car.name} images={car.images} />
            <CarSpecsGrid car={car} />
          </div>

          <BookingQuotePanel
            car={car}
            pickupAt={pickupAt}
            returnAt={returnAt}
            rentalDays={rentalDays}
            optionsTotal={optionsTotal}
            estimatedTotal={estimatedTotal}
            checkoutLink={checkoutLink}
            isBookable={car.status === 'AVAILABLE'}
            onDateChange={updateSearchDate}
          />
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <CarOptionsPanel
            car={car}
            selectedOptionIds={selectedOptionIds}
            onToggleOption={toggleOption}
          />
          <LocationHoursPanel car={car} />
        </section>
      </div>
    </PageSection>
  )
}
