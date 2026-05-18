import { api } from '../../api/axios'
import type { BookingItem, CreateBookingPayload } from './types'

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
