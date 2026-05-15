import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { CarCard } from './CarCard'
import type { CarFilters, CarListItem } from './types'

type CarsResultsStateProps = {
  cars: CarListItem[]
  filters: CarFilters
  isLoading: boolean
  errorMessage: string
  customerCountryCode?: string
  onRetry: () => void
  onReset: () => void
}

export function CarsResultsState({
  cars,
  filters,
  isLoading,
  errorMessage,
  customerCountryCode,
  onRetry,
  onReset,
}: CarsResultsStateProps) {
  if (errorMessage) {
    return (
      <Card>
        <CardContent className="grid justify-items-start gap-3">
          <Badge variant="danger">No Connection</Badge>
          <h2 className="m-0 font-(--font-heading) text-[1.35rem]">
            Could not load cars
          </h2>
          <Alert title="Connection problem">{errorMessage}</Alert>
          <Button onClick={onRetry}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <section className="grid gap-[18px] lg:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardContent className="grid gap-4">
              <div className="h-36 animate-pulse rounded-3xl bg-black/5" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-black/5" />
              <div className="h-4 w-full animate-pulse rounded-full bg-black/5" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-black/5" />
            </CardContent>
          </Card>
        ))}
      </section>
    )
  }

  if (cars.length > 0) {
    return (
      <section className="grid gap-[18px] lg:grid-cols-2">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            filters={filters}
            customerCountryCode={customerCountryCode}
          />
        ))}
      </section>
    )
  }

  return (
    <Card>
      <CardContent className="grid justify-items-start gap-3">
        <Badge>No Match</Badge>
        <h2 className="m-0 font-(--font-heading) text-[1.35rem]">
          No cars match the current search
        </h2>
        <p className="m-0 text-stone-500">
          Try removing date filters first, or choose another destination.
        </p>
        <Button onClick={onReset}>Clear Filters</Button>
      </CardContent>
    </Card>
  )
}
