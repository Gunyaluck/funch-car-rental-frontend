import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { buttonVariants } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { DateTimePicker } from '../../components/ui/date-time-picker'
import { FieldLabel, Label } from '../../components/ui/label'
import { cn } from '../../lib/utils'
import type { CarDetailItem } from './types'
import { formatMoney } from './utils/car-detail-utils'

type BookingQuotePanelProps = {
  car: CarDetailItem
  pickupAt: string
  returnAt: string
  rentalDays: number
  optionsTotal: number
  estimatedTotal: number
  checkoutLink: string | { pathname: string; search?: string }
  isBookable: boolean
  onDateChange: (name: 'pickupAt' | 'returnAt', value: string) => void
}

export function BookingQuotePanel({
  car,
  pickupAt,
  returnAt,
  rentalDays,
  optionsTotal,
  estimatedTotal,
  checkoutLink,
  isBookable,
  onDateChange,
}: BookingQuotePanelProps) {
  return (
    <aside className="grid gap-4 self-start lg:sticky lg:top-28">
      <Card>
        <CardContent className="grid gap-5">
          <div>
            <Badge variant={isBookable ? 'default' : 'muted'}>
              {isBookable ? 'Ready to book' : 'Not bookable'}
            </Badge>
            <div className="mt-3">
              <p className="m-0 font-(--font-heading) text-[2.1rem] leading-none">
                {formatMoney(car.currencyCode, car.dailyRate)}
                <span className="ml-1 text-base text-stone-500">/day</span>
              </p>
              <p className="m-0 text-stone-500">
                {formatMoney(car.currencyCode, car.hourlyRate)} /hr
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <Label>
              <FieldLabel>Pickup</FieldLabel>
              <DateTimePicker
                value={pickupAt}
                onChange={(value) => onDateChange('pickupAt', value)}
                placeholder="Pick pickup date"
              />
            </Label>
            <Label>
              <FieldLabel>Return</FieldLabel>
              <DateTimePicker
                value={returnAt}
                onChange={(value) => onDateChange('returnAt', value)}
                placeholder="Pick return date"
              />
            </Label>
          </div>

          <div className="grid gap-2 rounded-3xl border border-black/10 bg-white/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-stone-500">Rental days</span>
              <strong>{rentalDays}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-stone-500">Options</span>
              <strong>{formatMoney(car.currencyCode, optionsTotal)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
              <span className="font-semibold">Estimated total</span>
              <strong>{formatMoney(car.currencyCode, estimatedTotal)}</strong>
            </div>
          </div>

          <Link
            to={checkoutLink}
            className={cn(buttonVariants(), !isBookable && 'pointer-events-none opacity-55')}
          >
            Continue to Checkout
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </aside>
  )
}
