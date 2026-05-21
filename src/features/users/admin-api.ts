import { api } from '../../api/axios'

export type AdminMemberItem = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  countryCode: string
  timezone: string
  currencyCode: string
  role: 'CUSTOMER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  emailVerifiedAt: string | null
  createdAt: string
  bookingCount: number
  activeBookingCount: number
}

type ApiResponse<T> = {
  data: T
  meta?: {
    count?: number
  }
}

export async function listAdminMembers() {
  const response = await api.get<ApiResponse<AdminMemberItem[]>>('/users')
  return response.data.data
}

export async function updateAdminMemberStatus(
  memberId: string,
  status: 'ACTIVE' | 'SUSPENDED',
) {
  const response = await api.patch<ApiResponse<AdminMemberItem>>(`/users/${memberId}/status`, {
    status,
  })
  return response.data.data
}
