import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  approveBooking,
  listAdminBookings,
  markBookingRefunded,
  rejectBooking,
} from '../../features/bookings/api'
import type { BookingItem, PaymentStatus } from '../../features/bookings/types'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

function formatDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

function getStatusVariant(paymentStatus: PaymentStatus, status: BookingItem['status']) {
  if (paymentStatus === 'REFUND_PENDING' || paymentStatus === 'REFUNDED') {
    return 'danger' as const
  }

  if (status === 'APPROVED') {
    return 'default' as const
  }

  return 'muted' as const
}

function getSummaryLabel(booking: BookingItem) {
  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING') {
    return 'Waiting for deposit'
  }

  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID') {
    return 'Ready for branch call'
  }

  if (booking.status === 'APPROVED') {
    return 'Confirmed'
  }

  if (booking.paymentStatus === 'REFUND_PENDING') {
    return 'Refund pending'
  }

  if (booking.paymentStatus === 'REFUNDED') {
    return 'Refunded'
  }

  return booking.status
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionBookingId, setActionBookingId] = useState('')
  const [notesById, setNotesById] = useState<Record<string, string>>({})

  useEffect(() => {
    let isCurrent = true

    async function loadBookings() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await listAdminBookings()

        if (isCurrent) {
          setBookings(result)
          setNotesById(
            Object.fromEntries(result.map((booking) => [booking.id, booking.adminNote ?? ''])),
          )
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load admin bookings.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      isCurrent = false
    }
  }, [])

  async function runAction(
    bookingId: string,
    action: (bookingId: string, payload: { adminNote?: string }) => Promise<BookingItem>,
  ) {
    setActionBookingId(bookingId)
    setErrorMessage('')

    try {
      const updatedBooking = await action(bookingId, {
        adminNote: notesById[bookingId]?.trim() || undefined,
      })

      setBookings((currentBookings) =>
        currentBookings.map((booking) => (booking.id === bookingId ? updatedBooking : booking)),
      )
      setNotesById((currentNotes) => ({
        ...currentNotes,
        [bookingId]: updatedBooking.adminNote ?? '',
      }))
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to update this booking.'))
    } finally {
      setActionBookingId('')
    }
  }

  return (
    <div className="grid gap-4">
      {errorMessage ? <Alert title="Admin bookings unavailable">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Card>
          <CardContent className="grid gap-2">
            <Badge>Loading</Badge>
            <h2 className="m-0 text-xl font-semibold">Booking queue</h2>
            <p className="m-0 text-stone-500">Loading booking requests and deposit states.</p>
          </CardContent>
        </Card>
      ) : null}

      {bookings.map((booking) => {
        const isBusy = actionBookingId === booking.id
        const note = notesById[booking.id] ?? ''

        return (
          <Card key={booking.id}>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-2">
                  <Badge variant={getStatusVariant(booking.paymentStatus, booking.status)}>
                    {getSummaryLabel(booking)}
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
                  <span>{formatDateTime(booking.pickupAt, booking.pickupTimezone)}</span>
                </div>
                <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                  <span className="text-sm font-semibold text-stone-500">Return</span>
                  <span>{formatDateTime(booking.returnAt, booking.pickupTimezone)}</span>
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
                      ? formatDateTime(booking.depositPaidAt, booking.pickupTimezone)
                      : 'Not yet'}
                  </strong>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-stone-500">Deposit due</span>
                  <strong>
                    {booking.depositDueAt
                      ? formatDateTime(booking.depositDueAt, booking.pickupTimezone)
                      : 'N/A'}
                  </strong>
                </div>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-semibold text-stone-500">Branch note</span>
                <Input
                  value={note}
                  disabled={isBusy}
                  onChange={(event) =>
                    setNotesById((currentNotes) => ({
                      ...currentNotes,
                      [booking.id]: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID' ? (
                  <Button
                    type="button"
                    disabled={isBusy}
                    onClick={() => runAction(booking.id, approveBooking)}
                  >
                    {isBusy ? 'Processing...' : 'Approve and confirm'}
                  </Button>
                ) : null}

                {booking.status === 'PENDING' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => runAction(booking.id, rejectBooking)}
                  >
                    {isBusy ? 'Processing...' : 'Reject booking'}
                  </Button>
                ) : null}

                {booking.paymentStatus === 'REFUND_PENDING' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => runAction(booking.id, markBookingRefunded)}
                  >
                    {isBusy ? 'Processing...' : 'Mark refund completed'}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
