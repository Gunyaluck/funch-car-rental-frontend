import { Image as ImageIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageSection } from '../../components/PageSection'
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableContainer,
  AdminDataTableHead,
  AdminDataTableHeaderCell,
  AdminDataTableRow,
} from '../../components/ui/admin-data-table'
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
import { listCars } from '../../features/cars/api'
import { defaultCarFilters } from '../../features/cars/constants'
import type { CarCategory, CarListItem } from '../../features/cars/types'
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

function getStatusBadgeVariant(status: CarListItem['status']) {
  if (status === 'AVAILABLE') {
    return 'success' as const
  }

  if (status === 'MAINTENANCE') {
    return 'danger' as const
  }

  return 'muted' as const
}

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function AdminCarsPage() {
  const navigate = useNavigate()
  const [cars, setCars] = useState<CarListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CarCategory | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<CarListItem['status'] | 'ALL'>('ALL')

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

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-semibold">Fleet list</h2>
              <p className="m-0 text-stone-500">
                Showing {filteredCars.length} of {cars.length} cars. Click a row to open details.
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

          {!isLoading && filteredCars.length > 0 ? (
            <AdminDataTableContainer>
              <AdminDataTable>
                <AdminDataTableHead>
                  <tr>
                    <AdminDataTableHeaderCell>Car</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Location</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Rate</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Status</AdminDataTableHeaderCell>
                  </tr>
                </AdminDataTableHead>
                <AdminDataTableBody>
                  {filteredCars.map((car) => (
                    <AdminDataTableRow
                      key={car.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/cars/${car.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/admin/cars/${car.id}`)
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      <AdminDataTableCell className="min-w-[240px]">
                        <div className="flex items-start gap-3">
                          {car.coverImage ? (
                            <img
                              src={car.coverImage}
                              alt={car.name}
                              className="h-16 w-20 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="grid h-16 w-20 place-items-center rounded-2xl bg-black/5 text-stone-400">
                              <ImageIcon className="size-5" />
                            </div>
                          )}

                          <div className="grid gap-2">
                            <div className="font-semibold text-forest-900">{car.name}</div>
                            <div className="text-sm text-stone-500">
                              {car.brand} {car.model} · {car.year}
                            </div>
                          </div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>
                        <div className="grid gap-1">
                          <div>
                            {car.city}, {car.countryCode}
                          </div>
                          <div className="text-sm text-stone-500">
                            {car.category} · {car.transmission}
                          </div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>
                        <div className="grid gap-1">
                          <div>{formatMoney(car.currencyCode, car.dailyRate)} / day</div>
                          <div className="text-sm text-stone-500">
                            {formatMoney(car.currencyCode, car.hourlyRate)} / hr
                          </div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell className="min-w-[180px]">
                        <div className="grid gap-2">
                          <Badge variant={getStatusBadgeVariant(car.status)}>{car.status}</Badge>
                          {car.isAvailable === false ? (
                            <Badge variant="danger">Schedule blocked</Badge>
                          ) : (
                            <span className="text-sm text-stone-500">Bookable</span>
                          )}
                        </div>
                      </AdminDataTableCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
            </AdminDataTableContainer>
          ) : null}
        </div>
      </div>
    </PageSection>
  )
}
