import { useEffect, useState } from 'react'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import {
  AdminBookingCard,
} from '../../features/bookings/AdminBookingCard'
import {
  AdminBookingConfirmDialog,
} from '../../features/bookings/AdminBookingConfirmDialog'
import {
  AdminBookingsFiltersCard,
} from '../../features/bookings/AdminBookingsFiltersCard'
import {
  approveBooking,
  listAdminBookings,
  markBookingRefunded,
  rejectBooking,
  saveBookingAdminNote,
} from '../../features/bookings/api'
import type { BookingItem, BookingStatus, PaymentStatus } from '../../features/bookings/types'
import {
  getAdminBookingsApiErrorMessage,
  matchesAdminBookingFilters,
  PAGE_SIZE,
} from '../../features/bookings/admin-bookings-utils'

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
          setErrorMessage(getAdminBookingsApiErrorMessage(error, 'Unable to load admin bookings.'))
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
      setErrorMessage(getAdminBookingsApiErrorMessage(error, 'Unable to update this booking.'))
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
      setErrorMessage(getAdminBookingsApiErrorMessage(error, 'Unable to save this note.'))
    } finally {
      setSavingNoteBookingId('')
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredBookings = bookings.filter((booking) =>
    matchesAdminBookingFilters({
      booking,
      normalizedSearch,
      paymentFilter,
      statusFilter,
    }),
  )
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

      <AdminBookingsFiltersCard
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onPaymentFilterChange={setPaymentFilter}
      />

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
          <AdminBookingCard
            key={booking.id}
            booking={booking}
            note={note}
            isBusy={isBusy}
            isSavingNote={isSavingNote}
            onNoteChange={(value) =>
              setNotesById((currentNotes) => ({
                ...currentNotes,
                [booking.id]: value,
              }))
            }
            onSaveNote={() => handleSaveNote(booking.id)}
            onApprove={() => setConfirmApproveBookingId(booking.id)}
            onReject={() => setConfirmRejectBookingId(booking.id)}
            onMarkRefundCompleted={() => runAction(booking.id, markBookingRefunded)}
          />
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

      <AdminBookingConfirmDialog
        booking={confirmRejectBooking}
        badgeLabel="Confirm rejection"
        badgeVariant="danger"
        title="Reject this booking?"
        description="This action will mark the booking as rejected. If the deposit was already paid, the payment status will move to refund pending."
        currentNote={confirmRejectBooking ? notesById[confirmRejectBooking.id]?.trim() || '' : ''}
        cancelLabel="Keep booking"
        confirmLabel="Yes, reject"
        isBusy={actionBookingId === confirmRejectBooking?.id}
        onCancel={() => setConfirmRejectBookingId('')}
        onConfirm={async () => {
          if (!confirmRejectBooking) {
            return
          }

          await runAction(confirmRejectBooking.id, rejectBooking)
          setConfirmRejectBookingId('')
        }}
      />

      <AdminBookingConfirmDialog
        booking={confirmApproveBooking}
        badgeLabel="Confirm approval"
        title="Approve this booking?"
        description="This action will confirm the booking after branch review. The current admin note will be kept with the approval."
        currentNote={confirmApproveBooking ? notesById[confirmApproveBooking.id]?.trim() || '' : ''}
        cancelLabel="Not yet"
        confirmLabel="Yes, approve"
        isBusy={actionBookingId === confirmApproveBooking?.id}
        onCancel={() => setConfirmApproveBookingId('')}
        onConfirm={async () => {
          if (!confirmApproveBooking) {
            return
          }

          await runAction(confirmApproveBooking.id, approveBooking)
          setConfirmApproveBookingId('')
        }}
      />
    </div>
  )
}
