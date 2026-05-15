import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'

type CarsResultsSummaryProps = {
  isLoading: boolean
  visibleCount: number
  totalCars: number
  activeFilterCount: number
  destinationScope: string
}

export function CarsResultsSummary({
  isLoading,
  visibleCount,
  totalCars,
  activeFilterCount,
  destinationScope,
}: CarsResultsSummaryProps) {
  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <Badge variant="muted" className="px-3 py-2 text-[0.84rem]">
            Results
          </Badge>
          <h2 className="my-2 font-(--font-heading) text-[clamp(1.7rem,3vw,2.4rem)] tracking-tighter">
            {isLoading ? 'Loading cars...' : `${visibleCount} cars available`}
          </h2>
          <p className="m-0 text-stone-500">
            Showing cars that match your current search.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="grid min-w-[120px] gap-1 rounded-[18px] border border-black/10 bg-white/70 px-4 py-3.5">
            <strong>{totalCars}</strong>
            <span className="text-[0.86rem] text-stone-500">Matching cars</span>
          </div>
          <div className="grid min-w-[120px] gap-1 rounded-[18px] border border-black/10 bg-white/70 px-4 py-3.5">
            <strong>{activeFilterCount}</strong>
            <span className="text-[0.86rem] text-stone-500">Active filters</span>
          </div>
          <div className="grid min-w-[120px] gap-1 rounded-[18px] border border-black/10 bg-white/70 px-4 py-3.5">
            <strong>{destinationScope}</strong>
            <span className="text-[0.86rem] text-stone-500">Destination scope</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
