import { isAxiosError } from 'axios'
import type { BookingItem, BookingStatus, PaymentStatus } from './types'

export function getMyBookingsApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

export function formatMyBookingDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

export function getMyBookingStatusVariant(status: BookingStatus, paymentStatus: PaymentStatus) {
  if (paymentStatus === 'REFUND_PENDING' || paymentStatus === 'REFUNDED') {
    return 'danger' as const
  }

  if (status === 'REJECTED' || status === 'CANCELLED') {
    return 'danger' as const
  }

  if (status === 'APPROVED' || status === 'COMPLETED') {
    return 'default' as const
  }

  return 'muted' as const
}

export function getMyBookingHeadline(booking: BookingItem) {
  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING') {
    return 'Deposit required'
  }

  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID') {
    return 'Awaiting confirmation'
  }

  if (booking.status === 'APPROVED') {
    return 'Confirmed by branch'
  }

  if (booking.paymentStatus === 'REFUND_PENDING') {
    return 'Refund pending'
  }

  if (booking.paymentStatus === 'REFUNDED') {
    return 'Refund completed'
  }

  if (booking.paymentStatus === 'EXPIRED') {
    return 'Deposit window expired'
  }

  return booking.status
}

export function getMyBookingMessage(booking: BookingItem) {
  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING') {
    return 'Pay the deposit to move this booking into the confirmation queue.'
  }

  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID') {
    return 'Your booking is awaiting confirmation.'
  }

  if (booking.status === 'APPROVED') {
    return 'Branch confirmed the booking. Bring these details on pickup day.'
  }

  if (booking.status === 'REJECTED' && booking.paymentStatus === 'REFUND_PENDING') {
    return 'The branch could not confirm this booking. Refund still needs to be processed.'
  }

  if (booking.status === 'CANCELLED' && booking.paymentStatus === 'REFUND_PENDING') {
    return 'This booking was cancelled in time. Refund still needs to be processed.'
  }

  if (booking.paymentStatus === 'REFUNDED') {
    return 'The deposit has been marked as refunded.'
  }

  if (booking.paymentStatus === 'EXPIRED') {
    return 'The deposit was not paid before the payment window closed.'
  }

  return 'Track confirmation, payment progress, and any admin notes here.'
}

export function canPayMyBookingDeposit(booking: BookingItem) {
  return booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING'
}

export function canCancelMyBooking(booking: BookingItem) {
  return booking.canCancel && ['PENDING', 'APPROVED'].includes(booking.status)
}
