import { Activity, CarFront, CircleDollarSign, Clock3, Globe2, ReceiptText, ShieldCheck, Users } from 'lucide-react'
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
import { listCars } from '../../features/cars/api'
import { defaultCarFilters } from '../../features/cars/constants'
import { getCountryName } from '../../features/cars/country-names'
import type { CarListItem } from '../../features/cars/types'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'
import { listAdminMembers, type AdminMemberItem } from '../../features/users/admin-api'

type ChartItem = {
  label: string
  value: number
  color: string
}

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

function getBookingLabel(booking: BookingItem) {
  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID') {
    return 'Ready for approval'
  }

  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING') {
    return 'Waiting for deposit'
  }

  if (booking.paymentStatus === 'REFUND_PENDING') {
    return 'Refund pending'
  }

  return booking.status
}

function escapeCsvValue(value: string | number | null | undefined) {
  const normalized = value == null ? '' : String(value)
  return `"${normalized.replaceAll('"', '""')}"`
}

function MiniBarChart({ items }: { items: ChartItem[] }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-stone-700">{item.label}</span>
            <span className="text-stone-500">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniLineChart({ items }: { items: ChartItem[] }) {
  const width = 360
  const height = 140
  const padding = 18
  const maxValue = Math.max(...items.map((item) => item.value), 1)
  const stepX = items.length > 1 ? (width - padding * 2) / (items.length - 1) : 0
  const points = items.map((item, index) => {
    const x = padding + index * stepX
    const y = height - padding - ((item.value / maxValue) * (height - padding * 2))
    return { ...item, x, y }
  })
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? padding} ${height - padding} L ${
    points[0]?.x ?? padding
  } ${height - padding} Z`

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-[24px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(244,239,228,0.58))] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
          <defs>
            <linearGradient id="dashboardTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(35,88,63,0.32)" />
              <stop offset="100%" stopColor="rgba(35,88,63,0.04)" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={padding + ratio * (height - padding * 2)}
              y2={padding + ratio * (height - padding * 2)}
              stroke="rgba(0,0,0,0.08)"
              strokeDasharray="4 6"
            />
          ))}
          <path d={areaPath} fill="url(#dashboardTrendFill)" />
          <path d={linePath} fill="none" stroke="rgb(35,88,63)" strokeWidth="3" strokeLinecap="round" />
          {points.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="rgb(35,88,63)" />
              <text x={point.x} y={height - 2} textAnchor="middle" fontSize="10" fill="rgb(120,113,108)">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [cars, setCars] = useState<CarListItem[]>([])
  const [members, setMembers] = useState<AdminMemberItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [countryFilter, setCountryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadDashboard() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [bookingResult, carResult, memberResult] = await Promise.all([
          listAdminBookings(),
          listCars(defaultCarFilters, 100),
          listAdminMembers(),
        ])

        if (!isCurrent) {
          return
        }

        setBookings(bookingResult)
        setCars(carResult.data)
        setMembers(memberResult)
      } catch (error) {
        if (!isCurrent) {
          return
        }

        setErrorMessage(getApiErrorMessage(error, 'Unable to load dashboard data right now.'))
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isCurrent = false
    }
  }, [])

  const pendingApprovalBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID',
      ),
    [bookings],
  )
  const urgentPendingBookings = useMemo(
    () =>
      [...pendingApprovalBookings]
        .sort((a, b) => new Date(a.pickupAt).getTime() - new Date(b.pickupAt).getTime())
        .slice(0, 5),
    [pendingApprovalBookings],
  )
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
  const refundPendingBookings = bookings.filter((booking) => booking.paymentStatus === 'REFUND_PENDING')
  const activeCars = cars.filter((car) => car.status === 'AVAILABLE').length
  const maintenanceCars = cars.filter((car) => car.status === 'MAINTENANCE').length
  const retiredCars = cars.filter((car) => car.status === 'RETIRED').length
  const activeMembers = members.filter((member) => member.status === 'ACTIVE').length
  const suspendedMembers = members.filter((member) => member.status === 'SUSPENDED').length
  const totalDepositsPaid = bookings
    .filter((booking) => booking.paymentStatus === 'DEPOSIT_PAID' || booking.paymentStatus === 'REFUND_PENDING' || booking.paymentStatus === 'REFUNDED')
    .reduce((sum, booking) => sum + booking.depositAmount, 0)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
  const bookingsByCountry = [...new Map(
    bookings.map((booking) => [booking.car.countryCode, 0]),
  ).keys()].map((countryCode) => ({
    countryCode,
    count: bookings.filter((booking) => booking.car.countryCode === countryCode).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5)
  const bookingStatusChart: ChartItem[] = [
    {
      label: 'Pending',
      value: bookings.filter((booking) => booking.status === 'PENDING').length,
      color: 'rgb(168 85 247)',
    },
    {
      label: 'Approved',
      value: bookings.filter((booking) => booking.status === 'APPROVED').length,
      color: 'rgb(35 88 63)',
    },
    {
      label: 'Rejected',
      value: bookings.filter((booking) => booking.status === 'REJECTED').length,
      color: 'rgb(220 38 38)',
    },
    {
      label: 'Cancelled',
      value: bookings.filter((booking) => booking.status === 'CANCELLED').length,
      color: 'rgb(120 113 108)',
    },
  ]
  const fleetStatusChart: ChartItem[] = [
    { label: 'Available', value: activeCars, color: 'rgb(35 88 63)' },
    { label: 'Maintenance', value: maintenanceCars, color: 'rgb(220 38 38)' },
    { label: 'Retired', value: retiredCars, color: 'rgb(120 113 108)' },
  ]
  const memberStatusChart: ChartItem[] = [
    { label: 'Active', value: activeMembers, color: 'rgb(35 88 63)' },
    { label: 'Suspended', value: suspendedMembers, color: 'rgb(220 38 38)' },
    {
      label: 'Deleted',
      value: members.filter((member) => member.status === 'DELETED').length,
      color: 'rgb(120 113 108)',
    },
  ]
  const bookingTrendChart: ChartItem[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const iso = date.toISOString().slice(0, 10)
    const label = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)

    return {
      label,
      value: bookings.filter((booking) => booking.createdAt.slice(0, 10) === iso).length,
      color: 'rgb(35 88 63)',
    }
  })
  const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.grandTotal, 0)
  const totalDeposits = filteredBookings.reduce((sum, booking) => sum + booking.depositAmount, 0)
  const approvedCount = filteredBookings.filter((booking) => booking.status === 'APPROVED').length
  const approvalRate = filteredBookings.length ? Math.round((approvedCount / filteredBookings.length) * 100) : 0
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

  function handleExportCsv() {
    const rows = [
      [
        'Booking ID',
        'Status',
        'Payment status',
        'Customer name',
        'Customer email',
        'Phone',
        'Country',
        'City',
        'Car',
        'Created at',
        'Pickup at',
        'Return at',
        'Deposit amount',
        'Grand total',
        'Admin note',
      ],
      ...filteredBookings.map((booking) => [
        booking.id,
        booking.status,
        booking.paymentStatus,
        `${booking.user.firstName} ${booking.user.lastName}`,
        booking.user.email,
        booking.user.phone ?? '',
        getCountryName(booking.car.countryCode),
        booking.car.city,
        `${booking.car.brand} ${booking.car.model}`,
        formatDateTime(booking.createdAt),
        formatDateTime(booking.pickupAt, booking.pickupTimezone),
        formatDateTime(booking.returnAt, booking.pickupTimezone),
        booking.depositAmount,
        booking.grandTotal,
        booking.adminNote ?? '',
      ]),
    ]

    const csv = rows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateLabel = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `admin-dashboard-bookings-${dateLabel}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-5">
      {errorMessage ? <Alert title="Dashboard unavailable">{errorMessage}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-forest-700/10 text-forest-700">
              <Clock3 className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{pendingApprovalBookings.length}</strong>
            <span className="text-sm font-semibold text-stone-700">Pending approvals</span>
            <p className="m-0 text-sm text-stone-500">
              Deposits paid and waiting for staff confirmation.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-clay-600/10 text-clay-700">
              <CarFront className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{activeCars}</strong>
            <span className="text-sm font-semibold text-stone-700">Cars available</span>
            <p className="m-0 text-sm text-stone-500">
              {maintenanceCars} in maintenance, {retiredCars} retired.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-forest-700/10 text-forest-700">
              <CircleDollarSign className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{formatMoney('THB', totalDepositsPaid)}</strong>
            <span className="text-sm font-semibold text-stone-700">Deposits collected</span>
            <p className="m-0 text-sm text-stone-500">
              Snapshot from paid, refund-pending, and refunded bookings.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-black/5 text-forest-900">
              <Users className="size-5" />
            </span>
            <strong className="text-3xl leading-none">{members.length}</strong>
            <span className="text-sm font-semibold text-stone-700">Members</span>
            <p className="m-0 text-sm text-stone-500">
              {activeMembers} active, {suspendedMembers} suspended.
            </p>
          </CardContent>
        </Card>
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
              <CircleDollarSign className="size-5" />
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
            <Badge variant="muted">Filters</Badge>
            <h2 className="m-0 text-xl font-semibold">Filterable analytics</h2>
            <p className="m-0 text-stone-500">
              Narrow the dashboard by market, booking status, or the latest booking activity.
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

            <div className="flex items-end gap-2">
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
              <button
                type="button"
                className="inline-flex items-center rounded-2xl border border-black/12 bg-forest-900 px-4 py-[11px] font-semibold text-sand-50 transition hover:-translate-y-px"
                onClick={handleExportCsv}
              >
                Export CSV
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="grid min-h-[220px] place-items-center text-stone-500">
            Loading dashboard...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="grid gap-5">
            <Card>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge>Queue</Badge>
                    <h2 className="m-0 mt-2 text-xl font-semibold">Urgent approvals</h2>
                  </div>
                  <span className="text-sm text-stone-500">{urgentPendingBookings.length} shown</span>
                </div>

                {urgentPendingBookings.length === 0 ? (
                  <p className="m-0 text-stone-500">No approval items are waiting right now.</p>
                ) : (
                  <div className="grid gap-3">
                    {urgentPendingBookings.map((booking) => (
                      <div key={booking.id} className="grid gap-2 rounded-2xl bg-white/60 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <strong>
                              {booking.user.firstName} {booking.user.lastName}
                            </strong>
                            <p className="m-0 text-sm text-stone-500">
                              {booking.car.brand} {booking.car.model} · {booking.car.city}
                            </p>
                          </div>
                          <Badge variant="success">{getBookingLabel(booking)}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                          <span>Pickup {formatDateTime(booking.pickupAt, booking.pickupTimezone)}</span>
                          <span>{formatMoney(booking.currencyCode, booking.depositAmount)} deposit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Analytics</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Booking status mix</h2>
                </div>
                <MiniBarChart items={bookingStatusChart} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Operations</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Recent booking activity</h2>
                </div>

                <div className="grid gap-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="grid gap-1 rounded-2xl bg-white/60 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <strong>
                          {booking.user.firstName} {booking.user.lastName}
                        </strong>
                        <Badge variant={booking.paymentStatus === 'REFUND_PENDING' ? 'danger' : 'muted'}>
                          {getBookingLabel(booking)}
                        </Badge>
                      </div>
                      <span className="text-sm text-stone-500">
                        {booking.car.brand} {booking.car.model} · Created {formatDateTime(booking.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Trend</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">New bookings in the last 7 days</h2>
                </div>
                <MiniLineChart items={bookingTrendChart} />
              </CardContent>
            </Card>

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
                  <Badge variant="muted">Fleet</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Vehicle availability</h2>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>{activeCars} available cars</strong>
                    <p className="m-0 text-stone-500">Ready to accept new bookings.</p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>{maintenanceCars} maintenance blocks</strong>
                    <p className="m-0 text-stone-500">Cars temporarily removed from inventory.</p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>{retiredCars} retired vehicles</strong>
                    <p className="m-0 text-stone-500">Archived fleet entries not offered for booking.</p>
                  </div>
                </div>
                <MiniBarChart items={fleetStatusChart} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Revenue</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Country mix and refunds</h2>
                </div>
                <div className="grid gap-3">
                  {bookingsByCountry.map((item) => (
                    <div key={item.countryCode} className="flex items-center justify-between rounded-2xl bg-white/60 p-4">
                      <span>{getCountryName(item.countryCode)}</span>
                      <strong>{item.count} bookings</strong>
                    </div>
                  ))}
                  <div className="rounded-2xl bg-white/60 p-4">
                    <strong>{refundPendingBookings.length} refunds pending</strong>
                    <p className="m-0 text-stone-500">Bookings that still need refund completion follow-up.</p>
                  </div>
                </div>
                <MiniBarChart
                  items={bookingsByCountry.map((item) => ({
                    label: getCountryName(item.countryCode),
                    value: item.count,
                    color: 'rgb(167 139 250)',
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant="muted">Members</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Account health</h2>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-4">
                    <Users className="size-5 text-forest-700" />
                    <div>
                      <strong>{activeMembers} active members</strong>
                      <p className="m-0 text-stone-500">Can access the booking flow normally.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-4">
                    <Activity className="size-5 text-red-600" />
                    <div>
                      <strong>{suspendedMembers} suspended members</strong>
                      <p className="m-0 text-stone-500">Need staff review before being reactivated.</p>
                    </div>
                  </div>
                </div>
                <MiniBarChart items={memberStatusChart} />
              </CardContent>
            </Card>

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
