import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { buttonVariants } from '../../components/ui/button-variants'
import { Card, CardContent } from '../../components/ui/card'
import { formatMoney } from '../cars/utils/car-detail-utils'
import type { BookingItem } from '../bookings/types'
import type { PricingQuote } from '../pricing/types'

type CheckoutPriceCardProps = {
  quote: PricingQuote | null
  booking: BookingItem | null
  isLoading: boolean
  isSubmitting: boolean
  isSignedIn: boolean
  onSubmit: () => void
}

export function CheckoutPriceCard({
  quote,
  booking,
  isLoading,
  isSubmitting,
  isSignedIn,
  onSubmit,
}: CheckoutPriceCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <h2 className="m-0 text-xl font-semibold">Price</h2>
        {quote ? (
          <div className="grid gap-3">
            <div className="flex justify-between gap-3">
              <span className="text-stone-500">Rental</span>
              <strong>{formatMoney(quote.currencyCode, quote.subtotal)}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-stone-500">Options</span>
              <strong>{formatMoney(quote.currencyCode, quote.optionsTotal)}</strong>
            </div>
            <div className="flex justify-between gap-3 border-t border-black/10 pt-3 text-lg">
              <span className="font-semibold">Total</span>
              <strong>{formatMoney(quote.currencyCode, quote.grandTotal)}</strong>
            </div>
            <p className="m-0 text-sm text-stone-500">
              Deposit is charged first. Final confirmation happens after the branch reviews your
              booking.
            </p>
          </div>
        ) : (
          <p className="m-0 text-stone-500">Prepare a quote before submitting.</p>
        )}

        {booking ? (
          <Link to="/my-bookings" className={buttonVariants()}>
            Go to My Bookings
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Button type="button" disabled={!quote || isLoading || isSubmitting} onClick={onSubmit}>
            {isSubmitting
              ? 'Submitting booking...'
              : isSignedIn
                ? 'Submit booking and continue to deposit'
                : 'Create account, book, and continue to deposit'}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
