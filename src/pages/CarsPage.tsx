import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { listCars } from '../features/cars/api'
import { CarsFilterPanel } from '../features/cars/CarsFilterPanel'
import { CarsResultsState } from '../features/cars/CarsResultsState'
import { defaultCarFilters, minimumAdvanceBookingHours } from '../features/cars/constants'
import type { CarFilters, CarListItem } from '../features/cars/types'
import { EMPTY_SELECT_VALUE, filtersFromSearchParams, optionsFromCars } from '../features/cars/utils/cars-filter-utils'

function getStoredCustomerCountryCode() {
  return window.localStorage.getItem('customerCountryCode') ?? 'TH'
}

function getMinimumPickupTime() {
  return Date.now() + minimumAdvanceBookingHours * 60 * 60 * 1000
}

export function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState<CarListItem[]>([])
  const [allCars, setAllCars] = useState<CarListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filterErrorMessage, setFilterErrorMessage] = useState('')

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

        if (allResult) {
          setAllCars(allResult.data)
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

      return {
        key: filtersKey,
        filters: {
          ...currentFilters,
          [name]: value === EMPTY_SELECT_VALUE ? '' : value,
          ...(name === 'pickupAt' &&
          currentFilters.returnAt &&
          value &&
          new Date(currentFilters.returnAt) <= new Date(value)
            ? { returnAt: '' }
            : {}),
        },
      }
    })
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
      new Date(draftFilters.pickupAt).getTime() < getMinimumPickupTime()
    ) {
      setFilterErrorMessage(
        `Pickup must be at least ${minimumAdvanceBookingHours} hours from now.`,
      )
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
          cars={cars}
          filters={filters}
          isLoading={isLoading}
          errorMessage={errorMessage}
          customerCountryCode={customerCountryCode}
          onRetry={() => setSearchParams(searchParams)}
          onReset={resetFilters}
        />
      </div>
    </PageSection>
  )
}
