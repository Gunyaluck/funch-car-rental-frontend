import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageSection } from '../../components/PageSection'
import { Alert } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { AdminCarForm } from '../../features/cars/AdminCarForm'
import { getCarById } from '../../features/cars/api'
import type { CarDetailItem, CreateCarPayload } from '../../features/cars/types'

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function mapCarDetailToPayload(car: CarDetailItem): CreateCarPayload {
  return {
    name: car.name,
    brand: car.brand,
    model: car.model,
    year: car.year,
    category: car.category,
    countryCode: car.countryCode,
    city: car.city,
    timezone: car.timezone,
    currencyCode: car.currencyCode,
    hourlyRate: car.hourlyRate,
    dailyRate: car.dailyRate,
    seats: car.seats,
    transmission: car.transmission,
    fuelType: car.fuelType,
    description: car.description ?? '',
    status: car.status,
    is24Hours: car.is24Hours,
    minAdvanceBookingHr: car.minAdvanceBookingHr,
    maxBookingDays: car.maxBookingDays,
    bufferHours: car.bufferHours,
    images: car.images.map((image, index) => ({
      url: image.url,
      sortOrder: image.sortOrder ?? index,
      isCover: image.isCover,
    })),
    options: car.options.map((option) => ({
      name: option.name,
      pricePerDay: option.pricePerDay,
      description: option.description ?? '',
    })),
    locationHours:
      car.locationHours.length > 0
        ? [...car.locationHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        : Array.from({ length: 7 }, (_, index) => ({
            dayOfWeek: index,
            openTime: '08:00',
            closeTime: '20:00',
            isClosed: false,
          })),
  }
}

export function AdminEditCarPage() {
  const navigate = useNavigate()
  const { carId } = useParams()
  const [car, setCar] = useState<CarDetailItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function fetchCar() {
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
          setErrorMessage(getApiErrorMessage(error, 'Unable to load this car for editing.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    fetchCar()

    return () => {
      isCurrent = false
    }
  }, [carId])

  return (
    <PageSection
      title="Edit rental car"
      description="Update the selected fleet entry and save the changes back to the catalog."
    >
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

        {!isLoading && car && carId ? (
          <AdminCarForm
            mode="edit"
            carId={carId}
            initialValues={mapCarDetailToPayload(car)}
            onSubmitted={() => navigate('/admin/cars')}
          />
        ) : null}
      </div>
    </PageSection>
  )
}
