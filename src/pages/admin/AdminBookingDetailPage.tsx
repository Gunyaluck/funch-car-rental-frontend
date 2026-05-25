import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { AdminBookingConfirmDialog } from '../../features/bookings/AdminBookingConfirmDialog'
import {
  approveBooking,
  listAdminBookings,
  markBookingRefunded,
  rejectBooking,
  saveBookingAdminNote,
} from '../../features/bookings/api'
import {
  formatAdminBookingDateTime,
  getAdminBookingsApiErrorMessage,
  getAdminBookingStatusVariant,
  getAdminBookingSummaryLabel,
} from '../../features/bookings/admin-bookings-utils'
import type { BookingItem } from '../../features/bookings/types'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'

export function AdminBookingDetailPage() {
  const navigate = useNavigate()
  const { bookingId } = useParams()
  const [booking, setBooking] = useState<BookingItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [note, setNote] = useState('')
  const [actionBookingId, setActionBookingId] = useState('')
  const [savingNoteBookingId, setSavingNoteBookingId] = useState('')
  const [confirmApproveBookingId, setConfirmApproveBookingId] = useState('')
  const [confirmRejectBookingId, setConfirmRejectBookingId] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadBooking() {
      if (!bookingId) {
        setErrorMessage('Missing booking id.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await listAdminBookings()
        const match = result.find((item) => item.id === bookingId) ?? null

        if (!isCurrent) {
          return
        }

        if (!match) {
          setBooking(null)
          setErrorMessage('This booking could not be found.')
          return
        }

        setBooking(match)
        setNote(match.adminNote ?? '')
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getAdminBookingsApiErrorMessage(error, 'Unable to load this booking.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadBooking()

    return () => {
      isCurrent = false
    }
  }, [bookingId])

  async function runAction(
    action: (bookingId: string, payload: { adminNote?: string }) => Promise<BookingItem>,
  ) {
    if (!booking) {
      return
    }

    setActionBookingId(booking.id)
    setErrorMessage('')

    try {
      const updatedBooking = await action(booking.id, {
        adminNote: note.trim() || undefined,
      })

      setBooking(updatedBooking)
      setNote(updatedBooking.adminNote ?? '')
    } catch (error) {
      setErrorMessage(getAdminBookingsApiErrorMessage(error, 'Unable to update this booking.'))
    } finally {
      setActionBookingId('')
    }
  }

  async function handleSaveNote() {
    if (!booking) {
      return
    }

    setSavingNoteBookingId(booking.id)
    setErrorMessage('')

    try {
      const updatedBooking = await saveBookingAdminNote(booking.id, {
        adminNote: note.trim() || undefined,
      })

      setBooking(updatedBooking)
      setNote(updatedBooking.adminNote ?? '')
    } catch (error) {
      setErrorMessage(getAdminBookingsApiErrorMessage(error, 'Unable to save this note.'))
    } finally {
      setSavingNoteBookingId('')
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/bookings')}>
          Back to bookings
        </Button>
      </div>

      {errorMessage ? <Alert title="Booking unavailable">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Card>
          <CardContent className="grid min-h-[220px] place-items-center text-stone-500">
            Loading booking details...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && booking ? (
        <Card>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={getAdminBookingStatusVariant(booking.paymentStatus, booking.status)}
                >
                  {getAdminBookingSummaryLabel(booking)}
                </Badge>
                <Badge variant="chip">{booking.status}</Badge>
                <Badge variant="muted">{booking.paymentStatus}</Badge>
              </div>
              <h1 className="m-0 text-2xl font-semibold">
                {booking.car.brand} {booking.car.model}
              </h1>
              <p className="m-0 text-stone-500">
                {booking.user.firstName} {booking.user.lastName} · {booking.user.email}
                {booking.user.phone ? ` · ${booking.user.phone}` : ''}
              </p>
              <p className="m-0 text-xs text-stone-400">Booking ID: {booking.id}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Trip</span>
                <strong>{formatAdminBookingDateTime(booking.pickupAt, booking.pickupTimezone)}</strong>
                <p className="m-0 text-stone-500">
                  Return {formatAdminBookingDateTime(booking.returnAt, booking.pickupTimezone)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Amounts</span>
                <strong>{formatMoney(booking.currencyCode, booking.grandTotal)}</strong>
                <p className="m-0 text-stone-500">
                  Deposit {formatMoney(booking.currencyCode, booking.depositAmount)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Schedule</span>
                <strong>
                  {booking.totalDays} days · {booking.totalHours} hours
                </strong>
                <p className="m-0 text-stone-500">
                  {booking.car.city}, {booking.car.countryCode}
                </p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Payment trail</span>
                <strong>
                  {booking.depositPaidAt
                    ? `Paid ${formatAdminBookingDateTime(
                        booking.depositPaidAt,
                        booking.pickupTimezone,
                      )}`
                    : 'Deposit not paid'}
                </strong>
                <p className="m-0 text-stone-500">
                  Due{' '}
                  {booking.depositDueAt
                    ? formatAdminBookingDateTime(booking.depositDueAt, booking.pickupTimezone)
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid gap-2 rounded-2xl bg-white/60 p-4">
              <strong>Branch note</strong>
              <div className="flex flex-col gap-2">
                <Input
                  value={note}
                  disabled={actionBookingId === booking.id || savingNoteBookingId === booking.id}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add branch note"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  disabled={actionBookingId === booking.id || savingNoteBookingId === booking.id}
                  onClick={() => void handleSaveNote()}
                >
                  {savingNoteBookingId === booking.id ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {booking.options.length > 0 ? (
              <div className="grid gap-2 rounded-2xl bg-white/60 p-4">
                <strong>Options</strong>
                <div className="flex flex-wrap gap-2">
                  {booking.options.map((option) => (
                    <Badge key={option.id} variant="chip">
                      {option.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID' ? (
                <Button
                  type="button"
                  disabled={actionBookingId === booking.id}
                  onClick={() => setConfirmApproveBookingId(booking.id)}
                >
                  {actionBookingId === booking.id ? 'Processing...' : 'Approve'}
                </Button>
              ) : null}

              {booking.status === 'PENDING' ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={actionBookingId === booking.id}
                  onClick={() => setConfirmRejectBookingId(booking.id)}
                >
                  {actionBookingId === booking.id ? 'Processing...' : 'Reject'}
                </Button>
              ) : null}

              {booking.paymentStatus === 'REFUND_PENDING' ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={actionBookingId === booking.id}
                  onClick={() => void runAction(markBookingRefunded)}
                >
                  {actionBookingId === booking.id ? 'Processing...' : 'Complete refund'}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AdminBookingConfirmDialog
        booking={booking && booking.id === confirmRejectBookingId ? booking : null}
        badgeLabel="Confirm rejection"
        badgeVariant="danger"
        title="Reject this booking?"
        description="This action will mark the booking as rejected. If the deposit was already paid, the payment status will move to refund pending."
        currentNote={note.trim()}
        cancelLabel="Keep booking"
        confirmLabel="Yes, reject"
        isBusy={actionBookingId === booking?.id}
        onCancel={() => setConfirmRejectBookingId('')}
        onConfirm={async () => {
          await runAction(rejectBooking)
          setConfirmRejectBookingId('')
        }}
      />

      <AdminBookingConfirmDialog
        booking={booking && booking.id === confirmApproveBookingId ? booking : null}
        badgeLabel="Confirm approval"
        title="Approve this booking?"
        description="This action will confirm the booking after branch review. The current admin note will be kept with the approval."
        currentNote={note.trim()}
        cancelLabel="Not yet"
        confirmLabel="Yes, approve"
        isBusy={actionBookingId === booking?.id}
        onCancel={() => setConfirmApproveBookingId('')}
        onConfirm={async () => {
          await runAction(approveBooking)
          setConfirmApproveBookingId('')
        }}
      />
    </div>
  )
}
