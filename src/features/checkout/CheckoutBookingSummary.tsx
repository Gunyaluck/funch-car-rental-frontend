import { Card, CardContent } from '../../components/ui/card'
import type { CarDetailItem } from '../cars/types'
import type { PricingQuote } from '../pricing/types'
import { formatMoney } from '../cars/utils/car-detail-utils'
import { formatCheckoutDateTime } from './utils'

type CheckoutBookingSummaryProps = {
  car: CarDetailItem | null
  quote: PricingQuote | null
  timezone: string
}

export function CheckoutBookingSummary({
  car,
  quote,
  timezone,
}: CheckoutBookingSummaryProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div>
          <h2 className="m-0 mt-2 text-xl font-semibold">
            {car ? `${car.brand} ${car.model}` : 'Booking summary'}
          </h2>
          {car ? (
            <p className="m-0 text-stone-500">
              {car.name} · {car.city}, {car.countryCode} · {car.year}
            </p>
          ) : null}
        </div>

        {quote ? (
          <div className="grid gap-3">
            <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
              <span className="text-sm font-semibold text-stone-500">Pickup</span>
              <span>{formatCheckoutDateTime(quote.pickupAt, timezone)}</span>
            </div>
            <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
              <span className="text-sm font-semibold text-stone-500">Return</span>
              <span>{formatCheckoutDateTime(quote.returnAt, timezone)}</span>
            </div>

            {quote.selectedOptions.length ? (
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-stone-500">Options</span>
                {quote.selectedOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3"
                  >
                    <span>{option.name}</span>
                    <strong>{formatMoney(quote.currencyCode, option.total)}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
