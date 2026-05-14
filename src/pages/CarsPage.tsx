import { Search } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { DateTimePicker } from '../components/ui/date-time-picker'
import { FieldLabel, Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { CarCard } from '../features/cars/CarCard'
import {
  carFilterOptions,
  defaultCarFilters,
  filterCars,
  mockCars,
} from '../features/cars/mock'
import type { CarFilters } from '../features/cars/types'

const EMPTY_SELECT_VALUE = '__all__'

function filtersFromSearchParams(searchParams: URLSearchParams): CarFilters {
  return {
    countryCode: searchParams.get('countryCode') ?? defaultCarFilters.countryCode,
    city: searchParams.get('city') ?? defaultCarFilters.city,
    category: searchParams.get('category') ?? defaultCarFilters.category,
    transmission:
      searchParams.get('transmission') ?? defaultCarFilters.transmission,
    seats: searchParams.get('seats') ?? defaultCarFilters.seats,
    pickupAt: searchParams.get('pickupAt') ?? defaultCarFilters.pickupAt,
    returnAt: searchParams.get('returnAt') ?? defaultCarFilters.returnAt,
  }
}

function selectValue(value: string) {
  return value || EMPTY_SELECT_VALUE
}

function optionItems(items: string[], suffix = '') {
  return items.map((item) => ({
    value: item,
    label: suffix ? `${item} ${suffix}` : item,
  }))
}

export function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  )
  const [draftFilters, setDraftFilters] = useState<CarFilters>(filters)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const filteredCars = useMemo(() => filterCars(mockCars, filters), [filters])
  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const pendingFilterCount = Object.values(draftFilters).filter(Boolean).length
  const hasPendingChanges = useMemo(() => {
    const filterKeys = Object.keys(defaultCarFilters) as Array<keyof CarFilters>
    return filterKeys.some((key) => filters[key] !== draftFilters[key])
  }, [draftFilters, filters])

  const countryItems = carFilterOptions.countries.map((country) => ({
    value: country.code,
    label: country.name,
  }))
  const cityItems = optionItems(carFilterOptions.cities)
  const categoryItems = optionItems(carFilterOptions.categories)
  const transmissionItems = optionItems(carFilterOptions.transmissions)
  const seatItems = optionItems(carFilterOptions.seats, 'seats')

  function updateDraftFilter(name: keyof CarFilters, value: string) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value === EMPTY_SELECT_VALUE ? '' : value,
    }))
  }

  function applyFilters() {
    const nextParams = new URLSearchParams()

    Object.entries(draftFilters).forEach(([name, value]) => {
      if (value) {
        nextParams.set(name, value)
      }
    })

    setSearchParams(nextParams)
  }

  function resetFilters() {
    setDraftFilters(defaultCarFilters)
    setSearchParams({})
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    applyFilters()
  }

  function renderSelectItems(items: Array<{ value: string; label: string }>) {
    return items.map((item) => (
      <SelectItem key={item.value} value={item.value}>
        {item.label}
      </SelectItem>
    ))
  }

  return (
    <PageSection
      eyebrow="Cars"
      title="Find cars by destination, schedule, and travel fit"
      description="This listing page is now wired for country-first search, URL-synced filters, and result cards that can later switch from mock data to GET /cars without changing the page contract."
    >
      <div className="grid gap-6">
        <Card>
          <CardContent>
            <form onSubmit={handleFilterSubmit}>
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                <div>
                  <Badge className="mb-2.5">Search Filters</Badge>
                  <h2 className="m-0 font-(--font-heading) text-[1.35rem]">
                    Search inventory across destinations
                  </h2>
                  <p className="m-0 text-stone-500">
                    Choose filters first, then run the search when the criteria are ready.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button type="submit">
                    <Search className="size-4" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-12 gap-3.5">
                <Label className="col-span-12 md:col-span-6 xl:col-span-3">
                  <FieldLabel>Country</FieldLabel>
                  <Select
                    value={selectValue(draftFilters.countryCode)}
                    onValueChange={(value) => updateDraftFilter('countryCode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All destinations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>All destinations</SelectItem>
                      {renderSelectItems(countryItems)}
                    </SelectContent>
                  </Select>
                </Label>

                <Label className="col-span-12 md:col-span-6 xl:col-span-3">
                  <FieldLabel>City</FieldLabel>
                  <Select
                    value={selectValue(draftFilters.city)}
                    onValueChange={(value) => updateDraftFilter('city', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>All cities</SelectItem>
                      {renderSelectItems(cityItems)}
                    </SelectContent>
                  </Select>
                </Label>

                <Label className="col-span-12 md:col-span-6 xl:col-span-3">
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={selectValue(draftFilters.category)}
                    onValueChange={(value) => updateDraftFilter('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>All categories</SelectItem>
                      {renderSelectItems(categoryItems)}
                    </SelectContent>
                  </Select>
                </Label>

                <Label className="col-span-12 md:col-span-6 xl:col-span-3">
                  <FieldLabel>Transmission</FieldLabel>
                  <Select
                    value={selectValue(draftFilters.transmission)}
                    onValueChange={(value) => updateDraftFilter('transmission', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All transmissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>All transmissions</SelectItem>
                      {renderSelectItems(transmissionItems)}
                    </SelectContent>
                  </Select>
                </Label>

                <Label className="col-span-12 md:col-span-6 xl:col-span-3">
                  <FieldLabel>Seats</FieldLabel>
                  <Select
                    value={selectValue(draftFilters.seats)}
                    onValueChange={(value) => updateDraftFilter('seats', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>Any size</SelectItem>
                      {renderSelectItems(seatItems)}
                    </SelectContent>
                  </Select>
                </Label>

                <Label className="col-span-12 md:col-span-6 xl:col-span-3">
                  <FieldLabel>Pickup</FieldLabel>
                  <DateTimePicker
                    value={draftFilters.pickupAt}
                    onChange={(value) => updateDraftFilter('pickupAt', value)}
                    placeholder="Pick pickup date"
                  />
                </Label>

                <Label className="col-span-12 md:col-span-6 xl:col-span-3">
                  <FieldLabel>Return</FieldLabel>
                  <DateTimePicker
                    value={draftFilters.returnAt}
                    onChange={(value) => updateDraftFilter('returnAt', value)}
                    placeholder="Pick return date"
                  />
                </Label>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.9rem] text-stone-500">
                <span>{pendingFilterCount} filters selected</span>
                {hasPendingChanges ? <Badge variant="muted">Search not applied</Badge> : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <Badge variant="muted" className="px-3 py-2 text-[0.84rem]">
                Results
              </Badge>
              <h2 className="my-2 font-(--font-heading) text-[clamp(1.7rem,3vw,2.4rem)] tracking-tighter">
                {filteredCars.length} cars available
              </h2>
              <p className="m-0 text-stone-500">
                Showing mock inventory filtered by destination, travel details, and
                availability windows.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="grid min-w-[120px] gap-1 rounded-[18px] border border-black/10 bg-white/70 px-4 py-3.5">
                <strong>{mockCars.length}</strong>
                <span className="text-[0.86rem] text-stone-500">Total fleet samples</span>
              </div>
              <div className="grid min-w-[120px] gap-1 rounded-[18px] border border-black/10 bg-white/70 px-4 py-3.5">
                <strong>{activeFilterCount}</strong>
                <span className="text-[0.86rem] text-stone-500">Active filters</span>
              </div>
              <div className="grid min-w-[120px] gap-1 rounded-[18px] border border-black/10 bg-white/70 px-4 py-3.5">
                <strong>{filters.countryCode || 'Global'}</strong>
                <span className="text-[0.86rem] text-stone-500">Destination scope</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredCars.length > 0 ? (
          <section className="grid gap-[18px] lg:grid-cols-2">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} filters={filters} />
            ))}
          </section>
        ) : (
          <Card>
            <CardContent className="grid justify-items-start gap-3">
              <Badge>No Match</Badge>
              <h2 className="m-0 font-(--font-heading) text-[1.35rem]">
                No cars match the current search
              </h2>
              <p className="m-0 text-stone-500">
                Try removing date filters first. The mock listing already excludes
                maintenance cars and overlapping blocked rental windows.
              </p>
              <Button onClick={resetFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageSection>
  )
}
