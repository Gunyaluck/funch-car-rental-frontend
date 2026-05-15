import { api } from '../../api/axios'
import type { AuthSession, LoginPayload, RegisterPayload } from './types'

type ApiResponse<T> = {
  data: T
}

type AuthResponse = AuthSession & {
  token?: string
}

function normalizeAuthSession(response: AuthResponse): AuthSession {
  return {
    accessToken: response.accessToken ?? response.token ?? '',
    user: response.user,
  }
}

export async function login(payload: LoginPayload) {
  const response = await api.post<ApiResponse<AuthResponse> | AuthResponse>('/auth/login', payload)
  const data = 'data' in response.data ? response.data.data : response.data
  return normalizeAuthSession(data)
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<ApiResponse<AuthResponse> | AuthResponse>(
    '/auth/register',
    payload,
  )
  const data = 'data' in response.data ? response.data.data : response.data
  return normalizeAuthSession(data)
}
