import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { buttonVariants } from '../components/ui/button-variants'
import { Card, CardContent } from '../components/ui/card'
import { LoadingSpring } from '../components/ui/loading-spring'
import { cn } from '../lib/utils'
import { getCarById } from '../features/cars/api'
import { BookingQuotePanel } from '../features/cars/BookingQuotePanel'
import { CarDetailHero } from '../features/cars/CarDetailHero'
import { CarImageStrip } from '../features/cars/CarImageStrip'
import { CarOptionsPanel } from '../features/cars/CarOptionsPanel'
import { CarSpecsGrid } from '../features/cars/CarSpecsGrid'
import { LocationHoursPanel } from '../features/cars/LocationHoursPanel'
import type { CarDetailItem } from '../features/cars/types'
import { buildCheckoutLink } from '../features/cars/utils/car-detail-utils'
import { getApiErrorMessage, quotePricing } from '../features/pricing/api'
import type { PricingQuote } from '../features/pricing/types'

function getStoredCustomerCountryCode() {
  return window.localStorage.getItem('customerCountryCode') ?? 'TH'
}

export function CarDetailPage() {
  const { carId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [car, setCar] = useState<CarDetailItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
  const [quote, setQuote] = useState<PricingQuote | null>(null)
  const [isQuoteLoading, setIsQuoteLoading] = useState(false)
  const [quoteErrorMessage, setQuoteErrorMessage] = useState('')
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null)

  const pickupAt = searchParams.get('pickupAt') ?? ''
  const returnAt = searchParams.get('returnAt') ?? ''
  const customerCountryCode = getStoredCustomerCountryCode()
  const galleryImages = useMemo(
    () => [...(car?.images ?? [])].sort((left, right) => left.sortOrder - right.sortOrder),
    [car],
  )

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
              : 'Unable to load this vehicle right now.',
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

  const coverImage = car?.images.find((image) => image.isCover)?.url ?? car?.images[0]?.url
  const coverImageIndex = galleryImages.findIndex((image) => image.url === coverImage)
  const checkoutLink =
    quote && carId
      ? buildCheckoutLink({
          carId,
          pickupAt,
          returnAt,
          optionIds: selectedOptionIds,
        })
      : '/checkout'

  useEffect(() => {
    let isCurrent = true

    async function fetchQuote() {
      if (!carId || !car || car.status !== 'AVAILABLE' || !pickupAt || !returnAt) {
        setQuote(null)
        setQuoteErrorMessage('')
        setIsQuoteLoading(false)
        return
      }

      setIsQuoteLoading(true)
      setQuoteErrorMessage('')

      try {
        const result = await quotePricing({
          carId,
          pickupAt,
          returnAt,
          optionIds: selectedOptionIds,
        })

        if (isCurrent) {
          setQuote(result)
        }
      } catch (error) {
        if (isCurrent) {
          setQuote(null)
          setQuoteErrorMessage(
            getApiErrorMessage(error, 'Unable to calculate this booking quote.'),
          )
        }
      } finally {
        if (isCurrent) {
          setIsQuoteLoading(false)
        }
      }
    }

    fetchQuote()

    return () => {
      isCurrent = false
    }
  }, [car, carId, pickupAt, returnAt, selectedOptionIds])

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

  function openGallery(index: number) {
    if (galleryImages.length === 0) {
      return
    }

    setActiveGalleryIndex(index)
  }

  function closeGallery() {
    setActiveGalleryIndex(null)
  }

  function showPreviousImage() {
    if (galleryImages.length <= 1) {
      return
    }

    setActiveGalleryIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex
      }

      return (currentIndex - 1 + galleryImages.length) % galleryImages.length
    })
  }

  function showNextImage() {
    if (galleryImages.length <= 1) {
      return
    }

    setActiveGalleryIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex
      }

      return (currentIndex + 1) % galleryImages.length
    })
  }

  useEffect(() => {
    if (activeGalleryIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeGallery()
      } else if (event.key === 'ArrowLeft') {
        showPreviousImage()
      } else if (event.key === 'ArrowRight') {
        showNextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeGalleryIndex, galleryImages.length])

  if (isLoading) {
    return (
      <PageSection
        eyebrow="Car Detail"
        title="Loading vehicle details"
        description="Preparing the selected vehicle details."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <div className="grid h-[430px] place-items-center rounded-[32px] bg-black/5">
            <LoadingSpring label="Loading vehicle" />
          </div>
          <div className="grid h-[430px] place-items-center rounded-[32px] bg-black/5">
            <LoadingSpring label="Preparing quote" />
          </div>
        </div>
      </PageSection>
    )
  }

  if (errorMessage || !car) {
    return (
      <PageSection
        eyebrow="Car Detail"
        title="Vehicle not available"
        description="The selected vehicle could not be loaded right now."
      >
        <Card>
          <CardContent className="grid justify-items-start gap-3">
            <Badge variant="danger">No Vehicle</Badge>
            <Alert title="Vehicle could not be loaded">
              {errorMessage || 'Car not found.'}
            </Alert>
            <Link to="/cars" className={buttonVariants({ variant: 'outline' })}>
              <ArrowLeft className="size-4" />
              Back to car list
            </Link>
          </CardContent>
        </Card>
      </PageSection>
    )
  }

  return (
    <PageSection
      title={car.name}
      description={car.description ?? `${car.brand} ${car.model} rental details.`}
    >
      <div className="grid gap-5">
        <Link
          to="/cars"
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-fit')}
        >
          <ArrowLeft className="size-4" />
          Back to car list
        </Link>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.55fr)]">
          <div className="grid gap-5">
            <CarDetailHero
              car={car}
              coverImage={coverImage}
              onOpenGallery={() => openGallery(coverImageIndex >= 0 ? coverImageIndex : 0)}
            />
            <CarImageStrip
              carName={car.name}
              images={galleryImages}
              onSelectImage={openGallery}
            />
            <CarSpecsGrid car={car} />
          </div>

          <BookingQuotePanel
            car={car}
            pickupAt={pickupAt}
            returnAt={returnAt}
            quote={quote}
            isQuoteLoading={isQuoteLoading}
            quoteErrorMessage={quoteErrorMessage}
            checkoutLink={checkoutLink}
            isBookable={car.status === 'AVAILABLE'}
            customerCountryCode={customerCountryCode}
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
      {activeGalleryIndex !== null && galleryImages[activeGalleryIndex]
        ? createPortal(
            <div
              className="fixed inset-0 z-50 bg-black/92 px-4 py-4 md:px-8"
              onClick={closeGallery}
            >
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-center justify-between text-sand-50">
                  <div className="text-sm font-medium text-sand-50/75">
                    {activeGalleryIndex + 1} / {galleryImages.length}
                  </div>
                  <button
                    type="button"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-white/18 bg-white/10 transition hover:bg-white/16"
                    onClick={closeGallery}
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-sand-50 transition hover:bg-white/16 disabled:opacity-40"
                    onClick={(event) => {
                      event.stopPropagation()
                      showPreviousImage()
                    }}
                    disabled={galleryImages.length <= 1}
                  >
                    <ChevronLeft className="size-5" />
                  </button>

                  <div
                    className="flex min-h-0 items-center justify-center"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <img
                      src={galleryImages[activeGalleryIndex].url}
                      alt={`${car.name} ${activeGalleryIndex + 1}`}
                      className="max-h-full max-w-full rounded-[28px] object-contain shadow-[0_22px_70px_rgba(0,0,0,0.35)]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-sand-50 transition hover:bg-white/16 disabled:opacity-40"
                    onClick={(event) => {
                      event.stopPropagation()
                      showNextImage()
                    }}
                    disabled={galleryImages.length <= 1}
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>

                {galleryImages.length > 1 ? (
                  <div
                    className="flex gap-3 overflow-x-auto pb-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {galleryImages.map((image, index) => {
                      const isActive = index === activeGalleryIndex

                      return (
                        <button
                          type="button"
                          key={image.id}
                          className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border transition ${
                            isActive
                              ? 'border-white shadow-[0_0_0_2px_rgba(255,255,255,0.2)]'
                              : 'border-white/12 opacity-75 hover:opacity-100'
                          }`}
                          onClick={() => setActiveGalleryIndex(index)}
                        >
                          <img
                            src={image.url}
                            alt={`${car.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </PageSection>
  )
}
