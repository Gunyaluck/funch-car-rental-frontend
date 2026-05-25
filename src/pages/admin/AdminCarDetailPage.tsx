import { MapPin, Settings2, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { buttonVariants } from '../../components/ui/button-variants'
import { Card, CardContent } from '../../components/ui/card'
import { getCarById, updateAdminCarStatus } from '../../features/cars/api'
import type { CarDetailItem, CarListItem } from '../../features/cars/types'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function getStatusBadgeVariant(status: CarListItem['status']) {
  if (status === 'AVAILABLE') {
    return 'success' as const
  }

  if (status === 'MAINTENANCE') {
    return 'danger' as const
  }

  return 'muted' as const
}

function formatLocationHours(car: CarDetailItem) {
  const openDays = car.locationHours.filter((item) => !item.isClosed)

  if (car.is24Hours) {
    return '24 hours'
  }

  if (openDays.length === 0) {
    return 'No schedule'
  }

  return `${openDays.length} open days`
}

export function AdminCarDetailPage() {
  const navigate = useNavigate()
  const { carId } = useParams()
  const [car, setCar] = useState<CarDetailItem | null>(null)
  const [selectedCarImageUrl, setSelectedCarImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadCar() {
      if (!carId) {
        setErrorMessage('Missing car id.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await getCarById(carId)

        if (!isCurrent) {
          return
        }

        setCar(result)
        setSelectedCarImageUrl(
          result.images.find((image) => image.isCover)?.url ?? result.images[0]?.url ?? '',
        )
      } catch (error) {
        if (isCurrent) {
          setCar(null)
          setSelectedCarImageUrl('')
          setErrorMessage(getApiErrorMessage(error, 'Unable to load this car.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadCar()

    return () => {
      isCurrent = false
    }
  }, [carId])

  async function handleStatusChange(nextStatus: CarListItem['status']) {
    if (!car) {
      return
    }

    setIsStatusUpdating(true)
    setErrorMessage('')

    try {
      const updatedCar = await updateAdminCarStatus(car.id, nextStatus)
      setCar(updatedCar)
      setSelectedCarImageUrl(
        updatedCar.images.find((image) => image.isCover)?.url ?? updatedCar.images[0]?.url ?? '',
      )
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to update the car status right now.'))
    } finally {
      setIsStatusUpdating(false)
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/cars')}>
          Back to cars
        </Button>
      </div>

      {errorMessage ? <Alert title="Car unavailable">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Card>
          <CardContent className="grid min-h-[220px] place-items-center text-stone-500">
            Loading car details...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && car ? (
        <Card className="overflow-hidden">
          <div className="relative min-h-[220px] bg-[linear-gradient(135deg,rgba(35,88,63,0.12),rgba(255,255,255,0.4))]">
            {selectedCarImageUrl ? (
              <img
                src={selectedCarImageUrl}
                alt={car.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,249,243,0.15),rgba(32,48,36,0.58))]" />
            <div className="absolute right-4 bottom-4 left-4 grid gap-2 text-sand-50">
              <Badge variant={getStatusBadgeVariant(car.status)}>{car.status}</Badge>
              <h1 className="m-0 text-2xl font-semibold">{car.name}</h1>
              <p className="m-0 text-sand-50/75">
                {car.brand} {car.model} · {car.year}
              </p>
            </div>
          </div>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Pricing</span>
                <strong>{formatMoney(car.currencyCode, car.hourlyRate)} / hr</strong>
                <p className="m-0 text-stone-500">
                  {formatMoney(car.currencyCode, car.dailyRate)} / day
                </p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Booking rules</span>
                <strong>{car.minAdvanceBookingHr} hr minimum advance</strong>
                <p className="m-0 text-stone-500">
                  Max {car.maxBookingDays} days · Buffer {car.bufferHours} hr
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="chip">{car.category}</Badge>
              <Badge variant="chip">{car.transmission}</Badge>
              <Badge variant="chip">{car.seats} seats</Badge>
              <Badge variant="chip">{car.fuelType}</Badge>
              <Badge variant="chip">{car.timezone}</Badge>
            </div>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <MapPin className="mt-0.5 size-4 text-stone-500" />
                <div>
                  <strong className="block">Location</strong>
                  <span className="text-stone-500">
                    {car.city}, {car.countryCode}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <Settings2 className="mt-0.5 size-4 text-stone-500" />
                <div>
                  <strong className="block">Options</strong>
                  <span className="text-stone-500">{car.options.length} add-ons configured</span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <Wrench className="mt-0.5 size-4 text-stone-500" />
                <div>
                  <strong className="block">Operating hours</strong>
                  <span className="text-stone-500">{formatLocationHours(car)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 rounded-2xl bg-white/60 p-4">
              <strong>Description</strong>
              <p className="m-0 text-stone-500">
                {car.description ?? 'No description has been added yet.'}
              </p>
            </div>

            <div className="grid gap-2 rounded-2xl bg-white/60 p-4">
              <strong>Gallery and options</strong>
              <p className="m-0 text-sm text-stone-500">
                {car.images.length} images · {car.options.length} options
              </p>
              {car.images.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {car.images.map((image, index) => {
                    const isActive = image.url === selectedCarImageUrl

                    return (
                      <button
                        key={image.id}
                        type="button"
                        className={`overflow-hidden rounded-2xl border text-left transition ${
                          isActive
                            ? 'border-forest-700/35 shadow-[0_10px_28px_rgba(32,48,36,0.12)]'
                            : 'border-black/8 hover:-translate-y-px'
                        }`}
                        onClick={() => setSelectedCarImageUrl(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={`${car.name} ${index + 1}`}
                          className="h-28 w-full object-cover"
                        />
                        <div className="flex items-center justify-between gap-3 bg-white/80 px-3 py-2 text-sm text-stone-600">
                          <span>{image.isCover ? 'Cover image' : `Gallery image ${index + 1}`}</span>
                          {isActive ? <Badge variant="chip">Previewing</Badge> : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end">
              <div className="flex flex-wrap justify-end gap-2">
                {car.status !== 'AVAILABLE' ? (
                  <button
                    type="button"
                    className={buttonVariants({ variant: 'outline' })}
                    disabled={isStatusUpdating}
                    onClick={() => void handleStatusChange('AVAILABLE')}
                  >
                    {isStatusUpdating ? 'Updating...' : 'Restore availability'}
                  </button>
                ) : null}
                {car.status !== 'MAINTENANCE' ? (
                  <button
                    type="button"
                    className={buttonVariants({ variant: 'outline' })}
                    disabled={isStatusUpdating}
                    onClick={() => void handleStatusChange('MAINTENANCE')}
                  >
                    {isStatusUpdating ? 'Updating...' : 'Mark maintenance'}
                  </button>
                ) : null}
                {car.status !== 'RETIRED' ? (
                  <button
                    type="button"
                    className={buttonVariants({ variant: 'outline' })}
                    disabled={isStatusUpdating}
                    onClick={() => void handleStatusChange('RETIRED')}
                  >
                    {isStatusUpdating ? 'Updating...' : 'Retire car'}
                  </button>
                ) : null}
                <Link to={`/admin/cars/${car.id}/edit`} className={buttonVariants({ variant: 'outline' })}>
                  Edit car
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
