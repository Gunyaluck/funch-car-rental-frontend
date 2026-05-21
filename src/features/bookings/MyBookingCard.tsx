import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import type { BookingItem } from './types'
import { formatMoney } from '../cars/utils/car-detail-utils'
import {
  canCancelMyBooking,
  canPayMyBookingDeposit,
  formatMyBookingDateTime,
  getMyBookingHeadline,
  getMyBookingMessage,
  getMyBookingStatusVariant,
} from './my-bookings-utils'

type MyBookingCardProps = {
  booking: BookingItem
  isBusy: boolean
  onPayDeposit: () => void
  onCancel: () => void
}

export function MyBookingCard({
  booking,
  isBusy,
  onPayDeposit,
  onCancel,
}: MyBookingCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Badge variant={getMyBookingStatusVariant(booking.status, booking.paymentStatus)}>
            {getMyBookingHeadline(booking)}
          </Badge>
          <h2 className="m-0 text-xl font-semibold">
            {booking.car.brand} {booking.car.model}
          </h2>
          <p className="m-0 text-stone-500">
            {booking.car.name} · {booking.car.city}, {booking.car.countryCode} · {booking.car.year}
          </p>
          <p className="m-0 text-sm text-stone-500">{getMyBookingMessage(booking)}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
            <span className="text-sm font-semibold text-stone-500">Pickup</span>
            <span>{formatMyBookingDateTime(booking.pickupAt, booking.pickupTimezone)}</span>
          </div>
          <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
            <span className="text-sm font-semibold text-stone-500">Return</span>
            <span>{formatMyBookingDateTime(booking.returnAt, booking.pickupTimezone)}</span>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-3">
          <div>
            <span className="block text-sm font-semibold text-stone-500">Deposit</span>
            <strong>{formatMoney(booking.currencyCode, booking.depositAmount)}</strong>
          </div>
          <div>
            <span className="block text-sm font-semibold text-stone-500">Pay at pickup</span>
            <strong>{formatMoney(booking.currencyCode, booking.amountDueAtPickup)}</strong>
          </div>
          <div>
            <span className="block text-sm font-semibold text-stone-500">Total</span>
            <strong>{formatMoney(booking.currencyCode, booking.grandTotal)}</strong>
          </div>
        </div>

        {booking.depositDueAt ? (
          <p
            className={
              booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING'
                ? 'm-0 text-sm font-medium text-red-600'
                : 'm-0 text-sm text-stone-500'
            }
          >
            Deposit due by {formatMyBookingDateTime(booking.depositDueAt, booking.pickupTimezone)}
          </p>
        ) : null}

        {booking.options.length ? (
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-stone-500">Options</span>
            {booking.options.map((option) => (
              <div
                key={option.id}
                className="flex justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3"
              >
                <span>{option.name}</span>
                <strong>{formatMoney(booking.currencyCode, option.totalPrice)}</strong>
              </div>
            ))}
          </div>
        ) : null}

        {booking.adminNote ? <Alert title="Branch note">{booking.adminNote}</Alert> : null}

        <div className="flex flex-wrap gap-3">
          {canPayMyBookingDeposit(booking) ? (
            <Button type="button" disabled={isBusy} onClick={onPayDeposit}>
              {isBusy ? 'Processing...' : 'Pay deposit now'}
            </Button>
          ) : null}

          {canCancelMyBooking(booking) ? (
            <Button type="button" variant="outline" disabled={isBusy} onClick={onCancel}>
              {isBusy ? 'Processing...' : 'Cancel booking'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
