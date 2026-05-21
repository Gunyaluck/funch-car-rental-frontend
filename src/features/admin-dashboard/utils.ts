import type { BookingItem, BookingStatus } from '../bookings/types'
import { getCountryName } from '../cars/country-names'
import type { ChartItem } from './types'

export const STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
]

export function getAdminDashboardApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function formatAdminDashboardDateTime(value: string, timezone?: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(new Date(value))
}

export function getAdminDashboardBookingLabel(booking: BookingItem) {
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

export function exportAdminDashboardCsv(bookings: BookingItem[]) {
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
    ...bookings.map((booking) => [
      booking.id,
      booking.status,
      booking.paymentStatus,
      `${booking.user.firstName} ${booking.user.lastName}`,
      booking.user.email,
      booking.user.phone ?? '',
      getCountryName(booking.car.countryCode),
      booking.car.city,
      `${booking.car.brand} ${booking.car.model}`,
      formatAdminDashboardDateTime(booking.createdAt),
      formatAdminDashboardDateTime(booking.pickupAt, booking.pickupTimezone),
      formatAdminDashboardDateTime(booking.returnAt, booking.pickupTimezone),
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

export function buildBookingStatusChart(bookings: BookingItem[]): ChartItem[] {
  return [
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
}

export function buildBookingTrendChart(bookings: BookingItem[]): ChartItem[] {
  return Array.from({ length: 7 }, (_, index) => {
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
}
