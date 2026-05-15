import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { buttonVariants } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { DateTimePicker } from '../../components/ui/date-time-picker'
import { FieldLabel, Label } from '../../components/ui/label'
import { LoadingSpring } from '../../components/ui/loading-spring'
import { cn } from '../../lib/utils'
import type { CarDetailItem } from './types'
import { formatMoney, getApproximateLocalMoney } from './utils/car-detail-utils'
import type { PricingQuote } from '../pricing/types'

type BookingQuotePanelProps = {
  car: CarDetailItem
  pickupAt: string
  returnAt: string
  quote: PricingQuote | null
  isQuoteLoading: boolean
  quoteErrorMessage: string
  checkoutLink: string | { pathname: string; search?: string }
  isBookable: boolean
  customerCountryCode?: string
  onDateChange: (name: 'pickupAt' | 'returnAt', value: string) => void
}

export function BookingQuotePanel({
  car,
  pickupAt,
  returnAt,
  quote,
  isQuoteLoading,
  quoteErrorMessage,
  checkoutLink,
  isBookable,
  customerCountryCode,
  onDateChange,
}: BookingQuotePanelProps) {
  const minimumPickupAt = new Date(Date.now() + car.minAdvanceBookingHr * 60 * 60 * 1000)
  const canContinue = isBookable && Boolean(quote) && !isQuoteLoading && !quoteErrorMessage
  const displayCurrencyCode = quote?.currencyCode ?? car.currencyCode
  const displayPrice = quote?.grandTotal ?? car.dailyRate
  const localEstimate = getApproximateLocalMoney(
    displayCurrencyCode,
    displayPrice,
    customerCountryCode,
  )
  const quoteLocalEstimate = quote
    ? getApproximateLocalMoney(quote.currencyCode, quote.grandTotal, customerCountryCode)
    : null
  const dateHelpMessage = !isBookable
    ? 'This vehicle is not available for booking right now.'
    : !pickupAt && !returnAt
      ? 'Select pickup and return dates to see the price.'
      : pickupAt && !returnAt
        ? 'Select a return date to calculate the quote.'
        : !pickupAt && returnAt
          ? 'Select a pickup date to calculate the quote.'
          : 'Quote is not available yet. Adjust the pickup or return time and try again.'
  const statusLabel = !isBookable
    ? 'Not bookable'
    : quoteErrorMessage
      ? 'Quote blocked'
      : quote
        ? 'Quote ready'
        : 'Select dates'

  return (
    <aside className="grid gap-4 self-start lg:sticky lg:top-28">
      <Card>
        <CardContent className="grid gap-5">
          <div>
            <Badge variant={quoteErrorMessage ? 'danger' : isBookable ? 'default' : 'muted'}>
              {statusLabel}
            </Badge>
            <div className="mt-3">
              <p className="m-0 font-(--font-heading) text-[2.1rem] leading-none">
                {formatMoney(displayCurrencyCode, displayPrice)}
                <span className="ml-1 text-base text-stone-500">
                  {quote ? 'total' : '/day'}
                </span>
              </p>
              {localEstimate ? (
                <p className="m-0 text-sm text-stone-500">
                  Approx. {localEstimate.formattedValue} in your home currency
                </p>
              ) : null}
              <p className="m-0 text-stone-500">
                {quote
                  ? `${quote.pricingMode.toLowerCase()} pricing`
                  : `${formatMoney(car.currencyCode, car.hourlyRate)} /hr`}
              </p>
            </div>
          </div>

          {!isBookable ? (
            <Alert title="Car unavailable">
              This car cannot be booked right now because its status is {car.status.toLowerCase()}.
            </Alert>
          ) : null}

          {isBookable ? (
          <div className="grid gap-3">
            <Label>
              <FieldLabel>Pickup</FieldLabel>
              <DateTimePicker
                value={pickupAt}
                onChange={(value) => onDateChange('pickupAt', value)}
                placeholder="Pick pickup date"
                minDateTime={minimumPickupAt}
                minuteStep={30}
                is24Hours={car.is24Hours}
                timezone={car.timezone}
                timezoneLabel={`${car.city} time`}
                operatingHours={car.locationHours}
              />
              <span className="text-[0.82rem] text-stone-500">
                Earliest pickup: {car.minAdvanceBookingHr} hours from now
              </span>
            </Label>
            <Label>
              <FieldLabel>Return</FieldLabel>
              <DateTimePicker
                value={returnAt}
                onChange={(value) => onDateChange('returnAt', value)}
                placeholder="Pick return date"
                minDateTime={pickupAt ? new Date(pickupAt) : minimumPickupAt}
                minDateTimeExclusive={Boolean(pickupAt)}
                minuteStep={30}
                is24Hours={car.is24Hours}
                timezone={car.timezone}
                timezoneLabel={`${car.city} time`}
                operatingHours={car.locationHours}
              />
            </Label>
          </div>
          ) : null}

          {isBookable ? (
          <div className="grid gap-2 rounded-3xl border border-black/10 bg-white/60 p-4">
            {isQuoteLoading ? (
              <div className="grid min-h-24 place-items-center">
                <LoadingSpring label="Calculating price" />
              </div>
            ) : quote ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">Rental</span>
                  <strong>{formatMoney(quote.currencyCode, quote.subtotal)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">Options</span>
                  <strong>{formatMoney(quote.currencyCode, quote.optionsTotal)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-stone-500">
                  <span>Duration</span>
                  <span>
                    {quote.totalDays > 0 ? `${quote.totalDays}d` : ''}
                    {quote.totalHours > 0 ? ` ${quote.totalHours}h` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
                  <span className="font-semibold">Grand total</span>
                  <span className="text-right">
                    <strong>{formatMoney(quote.currencyCode, quote.grandTotal)}</strong>
                    {quoteLocalEstimate ? (
                      <span className="block text-xs font-normal text-stone-500">
                        Approx. {quoteLocalEstimate.formattedValue}
                      </span>
                    ) : null}
                  </span>
                </div>
              </>
            ) : (
              <p className="m-0 text-stone-500">
                {dateHelpMessage}
              </p>
            )}
          </div>
          ) : null}

          {isBookable && quoteErrorMessage ? (
            <Alert title="Quote unavailable">
              {quoteErrorMessage}
            </Alert>
          ) : null}

          {isBookable && quote?.breakdown.length ? (
            <div className="grid gap-2">
              <span className="text-[0.86rem] font-semibold text-stone-500">
                Price breakdown
              </span>
              {quote.breakdown.map((item) => (
                <div
                  key={`${item.label}-${item.type}-${item.quantity}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/58 px-4 py-3 text-sm"
                >
                  <span>
                    {item.label} · {item.quantity} {item.type.toLowerCase()}
                  </span>
                  <strong>{formatMoney(quote.currencyCode, item.total)}</strong>
                </div>
              ))}
            </div>
          ) : null}

          {isBookable ? (
            <Link
              to={checkoutLink}
              className={cn(buttonVariants(), !canContinue && 'pointer-events-none opacity-55')}
            >
              Continue to Checkout
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </aside>
  )
}
