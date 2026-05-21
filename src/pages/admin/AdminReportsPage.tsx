import { Download, Globe2, ReceiptText, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { listAdminBookings } from '../../features/bookings/api'
import type { BookingItem, BookingStatus } from '../../features/bookings/types'
import { getCountryName } from '../../features/cars/country-names'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'

const STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
]

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function formatDateTime(value: string, timezone?: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(new Date(value))
}

export function AdminReportsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [countryFilter, setCountryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function fetchReportsData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await listAdminBookings()

        if (isCurrent) {
          setBookings(result)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load reports right now.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    fetchReportsData()

    return () => {
      isCurrent = false
    }
  }, [])

  const countryOptions = useMemo(
    () =>
      Array.from(new Set(bookings.map((booking) => booking.car.countryCode)))
        .sort()
        .map((countryCode) => ({
          code: countryCode,
          label: getCountryName(countryCode),
        })),
    [bookings],
  )

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return bookings.filter((booking) => {
      if (countryFilter !== 'ALL' && booking.car.countryCode !== countryFilter) {
        return false
      }

      if (statusFilter !== 'ALL' && booking.status !== statusFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        booking.id,
        booking.user.firstName,
        booking.user.lastName,
        booking.user.email,
        booking.car.brand,
        booking.car.model,
        booking.car.city,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [bookings, countryFilter, searchTerm, statusFilter])

  const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.grandTotal, 0)
  const totalDeposits = filteredBookings.reduce((sum, booking) => sum + booking.depositAmount, 0)
  const approvedCount = filteredBookings.filter((booking) => booking.status === 'APPROVED').length
  const approvalRate = filteredBookings.length
    ? Math.round((approvedCount / filteredBookings.length) * 100)
    : 0
  const groupedByCountry = countryOptions
    .map((country) => ({
      ...country,
      bookings: filteredBookings.filter((booking) => booking.car.countryCode === country.code),
    }))
    .filter((country) => country.bookings.length > 0)
    .map((country) => ({
      code: country.code,
      label: country.label,
      count: country.bookings.length,
      revenue: country.bookings.reduce((sum, booking) => sum + booking.grandTotal, 0),
    }))
    .sort((a, b) => b.count - a.count)
  const recentRows = [...filteredBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return (
    <div className="grid gap-5">
      {errorMessage ? <Alert title="Reports unavailable">{errorMessage}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-forest-700/10 text-forest-700">
              <ReceiptText className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{filteredBookings.length}</strong>
            <span className="text-sm font-semibold text-stone-700">Bookings in scope</span>
            <p className="m-0 text-sm text-stone-500">Current filtered booking scope.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-forest-700/10 text-forest-700">
              <ShieldCheck className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{approvalRate}%</strong>
            <span className="text-sm font-semibold text-stone-700">Approval rate</span>
            <p className="m-0 text-sm text-stone-500">Approved bookings divided by all filtered bookings.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-clay-600/10 text-clay-700">
              <Globe2 className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{groupedByCountry.length}</strong>
            <span className="text-sm font-semibold text-stone-700">Countries</span>
            <p className="m-0 text-sm text-stone-500">Distinct booking markets in the filtered set.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-black/5 text-forest-900">
              <Download className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{formatMoney('THB', totalRevenue)}</strong>
            <span className="text-sm font-semibold text-stone-700">Revenue snapshot</span>
            <p className="m-0 text-sm text-stone-500">
              Deposits {formatMoney('THB', totalDeposits)} in the same filtered scope.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="m-0 text-xl font-semibold">Filterable analytics</h2>
            <p className="m-0 text-stone-500">
              Narrow the report by market, booking status, or search terms from the latest activity.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by booking ID, customer, email, car, or city"
            />

            <label className="grid gap-1 text-sm text-stone-500">
              <span className="font-semibold">Country</span>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All countries</SelectItem>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

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
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'ALL' ? 'All statuses' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                className="inline-flex items-center rounded-2xl border border-black/12 bg-white/60 px-4 py-[11px] font-semibold text-forest-900 transition hover:-translate-y-px"
                onClick={() => {
                  setCountryFilter('ALL')
                  setStatusFilter('ALL')
                  setSearchTerm('')
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="grid min-h-[220px] place-items-center text-stone-500">
            Loading reports...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
          <div className="grid gap-5">
            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge>Summary</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Booking summary report</h2>
                </div>

                <div className="grid gap-3">
                  {groupedByCountry.length === 0 ? (
                    <p className="m-0 text-stone-500">No report rows match the current filters.</p>
                  ) : (
                    groupedByCountry.map((country) => (
                      <div
                        key={country.code}
                        className="flex items-center justify-between rounded-2xl bg-white/60 p-4"
                      >
                        <div>
                          <strong>{country.label}</strong>
                          <p className="m-0 text-sm text-stone-500">{country.count} bookings</p>
                        </div>
                        <strong>{formatMoney('THB', country.revenue)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Recent rows</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Latest filtered bookings</h2>
                </div>

                <div className="grid gap-3">
                  {recentRows.map((booking) => (
                    <div key={booking.id} className="grid gap-1 rounded-2xl bg-white/60 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <strong>
                          {booking.user.firstName} {booking.user.lastName}
                        </strong>
                        <Badge variant={booking.status === 'APPROVED' ? 'success' : 'muted'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-stone-500">
                        {getCountryName(booking.car.countryCode)} · {booking.car.city} ·{' '}
                        {booking.car.brand} {booking.car.model}
                      </span>
                      <span className="text-sm text-stone-500">
                        Created {formatDateTime(booking.createdAt)} · Pickup{' '}
                        {formatDateTime(booking.pickupAt, booking.pickupTimezone)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 self-start xl:sticky xl:top-6">
            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Export</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Operational exports</h2>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>Snapshot currently on screen</strong>
                    <p className="m-0 text-stone-500">
                      Use the filters above, then capture this view for management review.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>Revenue summary</strong>
                    <p className="m-0 text-stone-500">
                      {formatMoney('THB', totalRevenue)} total revenue with {formatMoney('THB', totalDeposits)} deposits.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>Approval summary</strong>
                    <p className="m-0 text-stone-500">
                      {approvedCount} approved bookings out of {filteredBookings.length}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Slices</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Operational highlights</h2>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>{filteredBookings.filter((booking) => booking.paymentStatus === 'REFUND_PENDING').length} refunds pending</strong>
                    <p className="m-0 text-stone-500">Needs finance or branch follow-up.</p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>{filteredBookings.filter((booking) => booking.status === 'PENDING').length} pending bookings</strong>
                    <p className="m-0 text-stone-500">Still waiting for payment or approval.</p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>{filteredBookings.filter((booking) => booking.status === 'COMPLETED').length} completed bookings</strong>
                    <p className="m-0 text-stone-500">Useful for service quality and repeat customer review.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
