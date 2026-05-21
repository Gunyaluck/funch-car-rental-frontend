import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { listCars } from '../features/cars/api'
import { CarsFilterPanel } from '../features/cars/CarsFilterPanel'
import { CarsPagination } from '../features/cars/CarsPagination'
import { CarsResultsState } from '../features/cars/CarsResultsState'
import { defaultCarFilters } from '../features/cars/constants'
import type { CarFilters, CarListItem } from '../features/cars/types'
import { filtersFromSearchParams, optionsFromCars } from '../features/cars/utils/cars-filter-utils'
import {
  buildNextDraftFilters,
  CARS_PER_PAGE,
  getCarsPageFilterError,
  getStoredCustomerCountryCode,
  isBookableCar,
} from '../features/cars/utils/cars-page-utils'

export function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState<CarListItem[]>([])
  const [allCars, setAllCars] = useState<CarListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filterErrorMessage, setFilterErrorMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  )
  const filtersKey = searchParams.toString()
  const [draftState, setDraftState] = useState<{ key: string; filters: CarFilters }>(() => ({
    key: filtersKey,
    filters,
  }))
  const draftFilters = draftState.key === filtersKey ? draftState.filters : filters

  const pendingFilterCount = Object.values(draftFilters).filter(Boolean).length
  const filterOptions = useMemo(() => optionsFromCars(allCars), [allCars])
  const customerCountryCode = getStoredCustomerCountryCode()
  const totalPages = Math.max(1, Math.ceil(cars.length / CARS_PER_PAGE))
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * CARS_PER_PAGE

    return cars.slice(startIndex, startIndex + CARS_PER_PAGE)
  }, [cars, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

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

        setCars(filteredResult.data.filter(isBookableCar))

        if (allResult) {
          setAllCars(allResult.data.filter(isBookableCar))
        }
      } catch (error) {
        if (!isCurrent) {
          return
        }

        setCars([])
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load cars right now.',
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
    setDraftState((currentState) => {
      const currentFilters = currentState.key === filtersKey ? currentState.filters : filters

      return buildNextDraftFilters({
        currentFilters,
        filtersKey,
        name,
        value,
      })
    })
  }

  function applyFilters() {
    const validationError = getCarsPageFilterError(draftFilters)

    if (validationError) {
      setFilterErrorMessage(validationError)
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
    setDraftState({ key: '', filters: defaultCarFilters })
    setSearchParams({})
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    applyFilters()
  }

  return (
    <PageSection
      title="Cars"
    >
      <div className="grid gap-6">
        <CarsFilterPanel
          draftFilters={draftFilters}
          filterOptions={filterOptions}
          pendingFilterCount={pendingFilterCount}
          errorMessage={filterErrorMessage}
          onChange={updateDraftFilter}
          onReset={resetFilters}
          onSubmit={handleFilterSubmit}
        />

        <CarsResultsState
          cars={paginatedCars}
          filters={filters}
          isLoading={isLoading}
          errorMessage={errorMessage}
          customerCountryCode={customerCountryCode}
          onRetry={() => setSearchParams(searchParams)}
          onReset={resetFilters}
        />

        {!isLoading && !errorMessage && cars.length > CARS_PER_PAGE ? (
          <CarsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCars={cars.length}
            carsPerPage={CARS_PER_PAGE}
            onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
            onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          />
        ) : null}
      </div>
    </PageSection>
  )
}
