import { Gauge, Image as ImageIcon, MapPin, Settings2, ShieldCheck, Wrench } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageSection } from '../../components/PageSection'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { buttonVariants } from '../../components/ui/button-variants'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { getCarById, listCars, updateAdminCarStatus } from '../../features/cars/api'
import { defaultCarFilters } from '../../features/cars/constants'
import type { CarCategory, CarDetailItem, CarListItem } from '../../features/cars/types'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'

const CATEGORY_OPTIONS: Array<CarCategory | 'ALL'> = [
  'ALL',
  'SEDAN',
  'SUV',
  'VAN',
  'TRUCK',
  'SPORTS',
  'LUXURY',
  'ELECTRIC',
]

const STATUS_OPTIONS: Array<CarListItem['status'] | 'ALL'> = [
  'ALL',
  'AVAILABLE',
  'MAINTENANCE',
  'RETIRED',
]

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

export function AdminCarsPage() {
  const [cars, setCars] = useState<CarListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CarCategory | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<CarListItem['status'] | 'ALL'>('ALL')
  const [selectedCarId, setSelectedCarId] = useState('')
  const [selectedCar, setSelectedCar] = useState<CarDetailItem | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailErrorMessage, setDetailErrorMessage] = useState('')
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)

  async function handleStatusChange(nextStatus: CarListItem['status']) {
    if (!selectedCar) {
      return
    }

    setIsStatusUpdating(true)
    setDetailErrorMessage('')

    try {
      const updatedCar = await updateAdminCarStatus(selectedCar.id, nextStatus)

      setSelectedCar(updatedCar)
      setCars((currentCars) =>
        currentCars.map((car) =>
          car.id === updatedCar.id
            ? {
                ...car,
                status: updatedCar.status,
                coverImage: updatedCar.images.find((image) => image.isCover)?.url ?? updatedCar.images[0]?.url ?? car.coverImage ?? null,
                isAvailable: updatedCar.status === 'AVAILABLE',
              }
            : car,
        ),
      )
    } catch (error) {
      setDetailErrorMessage(getApiErrorMessage(error, 'Unable to update the car status right now.'))
    } finally {
      setIsStatusUpdating(false)
    }
  }

  useEffect(() => {
    let isCurrent = true

    async function fetchCars() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await listCars(defaultCarFilters, 100)

        if (!isCurrent) {
          return
        }

        setCars(result.data)
        setSelectedCarId((currentId) => currentId || result.data[0]?.id || '')
      } catch (error) {
        if (!isCurrent) {
          return
        }

        setCars([])
        setErrorMessage(getApiErrorMessage(error, 'Unable to load the fleet right now.'))
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    fetchCars()

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function fetchCarDetail() {
      if (!selectedCarId) {
        setSelectedCar(null)
        setDetailErrorMessage('')
        setIsDetailLoading(false)
        return
      }

      setIsDetailLoading(true)
      setDetailErrorMessage('')

      try {
        const result = await getCarById(selectedCarId)

        if (isCurrent) {
          setSelectedCar(result)
        }
      } catch (error) {
        if (isCurrent) {
          setSelectedCar(null)
          setDetailErrorMessage(
            getApiErrorMessage(error, 'Unable to load the selected car details.'),
          )
        }
      } finally {
        if (isCurrent) {
          setIsDetailLoading(false)
        }
      }
    }

    fetchCarDetail()

    return () => {
      isCurrent = false
    }
  }, [selectedCarId])

  const filteredCars = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return cars
      .filter((car) => {
        if (categoryFilter !== 'ALL' && car.category !== categoryFilter) {
          return false
        }

        if (statusFilter !== 'ALL' && car.status !== statusFilter) {
          return false
        }

        if (!normalizedSearch) {
          return true
        }

        return [
          car.name,
          car.brand,
          car.model,
          car.city,
          car.countryCode,
          car.category,
          car.transmission,
          car.fuelType,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [cars, categoryFilter, searchTerm, statusFilter])

  useEffect(() => {
    if (filteredCars.length === 0) {
      return
    }

    if (!filteredCars.some((car) => car.id === selectedCarId)) {
      setSelectedCarId(filteredCars[0].id)
    }
  }, [filteredCars, selectedCarId])

  const availableCount = cars.filter((car) => car.status === 'AVAILABLE').length
  const maintenanceCount = cars.filter((car) => car.status === 'MAINTENANCE').length
  const retiredCount = cars.filter((car) => car.status === 'RETIRED').length

  return (
    <PageSection
      title="Fleet review and catalog control"
      description="Review live fleet data, inspect car details, and move to dedicated create flows when you need to add inventory."
    >
      <div className="grid gap-5">
        {errorMessage ? <Alert title="Fleet unavailable">{errorMessage}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="grid gap-2">
              <Badge variant="success">Available</Badge>
              <strong className="text-3xl leading-none">{availableCount}</strong>
              <span className="text-sm text-stone-500">Cars ready for booking right now.</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2">
              <Badge variant="danger">Maintenance</Badge>
              <strong className="text-3xl leading-none">{maintenanceCount}</strong>
              <span className="text-sm text-stone-500">Units blocked for service or repair.</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2">
              <Badge variant="muted">Retired</Badge>
              <strong className="text-3xl leading-none">{retiredCount}</strong>
              <span className="text-sm text-stone-500">Cars kept in the archive or off-fleet.</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-2">
                <h2 className="m-0 text-xl font-semibold">Catalog review</h2>
                <p className="m-0 text-stone-500">
                  Search the fleet and narrow the view before opening a detailed car profile.
                </p>
              </div>

              <Link to="/admin/cars/create" className={buttonVariants()}>
                Create car
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by car name, brand, model, city, category, or fuel type"
              />

              <label className="grid gap-1 text-sm text-stone-500">
                <span className="font-semibold">Category</span>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as CarCategory | 'ALL')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === 'ALL' ? 'All categories' : option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="grid gap-1 text-sm text-stone-500">
                <span className="font-semibold">Status</span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as CarListItem['status'] | 'ALL')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === 'ALL' ? 'All statuses' : option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  className={buttonVariants({ variant: 'outline' })}
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('ALL')
                    setStatusFilter('ALL')
                  }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-xl font-semibold">Fleet list</h2>
                <p className="m-0 text-stone-500">
                  Showing {filteredCars.length} of {cars.length} cars
                </p>
              </div>
              <Badge variant="muted">{isLoading ? 'Loading' : `${filteredCars.length} results`}</Badge>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="grid min-h-[240px] place-items-center text-stone-500">
                  Loading fleet data...
                </CardContent>
              </Card>
            ) : null}

            {!isLoading && filteredCars.length === 0 ? (
              <Card>
                <CardContent className="grid gap-2">
                  <Badge variant="muted">No results</Badge>
                  <h3 className="m-0 text-lg font-semibold">No cars match these filters</h3>
                  <p className="m-0 text-stone-500">
                    Clear one of the filters or try a broader search term.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-4">
              {filteredCars.map((car) => {
                const isSelected = car.id === selectedCarId

                return (
                  <button
                    key={car.id}
                    type="button"
                    className={`text-left ${isSelected ? 'translate-y-[-1px]' : ''}`}
                    onClick={() => setSelectedCarId(car.id)}
                  >
                    <Card
                      className={
                        isSelected
                          ? 'border-forest-700/25 shadow-[0_20px_60px_rgba(32,48,36,0.12)]'
                          : undefined
                      }
                    >
                      <CardContent className="grid gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="grid gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={getStatusBadgeVariant(car.status)}>{car.status}</Badge>
                              {car.isAvailable === false ? (
                                <Badge variant="danger">Schedule blocked</Badge>
                              ) : null}
                            </div>
                            <h3 className="m-0 text-xl font-semibold">{car.name}</h3>
                            <p className="m-0 text-stone-500">
                              {car.brand} {car.model} · {car.year}
                            </p>
                          </div>

                          {car.coverImage ? (
                            <img
                              src={car.coverImage}
                              alt={car.name}
                              className="h-20 w-28 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="grid h-20 w-28 place-items-center rounded-2xl bg-black/5 text-stone-400">
                              <ImageIcon className="size-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="chip">{car.category}</Badge>
                          <Badge variant="chip">{car.transmission}</Badge>
                          <Badge variant="chip">{car.seats} seats</Badge>
                          <Badge variant="chip">{car.fuelType}</Badge>
                        </div>

                        <div className="grid gap-3 text-sm text-stone-500 md:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4" />
                            <span>
                              {car.city}, {car.countryCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className="size-4" />
                            <span>{formatMoney(car.currencyCode, car.hourlyRate)} / hr</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4" />
                            <span>{formatMoney(car.currencyCode, car.dailyRate)} / day</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 self-start xl:sticky xl:top-6">
            <div>
              <h2 className="m-0 text-xl font-semibold">Car profile</h2>
              <p className="m-0 text-stone-500">Inspect, edit, and manage availability for the selected car.</p>
            </div>

            {isDetailLoading ? (
              <Card>
                <CardContent className="grid min-h-[320px] place-items-center text-stone-500">
                  Loading car details...
                </CardContent>
              </Card>
            ) : null}

            {!isDetailLoading && detailErrorMessage ? (
              <Alert title="Car detail unavailable">{detailErrorMessage}</Alert>
            ) : null}

            {!isDetailLoading && !detailErrorMessage && !selectedCar ? (
              <Card>
                <CardContent className="grid min-h-[320px] place-items-center text-center text-stone-500">
                  Choose a car from the list to open its detail profile.
                </CardContent>
              </Card>
            ) : null}

            {!isDetailLoading && selectedCar ? (
              <>
                <Card className="overflow-hidden">
                  <div className="relative min-h-[220px] bg-[linear-gradient(135deg,rgba(35,88,63,0.12),rgba(255,255,255,0.4))]">
                    {selectedCar.images[0]?.url ? (
                      <img
                        src={selectedCar.images[0].url}
                        alt={selectedCar.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,249,243,0.15),rgba(32,48,36,0.58))]" />
                    <div className="absolute right-4 bottom-4 left-4 grid gap-2 text-sand-50">
                      <Badge variant={getStatusBadgeVariant(selectedCar.status)}>
                        {selectedCar.status}
                      </Badge>
                      <h3 className="m-0 text-2xl font-semibold">{selectedCar.name}</h3>
                      <p className="m-0 text-sand-50/75">
                        {selectedCar.brand} {selectedCar.model} · {selectedCar.year}
                      </p>
                    </div>
                  </div>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/60 p-4">
                        <span className="block text-sm font-semibold text-stone-500">Pricing</span>
                        <strong>{formatMoney(selectedCar.currencyCode, selectedCar.hourlyRate)} / hr</strong>
                        <p className="m-0 text-stone-500">
                          {formatMoney(selectedCar.currencyCode, selectedCar.dailyRate)} / day
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/60 p-4">
                        <span className="block text-sm font-semibold text-stone-500">Booking rules</span>
                        <strong>{selectedCar.minAdvanceBookingHr} hr minimum advance</strong>
                        <p className="m-0 text-stone-500">
                          Max {selectedCar.maxBookingDays} days · Buffer {selectedCar.bufferHours} hr
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="chip">{selectedCar.category}</Badge>
                      <Badge variant="chip">{selectedCar.transmission}</Badge>
                      <Badge variant="chip">{selectedCar.seats} seats</Badge>
                      <Badge variant="chip">{selectedCar.fuelType}</Badge>
                      <Badge variant="chip">{selectedCar.timezone}</Badge>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                        <MapPin className="mt-0.5 size-4 text-stone-500" />
                        <div>
                          <strong className="block">Location</strong>
                          <span className="text-stone-500">
                            {selectedCar.city}, {selectedCar.countryCode}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                        <Settings2 className="mt-0.5 size-4 text-stone-500" />
                        <div>
                          <strong className="block">Options</strong>
                          <span className="text-stone-500">
                            {selectedCar.options.length} add-ons configured
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                        <Wrench className="mt-0.5 size-4 text-stone-500" />
                        <div>
                          <strong className="block">Operating hours</strong>
                          <span className="text-stone-500">{formatLocationHours(selectedCar)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 rounded-2xl bg-white/60 p-4">
                      <strong>Description</strong>
                      <p className="m-0 text-stone-500">
                        {selectedCar.description ?? 'No description has been added yet.'}
                      </p>
                    </div>

                    <div className="grid gap-2 rounded-2xl bg-white/60 p-4">
                      <strong>Gallery and options</strong>
                      <p className="m-0 text-sm text-stone-500">
                        {selectedCar.images.length} images · {selectedCar.options.length} options
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <div className="flex flex-wrap justify-end gap-2">
                        {selectedCar.status !== 'AVAILABLE' ? (
                          <button
                            type="button"
                            className={buttonVariants({ variant: 'outline' })}
                            disabled={isStatusUpdating}
                            onClick={() => void handleStatusChange('AVAILABLE')}
                          >
                            {isStatusUpdating ? 'Updating...' : 'Restore availability'}
                          </button>
                        ) : null}
                        {selectedCar.status !== 'MAINTENANCE' ? (
                          <button
                            type="button"
                            className={buttonVariants({ variant: 'outline' })}
                            disabled={isStatusUpdating}
                            onClick={() => void handleStatusChange('MAINTENANCE')}
                          >
                            {isStatusUpdating ? 'Updating...' : 'Mark maintenance'}
                          </button>
                        ) : null}
                        {selectedCar.status !== 'RETIRED' ? (
                          <button
                            type="button"
                            className={buttonVariants({ variant: 'outline' })}
                            disabled={isStatusUpdating}
                            onClick={() => void handleStatusChange('RETIRED')}
                          >
                            {isStatusUpdating ? 'Updating...' : 'Retire car'}
                          </button>
                        ) : null}
                        <Link
                          to={`/admin/cars/${selectedCar.id}/edit`}
                          className={buttonVariants({ variant: 'outline' })}
                        >
                          Edit car
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </>
            ) : null}
          </div>
        </div>
      </div>
    </PageSection>
  )
}
