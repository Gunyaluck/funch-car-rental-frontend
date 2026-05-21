import { Activity, CarFront, CircleDollarSign, Clock3, Globe2, ReceiptText, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MiniBarChart, MiniLineChart } from '../../features/admin-dashboard/AdminDashboardCharts'
import { AdminDashboardFiltersCard } from '../../features/admin-dashboard/AdminDashboardFiltersCard'
import { AdminDashboardMetricCard } from '../../features/admin-dashboard/AdminDashboardMetricCard'
import type { ChartItem } from '../../features/admin-dashboard/types'
import {
  buildBookingStatusChart,
  buildBookingTrendChart,
  exportAdminDashboardCsv,
  formatAdminDashboardDateTime,
  getAdminDashboardApiErrorMessage,
  getAdminDashboardBookingLabel,
} from '../../features/admin-dashboard/utils'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { listAdminBookings } from '../../features/bookings/api'
import type { BookingItem, BookingStatus } from '../../features/bookings/types'
import { listCars } from '../../features/cars/api'
import { defaultCarFilters } from '../../features/cars/constants'
import { getCountryName } from '../../features/cars/country-names'
import type { CarListItem } from '../../features/cars/types'
import { formatMoney } from '../../features/cars/utils/car-detail-utils'
import { listAdminMembers, type AdminMemberItem } from '../../features/users/admin-api'

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

        setErrorMessage(getAdminDashboardApiErrorMessage(error, 'Unable to load dashboard data right now.'))
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
  const bookingStatusChart = buildBookingStatusChart(bookings)
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
  const bookingTrendChart = buildBookingTrendChart(bookings)
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

  return (
    <div className="grid gap-5">
      {errorMessage ? <Alert title="Dashboard unavailable">{errorMessage}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminDashboardMetricCard icon={Clock3} iconClassName="bg-forest-700/10 text-forest-700" value={String(pendingApprovalBookings.length)} label="Pending approvals" description="Deposits paid and waiting for staff confirmation." />
        <AdminDashboardMetricCard icon={CarFront} iconClassName="bg-clay-600/10 text-clay-700" value={String(activeCars)} label="Cars available" description={`${maintenanceCars} in maintenance, ${retiredCars} retired.`} />
        <AdminDashboardMetricCard icon={CircleDollarSign} iconClassName="bg-forest-700/10 text-forest-700" value={formatMoney('THB', totalDepositsPaid)} label="Deposits collected" description="Snapshot from paid, refund-pending, and refunded bookings." />
        <AdminDashboardMetricCard icon={Users} iconClassName="bg-black/5 text-forest-900" value={String(members.length)} label="Members" description={`${activeMembers} active, ${suspendedMembers} suspended.`} />
        <AdminDashboardMetricCard icon={ReceiptText} iconClassName="bg-forest-700/10 text-forest-700" value={String(filteredBookings.length)} label="Bookings in scope" description="Current filtered booking scope." />
        <AdminDashboardMetricCard icon={ShieldCheck} iconClassName="bg-forest-700/10 text-forest-700" value={`${approvalRate}%`} label="Approval rate" description="Approved bookings divided by all filtered bookings." />
        <AdminDashboardMetricCard icon={Globe2} iconClassName="bg-clay-600/10 text-clay-700" value={String(groupedByCountry.length)} label="Countries" description="Distinct booking markets in the filtered set." />
        <AdminDashboardMetricCard icon={CircleDollarSign} iconClassName="bg-black/5 text-forest-900" value={formatMoney('THB', totalRevenue)} label="Revenue snapshot" description={`Deposits ${formatMoney('THB', totalDeposits)} in the same filtered scope.`} />
      </div>

      <AdminDashboardFiltersCard
        searchTerm={searchTerm}
        countryFilter={countryFilter}
        statusFilter={statusFilter}
        countryOptions={countryOptions}
        onSearchTermChange={setSearchTerm}
        onCountryFilterChange={setCountryFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={() => {
          setCountryFilter('ALL')
          setStatusFilter('ALL')
          setSearchTerm('')
        }}
        onExportCsv={() => exportAdminDashboardCsv(filteredBookings)}
      />

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
                          <Badge variant="success">{getAdminDashboardBookingLabel(booking)}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                          <span>Pickup {formatAdminDashboardDateTime(booking.pickupAt, booking.pickupTimezone)}</span>
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
                          {getAdminDashboardBookingLabel(booking)}
                        </Badge>
                      </div>
                      <span className="text-sm text-stone-500">
                        {booking.car.brand} {booking.car.model} · Created {formatAdminDashboardDateTime(booking.createdAt)}
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
                        Created {formatAdminDashboardDateTime(booking.createdAt)} · Pickup{' '}
                        {formatAdminDashboardDateTime(booking.pickupAt, booking.pickupTimezone)}
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
