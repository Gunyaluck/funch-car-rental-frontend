import { api } from '../../api/axios'
import type { AuthUser } from '../auth/types'

type ApiResponse<T> = {
  data: T
}

export type UpdateProfilePayload = {
  firstName: string
  lastName: string
  phone: string | null
  countryCode: string
  timezone?: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export async function getMyProfile() {
  const response = await api.get<ApiResponse<AuthUser> | AuthUser>('/users/me')
  return 'data' in response.data ? response.data.data : response.data
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const response = await api.patch<ApiResponse<AuthUser> | AuthUser>('/users/me', payload)
  return 'data' in response.data ? response.data.data : response.data
}

export async function changeMyPassword(payload: ChangePasswordPayload) {
  await api.patch<ApiResponse<{ updated: boolean }> | { updated: boolean }>(
    '/users/me/password',
    payload,
  )
}
