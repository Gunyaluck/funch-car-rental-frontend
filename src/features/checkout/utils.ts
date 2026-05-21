import { isAxiosError } from 'axios'

export type ContactFieldErrors = Partial<Record<'firstName' | 'lastName' | 'phone', string>>
export type RegisterFieldErrors = Partial<
  Record<'email' | 'password' | 'confirmPassword' | 'countryCode', string>
>

const phonePattern = /^[+\d\s()-]{6,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getCheckoutApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

export function formatCheckoutDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function validateContactForm({
  firstName,
  lastName,
  phone,
}: {
  firstName: string
  lastName: string
  phone: string
}) {
  const errors: ContactFieldErrors = {}

  if (!firstName.trim()) {
    errors.firstName = 'First name is required.'
  }

  if (!lastName.trim()) {
    errors.lastName = 'Last name is required.'
  }

  if (!phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!phonePattern.test(phone.trim())) {
    errors.phone = 'Enter a valid phone number.'
  }

  return errors
}

export function validateRegisterFields({
  email,
  password,
  confirmPassword,
  countryCode,
}: {
  email: string
  password: string
  confirmPassword: string
  countryCode: string
}) {
  const errors: RegisterFieldErrors = {}

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!countryCode) {
    errors.countryCode = 'Select your country.'
  }

  return errors
}
