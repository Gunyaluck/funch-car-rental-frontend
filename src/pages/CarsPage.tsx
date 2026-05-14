import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { listCars } from '../features/cars/api'
import { CarsFilterPanel } from '../features/cars/CarsFilterPanel'
import { CarsResultsState } from '../features/cars/CarsResultsState'
import { CarsResultsSummary } from '../features/cars/CarsResultsSummary'
import { defaultCarFilters } from '../features/cars/constants'
import type { CarFilters, CarListItem } from '../features/cars/types'
import { EMPTY_SELECT_VALUE, filtersFromSearchParams, optionsFromCars } from '../features/cars/utils/cars-filter-utils'

export function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState<CarListItem[]>([])
  const [allCars, setAllCars] = useState<CarListItem[]>([])
  const [totalCars, setTotalCars] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filterErrorMessage, setFilterErrorMessage] = useState('')

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  )
  const [draftFilters, setDraftFilters] = useState<CarFilters>(filters)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const pendingFilterCount = Object.values(draftFilters).filter(Boolean).length
  const hasPendingChanges = useMemo(() => {
    const filterKeys = Object.keys(defaultCarFilters) as Array<keyof CarFilters>
    return filterKeys.some((key) => filters[key] !== draftFilters[key])
  }, [draftFilters, filters])
  const filterOptions = useMemo(() => optionsFromCars(allCars), [allCars])

  useEffect(() => {
    let isCurrent = true

    async function fetchCars() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [filteredResult, allResult] = await Promise.all([
          listCars(filters),
          allCars.length > 0 ? Promise.resolve(null) : listCars(defaultCarFilters),
        ])

        if (!isCurrent) {
          return
        }

        setCars(filteredResult.data)
        setTotalCars(filteredResult.meta.total)

        if (allResult) {
          setAllCars(allResult.data)
        }
      } catch (error) {
        if (!isCurrent) {
          return
        }

        setCars([])
        setTotalCars(0)
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load cars from the backend.',
        )
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
  }, [allCars.length, filters])

  function updateDraftFilter(name: keyof CarFilters, value: string) {
    setFilterErrorMessage('')
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value === EMPTY_SELECT_VALUE ? '' : value,
      ...(name === 'pickupAt' &&
      currentFilters.returnAt &&
      value &&
      new Date(currentFilters.returnAt) <= new Date(value)
        ? { returnAt: '' }
        : {}),
    }))
  }

  function applyFilters() {
    if (
      (draftFilters.pickupAt && !draftFilters.returnAt) ||
      (!draftFilters.pickupAt && draftFilters.returnAt)
    ) {
      setFilterErrorMessage('Pickup and return must be selected together.')
      return
    }

    if (
      draftFilters.pickupAt &&
      draftFilters.returnAt &&
      new Date(draftFilters.pickupAt) >= new Date(draftFilters.returnAt)
    ) {
      setFilterErrorMessage('Return must be later than pickup.')
      return
    }

    const nextParams = new URLSearchParams()

    Object.entries(draftFilters).forEach(([name, value]) => {
      if (value) {
        nextParams.set(name, value)
      }
    })

    setSearchParams(nextParams)
  }

  function resetFilters() {
    setFilterErrorMessage('')
    setDraftFilters(defaultCarFilters)
    setSearchParams({})
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    applyFilters()
  }

  return (
    <PageSection
      eyebrow="Cars"
      title="Find cars by destination, schedule, and travel fit"
      description="Search live vehicle inventory from the backend database and keep each search shareable through URL-synced filters."
    >
      <div className="grid gap-6">
        <CarsFilterPanel
          draftFilters={draftFilters}
          filterOptions={filterOptions}
          pendingFilterCount={pendingFilterCount}
          hasPendingChanges={hasPendingChanges}
          errorMessage={filterErrorMessage}
          onChange={updateDraftFilter}
          onReset={resetFilters}
          onSubmit={handleFilterSubmit}
        />

        <CarsResultsSummary
          isLoading={isLoading}
          visibleCount={cars.length}
          totalCars={totalCars}
          activeFilterCount={activeFilterCount}
          destinationScope={filters.countryCode || 'Global'}
        />

        <CarsResultsState
          cars={cars}
          filters={filters}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => setSearchParams(searchParams)}
          onReset={resetFilters}
        />
      </div>
    </PageSection>
  )
}
