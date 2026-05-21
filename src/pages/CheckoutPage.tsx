import { isAxiosError } from 'axios'
import { ArrowRight, CalendarPlus, CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { buttonVariants } from '../components/ui/button-variants'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { FieldLabel, Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { register } from '../features/auth/api'
import { getStoredAuthSession, storeAuthSession } from '../features/auth/storage'
import { createBooking } from '../features/bookings/api'
import type { BookingItem } from '../features/bookings/types'
import { getCarById } from '../features/cars/api'
import type { CarDetailItem } from '../features/cars/types'
import { formatMoney } from '../features/cars/utils/car-detail-utils'
import { quotePricing } from '../features/pricing/api'
import type { PricingQuote } from '../features/pricing/types'
import { getMyProfile, updateMyProfile } from '../features/users/api'
import { countryOptions } from '../lib/country-options'

type ContactFieldErrors = Partial<Record<'firstName' | 'lastName' | 'phone', string>>
type RegisterFieldErrors = Partial<
  Record<'email' | 'password' | 'confirmPassword' | 'countryCode', string>
>

const phonePattern = /^[+\d\s()-]{6,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

function formatDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="m-0 text-sm font-medium text-red-600">{message}</p>
}

function validateContactForm({
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

function validateRegisterFields({
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

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const carId = searchParams.get('carId') ?? ''
  const pickupAt = searchParams.get('pickupAt') ?? ''
  const returnAt = searchParams.get('returnAt') ?? ''
  const optionIds = useMemo(
    () => (searchParams.get('optionIds') ?? '').split(',').filter(Boolean),
    [searchParams],
  )
  const [session] = useState(() => getStoredAuthSession())
  const isSignedIn = Boolean(session)
  const sessionCountryCode = session?.user.countryCode ?? 'TH'
  const [car, setCar] = useState<CarDetailItem | null>(null)
  const [quote, setQuote] = useState<PricingQuote | null>(null)
  const [booking, setBooking] = useState<BookingItem | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [contactErrors, setContactErrors] = useState<ContactFieldErrors>({})
  const [registerErrors, setRegisterErrors] = useState<RegisterFieldErrors>({})
  const [contactEmail, setContactEmail] = useState(session?.user.email ?? '')
  const [contactFirstName, setContactFirstName] = useState(session?.user.firstName ?? '')
  const [contactLastName, setContactLastName] = useState(session?.user.lastName ?? '')
  const [contactPhone, setContactPhone] = useState(session?.user.phone ?? '')
  const [contactCountryCode, setContactCountryCode] = useState(sessionCountryCode)
  const [accountPassword, setAccountPassword] = useState('')
  const [confirmAccountPassword, setConfirmAccountPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasCheckoutDetails = Boolean(carId && pickupAt && returnAt)

  useEffect(() => {
    let isCurrent = true

    async function loadCheckout() {
      if (!hasCheckoutDetails) {
        setErrorMessage('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const [nextCar, nextQuote, profile] = await Promise.all([
          getCarById(carId),
          quotePricing({ carId, pickupAt, returnAt, optionIds }),
          session ? getMyProfile() : Promise.resolve(null),
        ])

        if (!isCurrent) {
          return
        }

        setCar(nextCar)
        setQuote(nextQuote)

        if (profile) {
          setContactEmail(profile.email)
          setContactFirstName(profile.firstName ?? '')
          setContactLastName(profile.lastName ?? '')
          setContactPhone(profile.phone ?? '')
          setContactCountryCode(profile.countryCode ?? sessionCountryCode)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to prepare checkout.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadCheckout()

    return () => {
      isCurrent = false
    }
  }, [carId, hasCheckoutDetails, optionIds, pickupAt, returnAt, session, sessionCountryCode])

  async function handleSubmit() {
    if (!quote) {
      return
    }

    const nextContactErrors = validateContactForm({
      firstName: contactFirstName,
      lastName: contactLastName,
      phone: contactPhone,
    })
    const nextRegisterErrors = !isSignedIn
      ? validateRegisterFields({
          email: contactEmail,
          password: accountPassword,
          confirmPassword: confirmAccountPassword,
          countryCode: contactCountryCode,
        })
      : {}

    setContactErrors(nextContactErrors)
    setRegisterErrors(nextRegisterErrors)

    if (Object.keys(nextContactErrors).length > 0 || Object.keys(nextRegisterErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      let activeSession = session

      if (!activeSession) {
        activeSession = await register({
          firstName: contactFirstName.trim(),
          lastName: contactLastName.trim(),
          email: contactEmail.trim(),
          password: accountPassword,
          phone: contactPhone.trim(),
          countryCode: contactCountryCode,
          timezone: getBrowserTimezone(),
        })
        storeAuthSession(activeSession)
      }

      const updatedProfile = await updateMyProfile({
        firstName: contactFirstName.trim(),
        lastName: contactLastName.trim(),
        phone: contactPhone.trim(),
        countryCode: contactCountryCode,
        timezone: getBrowserTimezone(),
      })

      if (activeSession) {
        storeAuthSession({
          ...activeSession,
          user: {
            ...activeSession.user,
            ...updatedProfile,
          },
        })
      }

      setContactEmail(updatedProfile.email)
      setContactFirstName(updatedProfile.firstName ?? '')
      setContactLastName(updatedProfile.lastName ?? '')
      setContactPhone(updatedProfile.phone ?? '')
      setContactCountryCode(updatedProfile.countryCode ?? contactCountryCode)

      const nextBooking = await createBooking({
        carId,
        pickupAt,
        returnAt,
        optionIds,
      })
      setBooking(nextBooking)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to submit this booking.')

      if (!isSignedIn && message === 'Email is already registered') {
        setRegisterErrors((currentErrors) => ({
          ...currentErrors,
          email: 'This email is already registered.',
        }))
        return
      }

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const timezone = quote?.timezone ?? car?.timezone ?? 'UTC'

  if (!hasCheckoutDetails) {
    return (
      <PageSection
        title="Checkout"
        description="Review and pay for a booking after choosing a vehicle and rental time."
      >
        <Card>
          <CardContent className="grid justify-items-center gap-4 py-12 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-clay-600/10 text-clay-700">
              <CalendarPlus className="size-7" />
            </div>
            <div className="grid max-w-[520px] gap-2">
              <h2 className="m-0 text-2xl font-semibold">No booking selected</h2>
              <p className="m-0 text-stone-500">
                Choose a car, pickup time, and return time before continuing to checkout.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/cars" className={buttonVariants()}>
                Choose a car
                <ArrowRight className="size-4" />
              </Link>
              <Link to="/my-bookings" className={buttonVariants({ variant: 'outline' })}>
                View my bookings
              </Link>
            </div>
          </CardContent>
        </Card>
      </PageSection>
    )
  }

  return (
    <PageSection
      title="Complete your booking"
      description="Review your trip details, options, customer information, and final price."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {errorMessage ? <Alert title="Checkout unavailable">{errorMessage}</Alert> : null}

          {booking ? (
            <Card>
              <CardContent className="grid gap-3 text-center">
                <CheckCircle2 className="mx-auto size-10 text-emerald-700" />
                <Badge className="mx-auto">Deposit required</Badge>
                <h2 className="m-0 text-xl font-semibold">Booking request submitted</h2>
                <p className="m-0 text-stone-500">
                  Pay the deposit from My Bookings. Your booking will move to awaiting confirmation after payment.
                </p>
                <div className="flex justify-center">
                  <Link to="/my-bookings" className="font-semibold text-forest-800">
                    View my bookings
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="grid gap-4">
              <div>
                <h2 className="m-0 mt-2 text-xl font-semibold">
                  {car ? `${car.brand} ${car.model}` : 'Booking summary'}
                </h2>
                {car ? (
                  <p className="m-0 text-stone-500">
                    {car.name} · {car.city}, {car.countryCode} · {car.year}
                  </p>
                ) : null}
              </div>

              {quote ? (
                <div className="grid gap-3">
                  <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                    <span className="text-sm font-semibold text-stone-500">Pickup</span>
                    <span>{formatDateTime(quote.pickupAt, timezone)}</span>
                  </div>
                  <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                    <span className="text-sm font-semibold text-stone-500">Return</span>
                    <span>{formatDateTime(quote.returnAt, timezone)}</span>
                  </div>

                  {quote.selectedOptions.length ? (
                    <div className="grid gap-2">
                      <span className="text-sm font-semibold text-stone-500">Options</span>
                      {quote.selectedOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3"
                        >
                          <span>{option.name}</span>
                          <strong>{formatMoney(quote.currencyCode, option.total)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3">
              <h2 className="m-0 text-xl font-semibold">
                {isSignedIn ? 'Customer' : 'Customer and account'}
              </h2>
              <div className="grid gap-4 rounded-2xl bg-white/60 p-4">
                <Label>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={contactEmail}
                    className={registerErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(registerErrors.email)}
                    disabled={isSignedIn || isLoading || isSubmitting || Boolean(booking)}
                    onChange={(event) => {
                      setContactEmail(event.target.value)
                      setRegisterErrors((currentErrors) => ({ ...currentErrors, email: undefined }))
                    }}
                  />
                  <FieldError message={registerErrors.email} />
                </Label>

                <div className="grid gap-4 md:grid-cols-2">
                  <Label>
                    <FieldLabel>First name</FieldLabel>
                    <Input
                      value={contactFirstName}
                      autoComplete="given-name"
                      className={contactErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                      aria-invalid={Boolean(contactErrors.firstName)}
                      disabled={isLoading || isSubmitting || Boolean(booking)}
                      onChange={(event) => {
                        setContactFirstName(event.target.value)
                        setContactErrors((currentErrors) => ({ ...currentErrors, firstName: undefined }))
                      }}
                    />
                    <FieldError message={contactErrors.firstName} />
                  </Label>
                  <Label>
                    <FieldLabel>Last name</FieldLabel>
                    <Input
                      value={contactLastName}
                      autoComplete="family-name"
                      className={contactErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                      aria-invalid={Boolean(contactErrors.lastName)}
                      disabled={isLoading || isSubmitting || Boolean(booking)}
                      onChange={(event) => {
                        setContactLastName(event.target.value)
                        setContactErrors((currentErrors) => ({ ...currentErrors, lastName: undefined }))
                      }}
                    />
                    <FieldError message={contactErrors.lastName} />
                  </Label>
                </div>

                <Label>
                  <FieldLabel>Phone</FieldLabel>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={contactPhone}
                    className={contactErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(contactErrors.phone)}
                    disabled={isLoading || isSubmitting || Boolean(booking)}
                    onChange={(event) => {
                      setContactPhone(event.target.value)
                      setContactErrors((currentErrors) => ({ ...currentErrors, phone: undefined }))
                    }}
                  />
                  <FieldError message={contactErrors.phone} />
                </Label>

                <Label>
                  <FieldLabel>Country</FieldLabel>
                  <Select
                    value={contactCountryCode}
                    onValueChange={(value) => {
                      setContactCountryCode(value)
                      setRegisterErrors((currentErrors) => ({
                        ...currentErrors,
                        countryCode: undefined,
                      }))
                    }}
                    disabled={isLoading || isSubmitting || Boolean(booking)}
                  >
                    <SelectTrigger
                      className={registerErrors.countryCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                      aria-invalid={Boolean(registerErrors.countryCode)}
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={registerErrors.countryCode} />
                </Label>

                {!isSignedIn ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Label>
                      <FieldLabel>Create password</FieldLabel>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={accountPassword}
                        className={registerErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                        aria-invalid={Boolean(registerErrors.password)}
                        disabled={isLoading || isSubmitting || Boolean(booking)}
                        onChange={(event) => {
                          setAccountPassword(event.target.value)
                          setRegisterErrors((currentErrors) => ({
                            ...currentErrors,
                            password: undefined,
                          }))
                        }}
                      />
                      <FieldError message={registerErrors.password} />
                    </Label>
                    <Label>
                      <FieldLabel>Confirm password</FieldLabel>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={confirmAccountPassword}
                        className={registerErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                        aria-invalid={Boolean(registerErrors.confirmPassword)}
                        disabled={isLoading || isSubmitting || Boolean(booking)}
                        onChange={(event) => {
                          setConfirmAccountPassword(event.target.value)
                          setRegisterErrors((currentErrors) => ({
                            ...currentErrors,
                            confirmPassword: undefined,
                          }))
                        }}
                      />
                      <FieldError message={registerErrors.confirmPassword} />
                    </Label>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-28">
          <Card>
            <CardContent className="grid gap-4">
              <h2 className="m-0 text-xl font-semibold">Price</h2>
              {quote ? (
                <div className="grid gap-3">
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-500">Rental</span>
                    <strong>{formatMoney(quote.currencyCode, quote.subtotal)}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-500">Options</span>
                    <strong>{formatMoney(quote.currencyCode, quote.optionsTotal)}</strong>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-black/10 pt-3 text-lg">
                    <span className="font-semibold">Total</span>
                    <strong>{formatMoney(quote.currencyCode, quote.grandTotal)}</strong>
                  </div>
                  <p className="m-0 text-sm text-stone-500">
                    Deposit is charged first. Final confirmation happens after the branch reviews your booking.
                  </p>
                </div>
              ) : (
                <p className="m-0 text-stone-500">Prepare a quote before submitting.</p>
              )}

              {booking ? (
                <Link to="/my-bookings" className={buttonVariants()}>
                  Go to My Bookings
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Button
                  type="button"
                  disabled={!quote || isLoading || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting
                    ? 'Submitting booking...'
                    : isSignedIn
                      ? 'Submit booking and continue to deposit'
                      : 'Create account, book, and continue to deposit'}
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageSection>
  )
}
