import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import type { BookingItem } from './types'
import { formatMoney } from '../cars/utils/car-detail-utils'
import {
  formatAdminBookingDateTime,
  getAdminBookingStatusVariant,
  getAdminBookingSummaryLabel,
} from './admin-bookings-utils'

type AdminBookingCardProps = {
  booking: BookingItem
  note: string
  isBusy: boolean
  isSavingNote: boolean
  onNoteChange: (value: string) => void
  onSaveNote: () => void
  onApprove: () => void
  onReject: () => void
  onMarkRefundCompleted: () => void
}

export function AdminBookingCard({
  booking,
  note,
  isBusy,
  isSavingNote,
  onNoteChange,
  onSaveNote,
  onApprove,
  onReject,
  onMarkRefundCompleted,
}: AdminBookingCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <Badge variant={getAdminBookingStatusVariant(booking.paymentStatus, booking.status)}>
              {getAdminBookingSummaryLabel(booking)}
            </Badge>
            <h2 className="m-0 text-xl font-semibold">
              {booking.car.brand} {booking.car.model}
            </h2>
            <p className="m-0 text-stone-500">
              {booking.user.firstName} {booking.user.lastName} · {booking.user.email}
              {booking.user.phone ? ` · ${booking.user.phone}` : ''}
            </p>
          </div>
          <div className="grid gap-1 text-right text-sm text-stone-500">
            <span>{formatMoney(booking.currencyCode, booking.depositAmount)} deposit</span>
            <span>{formatMoney(booking.currencyCode, booking.grandTotal)} total</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
            <span className="text-sm font-semibold text-stone-500">Pickup</span>
            <span>{formatAdminBookingDateTime(booking.pickupAt, booking.pickupTimezone)}</span>
          </div>
          <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
            <span className="text-sm font-semibold text-stone-500">Return</span>
            <span>{formatAdminBookingDateTime(booking.returnAt, booking.pickupTimezone)}</span>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-4">
          <div>
            <span className="block text-sm font-semibold text-stone-500">Booking status</span>
            <strong>{booking.status}</strong>
          </div>
          <div>
            <span className="block text-sm font-semibold text-stone-500">Payment status</span>
            <strong>{booking.paymentStatus}</strong>
          </div>
          <div>
            <span className="block text-sm font-semibold text-stone-500">Deposit paid</span>
            <strong>
              {booking.depositPaidAt
                ? formatAdminBookingDateTime(booking.depositPaidAt, booking.pickupTimezone)
                : 'Not yet'}
            </strong>
          </div>
          <div>
            <span className="block text-sm font-semibold text-stone-500">Deposit due</span>
            <strong>
              {booking.depositDueAt
                ? formatAdminBookingDateTime(booking.depositDueAt, booking.pickupTimezone)
                : 'N/A'}
            </strong>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-semibold text-stone-500">Branch note</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={note} disabled={isBusy} onChange={(event) => onNoteChange(event.target.value)} />
            <Button type="button" variant="outline" disabled={isBusy} onClick={onSaveNote}>
              {isSavingNote ? 'Saving...' : 'Save note'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID' ? (
            <Button type="button" disabled={isBusy} onClick={onApprove}>
              {isBusy ? 'Processing...' : 'Approve and confirm'}
            </Button>
          ) : null}

          {booking.status === 'PENDING' ? (
            <Button type="button" variant="outline" disabled={isBusy} onClick={onReject}>
              {isBusy ? 'Processing...' : 'Reject booking'}
            </Button>
          ) : null}

          {booking.paymentStatus === 'REFUND_PENDING' ? (
            <Button type="button" variant="outline" disabled={isBusy} onClick={onMarkRefundCompleted}>
              {isBusy ? 'Processing...' : 'Mark refund completed'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
