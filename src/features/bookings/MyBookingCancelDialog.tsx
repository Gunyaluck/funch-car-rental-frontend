import { createPortal } from 'react-dom'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import type { BookingItem } from './types'
import { formatMyBookingDateTime } from './my-bookings-utils'

type MyBookingCancelDialogProps = {
  booking: BookingItem | null
  isBusy: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function MyBookingCancelDialog({
  booking,
  isBusy,
  onCancel,
  onConfirm,
}: MyBookingCancelDialogProps) {
  if (!booking) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Badge variant="danger">Confirm cancellation</Badge>
            <h2 className="m-0 text-xl font-semibold">Cancel this booking?</h2>
            <p className="m-0 text-stone-500">
              {booking.car.brand} {booking.car.model} for pickup on{' '}
              {formatMyBookingDateTime(booking.pickupAt, booking.pickupTimezone)}
            </p>
            <p className="m-0 text-sm text-stone-500">
              This action will cancel the booking. If a deposit was already paid, the payment
              status may move to refund handling.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" disabled={isBusy} onClick={onCancel}>
              Keep booking
            </Button>
            <Button type="button" disabled={isBusy} onClick={onConfirm}>
              {isBusy ? 'Processing...' : 'Yes, cancel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body,
  )
}
