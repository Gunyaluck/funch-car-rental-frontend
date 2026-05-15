export type AuthUser = {
  id?: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  countryCode?: string
  timezone?: string
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
  timezone: string
  preferredCurrency: string
}
