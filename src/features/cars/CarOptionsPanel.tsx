import { ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { cn } from '../../lib/utils'
import type { CarDetailItem } from './types'
import { formatMoney } from './utils/car-detail-utils'

type CarOptionsPanelProps = {
  car: CarDetailItem
  selectedOptionIds: string[]
  onToggleOption: (optionId: string) => void
}

export function CarOptionsPanel({
  car,
  selectedOptionIds,
  onToggleOption,
}: CarOptionsPanelProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-forest-700" />
          <h2 className="m-0 font-(--font-heading) text-[1.45rem]">Add-ons</h2>
        </div>
        <div className="grid gap-3">
          {car.options.length > 0 ? (
            car.options.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    'grid gap-1 rounded-3xl border p-4 text-left transition',
                    isSelected
                      ? 'border-forest-700/35 bg-forest-700/10'
                      : 'border-black/10 bg-white/58 hover:bg-white/78',
                  )}
                  onClick={() => onToggleOption(option.id)}
                >
                  <span className="flex items-center justify-between gap-3">
                    <strong>{option.name}</strong>
                    <span>{formatMoney(car.currencyCode, option.pricePerDay)} /day</span>
                  </span>
                  {option.description ? (
                    <span className="text-sm text-stone-500">{option.description}</span>
                  ) : null}
                </button>
              )
            })
          ) : (
            <p className="m-0 text-stone-500">No optional add-ons for this vehicle.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
