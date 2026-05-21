import { isAxiosError } from 'axios'
import type { BookingItem, BookingStatus, PaymentStatus } from '../bookings/types'

export const PAGE_SIZE = 5
export const BOOKING_STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]
export const PAYMENT_STATUS_OPTIONS: Array<PaymentStatus | 'ALL'> = [
  'ALL',
  'UNPAID',
  'DEPOSIT_PENDING',
  'DEPOSIT_PAID',
  'REFUND_PENDING',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
]

export function getAdminBookingsApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

export function formatAdminBookingDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

export function getAdminBookingStatusVariant(
  paymentStatus: PaymentStatus,
  status: BookingItem['status'],
) {
  if (paymentStatus === 'REFUND_PENDING' || paymentStatus === 'REFUNDED') {
    return 'danger' as const
  }

  if (status === 'APPROVED') {
    return 'default' as const
  }

  return 'muted' as const
}

export function getAdminBookingSummaryLabel(booking: BookingItem) {
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

export function matchesAdminBookingFilters({
  booking,
  normalizedSearch,
  paymentFilter,
  statusFilter,
}: {
  booking: BookingItem
  normalizedSearch: string
  paymentFilter: PaymentStatus | 'ALL'
  statusFilter: BookingStatus | 'ALL'
}) {
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
}
