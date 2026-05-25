import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableContainer,
  AdminDataTableHead,
  AdminDataTableHeaderCell,
  AdminDataTableRow,
} from '../../components/ui/admin-data-table'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import {
  AdminBookingsFiltersCard,
} from '../../features/bookings/AdminBookingsFiltersCard'
import {
  listAdminBookings,
} from '../../features/bookings/api'
import type { BookingItem, BookingStatus, PaymentStatus } from '../../features/bookings/types'
import {
  formatAdminBookingDateTime,
  getAdminBookingsApiErrorMessage,
  getAdminBookingStatusVariant,
  getAdminBookingSummaryLabel,
  matchesAdminBookingFilters,
  PAGE_SIZE,
} from '../../features/bookings/admin-bookings-utils'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'

export function AdminBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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

  return (
    <div className="grid gap-4">
      {errorMessage ? <Alert title="Admin bookings unavailable">{errorMessage}</Alert> : null}

      <AdminBookingsFiltersCard
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        onSearchTermChange={(value) => {
          setSearchTerm(value)
          setCurrentPage(1)
        }}
        onStatusFilterChange={(value) => {
          setStatusFilter(value)
          setCurrentPage(1)
        }}
        onPaymentFilterChange={(value) => {
          setPaymentFilter(value)
          setCurrentPage(1)
        }}
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

      {!isLoading && paginatedBookings.length > 0 ? (
        <Card>
          <CardContent className="grid gap-4">
            <div>
              <h2 className="m-0 text-xl font-semibold">Booking queue</h2>
              <p className="m-0 text-stone-500">
                Keep the table lean, then open the full booking on row click.
              </p>
            </div>

            <AdminDataTableContainer>
              <AdminDataTable>
                <AdminDataTableHead>
                  <tr>
                    <AdminDataTableHeaderCell>Customer</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Car</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Pickup</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Deposit</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Status</AdminDataTableHeaderCell>
                  </tr>
                </AdminDataTableHead>
                <AdminDataTableBody>
                  {paginatedBookings.map((booking) => (
                    <AdminDataTableRow
                      key={booking.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/admin/bookings/${booking.id}`)
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      <AdminDataTableCell className="min-w-[220px]">
                        <div className="grid gap-1">
                          <div className="font-semibold text-forest-900">
                            {booking.user.firstName} {booking.user.lastName}
                          </div>
                          <div className="text-sm text-stone-500">{booking.user.email}</div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>
                        <div className="grid gap-1">
                          <div className="font-semibold text-forest-900">
                            {booking.car.brand} {booking.car.model}
                          </div>
                          <div className="text-sm text-stone-500">{booking.car.city}</div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>
                        {formatAdminBookingDateTime(booking.pickupAt, booking.pickupTimezone)}
                      </AdminDataTableCell>
                      <AdminDataTableCell>
                        {formatMoney(booking.currencyCode, booking.depositAmount)}
                      </AdminDataTableCell>
                      <AdminDataTableCell className="min-w-[190px]">
                        <div className="grid gap-2">
                          <Badge
                            variant={getAdminBookingStatusVariant(
                              booking.paymentStatus,
                              booking.status,
                            )}
                          >
                            {getAdminBookingSummaryLabel(booking)}
                          </Badge>
                          <div className="text-sm text-stone-500">
                            {booking.status} · {booking.paymentStatus}
                          </div>
                        </div>
                      </AdminDataTableCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
            </AdminDataTableContainer>
          </CardContent>
        </Card>
      ) : null}

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
              <button
                type="button"
                className="inline-flex items-center rounded-2xl border border-black/12 bg-white/60 px-4 py-[11px] font-semibold text-forest-900 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-stone-500">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="inline-flex items-center rounded-2xl border border-black/12 bg-white/60 px-4 py-[11px] font-semibold text-forest-900 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
