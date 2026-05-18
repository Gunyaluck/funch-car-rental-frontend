export type AuthUser = {
  id?: string
  email: string
  firstName?: string
  lastName?: string
  role?: 'CUSTOMER' | 'ADMIN'
  status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  phone?: string
  countryCode?: string
  timezone?: string
  currencyCode?: string
  preferredCurrency?: string
}

export type AuthSession = {
  accessToken: string
  user: AuthUser
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = LoginPayload & {
  firstName: string
  lastName: string
  phone: string
  countryCode: string
  timezone?: string
}
