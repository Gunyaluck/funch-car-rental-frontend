import { api } from '../../api/axios'
import type {
  BookingActionPayload,
  BookingItem,
  CreateBookingPayload,
  DepositCheckoutResult,
} from './types'

type ApiResponse<T> = {
  data: T
}

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post<ApiResponse<BookingItem>>('/bookings', payload)
  return response.data.data
}

export async function listMyBookings() {
  const response = await api.get<ApiResponse<BookingItem[]>>('/bookings/me')
  return response.data.data
}

export async function listAdminBookings() {
  const response = await api.get<ApiResponse<BookingItem[]>>('/bookings/admin')
  return response.data.data
}

export async function startDepositCheckout(bookingId: string) {
  const response = await api.post<ApiResponse<DepositCheckoutResult>>(
    `/bookings/${bookingId}/deposit/checkout`,
  )
  return response.data.data
}

export async function confirmDepositPayment(bookingId: string) {
  const response = await api.post<ApiResponse<BookingItem>>(
    `/bookings/${bookingId}/deposit/mock-confirm`,
  )
  return response.data.data
}

export async function cancelBooking(bookingId: string) {
  const response = await api.post<ApiResponse<BookingItem>>(`/bookings/${bookingId}/cancel`)
  return response.data.data
}

export async function approveBooking(bookingId: string, payload: BookingActionPayload = {}) {
  const response = await api.post<ApiResponse<BookingItem>>(
    `/bookings/${bookingId}/approve`,
    payload,
  )
  return response.data.data
}

export async function rejectBooking(bookingId: string, payload: BookingActionPayload = {}) {
  const response = await api.post<ApiResponse<BookingItem>>(
    `/bookings/${bookingId}/reject`,
    payload,
  )
  return response.data.data
}

export async function markBookingRefunded(
  bookingId: string,
  payload: BookingActionPayload = {},
) {
  const response = await api.post<ApiResponse<BookingItem>>(
    `/bookings/${bookingId}/refund/mark`,
    payload,
  )
  return response.data.data
}
