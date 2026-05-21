import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  approveBooking,
  listAdminBookings,
  markBookingRefunded,
  rejectBooking,
  saveBookingAdminNote,
} from '../../features/bookings/api'
import type { BookingItem, BookingStatus, PaymentStatus } from '../../features/bookings/types'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'

const PAGE_SIZE = 5
const BOOKING_STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]
const PAYMENT_STATUS_OPTIONS: Array<PaymentStatus | 'ALL'> = [
  'ALL',
  'UNPAID',
  'DEPOSIT_PENDING',
  'DEPOSIT_PAID',
  'REFUND_PENDING',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
]

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
  const [savingNoteBookingId, setSavingNoteBookingId] = useState('')
  const [confirmApproveBookingId, setConfirmApproveBookingId] = useState('')
  const [confirmRejectBookingId, setConfirmRejectBookingId] = useState('')
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, paymentFilter])

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

  async function handleSaveNote(bookingId: string) {
    setSavingNoteBookingId(bookingId)
    setErrorMessage('')

    try {
      const updatedBooking = await saveBookingAdminNote(bookingId, {
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
      setErrorMessage(getApiErrorMessage(error, 'Unable to save this note.'))
    } finally {
      setSavingNoteBookingId('')
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter !== 'ALL' && booking.status !== statusFilter) {
      return false
    }

    if (paymentFilter !== 'ALL' && booking.paymentStatus !== paymentFilter) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    const searchableText = [
      booking.id,
      booking.user.firstName,
      booking.user.lastName,
      booking.user.email,
      booking.user.phone ?? '',
      booking.car.brand,
      booking.car.model,
      booking.car.name,
      booking.car.city,
      booking.adminNote ?? '',
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedSearch)
  })
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedBookings = filteredBookings.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  )
  const confirmApproveBooking =
    bookings.find((booking) => booking.id === confirmApproveBookingId) ?? null
  const confirmRejectBooking =
    bookings.find((booking) => booking.id === confirmRejectBookingId) ?? null

  return (
    <div className="grid gap-4">
      {errorMessage ? <Alert title="Admin bookings unavailable">{errorMessage}</Alert> : null}

      <Card>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="m-0 text-xl font-semibold">Booking queue</h2>
            <p className="m-0 text-stone-500">
              Search bookings, filter by status, and review results page by page.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by booking ID, customer, email, car, city, or note"
            />

            <label className="grid gap-1 text-sm text-stone-500">
              <span className="font-semibold">Booking status</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as BookingStatus | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'ALL' ? 'All statuses' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-1 text-sm text-stone-500">
              <span className="font-semibold">Payment status</span>
              <Select
                value={paymentFilter}
                onValueChange={(value) => setPaymentFilter(value as PaymentStatus | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All payments" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'ALL' ? 'All payments' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="grid gap-2">
            <Badge>Loading</Badge>
            <h2 className="m-0 text-xl font-semibold">Booking queue</h2>
            <p className="m-0 text-stone-500">Loading booking requests and deposit states.</p>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="grid gap-2">
            <Badge variant="muted">No results</Badge>
            <h2 className="m-0 text-xl font-semibold">No matching bookings</h2>
            <p className="m-0 text-stone-500">
              Try changing the search text or clearing one of the filters.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {paginatedBookings.map((booking) => {
        const isBusy = actionBookingId === booking.id || savingNoteBookingId === booking.id
        const isSavingNote = savingNoteBookingId === booking.id
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
                <div className="flex flex-col gap-2 sm:flex-row">
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
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => handleSaveNote(booking.id)}
                  >
                    {isSavingNote ? 'Saving...' : 'Save note'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID' ? (
                  <Button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmApproveBookingId(booking.id)}
                  >
                    {isBusy ? 'Processing...' : 'Approve and confirm'}
                  </Button>
                ) : null}

                {booking.status === 'PENDING' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => setConfirmRejectBookingId(booking.id)}
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

      {!isLoading && filteredBookings.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-stone-500">
              Showing {filteredBookings.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}
              {' - '}
              {Math.min(safeCurrentPage * PAGE_SIZE, filteredBookings.length)} of{' '}
              {filteredBookings.length} bookings
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-stone-500">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {confirmRejectBooking ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Badge variant="danger">Confirm rejection</Badge>
                <h2 className="m-0 text-xl font-semibold">Reject this booking?</h2>
                <p className="m-0 text-stone-500">
                  {confirmRejectBooking.user.firstName} {confirmRejectBooking.user.lastName} for{' '}
                  {confirmRejectBooking.car.brand} {confirmRejectBooking.car.model}
                </p>
                <p className="m-0 text-sm text-stone-500">
                  This action will mark the booking as rejected. If the deposit was already paid,
                  the payment status will move to refund pending.
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 p-4 text-sm text-stone-600">
                <strong className="block text-stone-900">Current note</strong>
                <span>{notesById[confirmRejectBooking.id]?.trim() || 'No note added.'}</span>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={actionBookingId === confirmRejectBooking.id}
                  onClick={() => setConfirmRejectBookingId('')}
                >
                  Keep booking
                </Button>
                <Button
                  type="button"
                  disabled={actionBookingId === confirmRejectBooking.id}
                  onClick={async () => {
                    await runAction(confirmRejectBooking.id, rejectBooking)
                    setConfirmRejectBookingId('')
                  }}
                >
                  {actionBookingId === confirmRejectBooking.id ? 'Processing...' : 'Yes, reject'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {confirmApproveBooking ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Badge>Confirm approval</Badge>
                <h2 className="m-0 text-xl font-semibold">Approve this booking?</h2>
                <p className="m-0 text-stone-500">
                  {confirmApproveBooking.user.firstName} {confirmApproveBooking.user.lastName} for{' '}
                  {confirmApproveBooking.car.brand} {confirmApproveBooking.car.model}
                </p>
                <p className="m-0 text-sm text-stone-500">
                  This action will confirm the booking after branch review. The current admin note
                  will be kept with the approval.
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 p-4 text-sm text-stone-600">
                <strong className="block text-stone-900">Current note</strong>
                <span>{notesById[confirmApproveBooking.id]?.trim() || 'No note added.'}</span>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={actionBookingId === confirmApproveBooking.id}
                  onClick={() => setConfirmApproveBookingId('')}
                >
                  Not yet
                </Button>
                <Button
                  type="button"
                  disabled={actionBookingId === confirmApproveBooking.id}
                  onClick={async () => {
                    await runAction(confirmApproveBooking.id, approveBooking)
                    setConfirmApproveBookingId('')
                  }}
                >
                  {actionBookingId === confirmApproveBooking.id
                    ? 'Processing...'
                    : 'Yes, approve'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
