import { ArrowRight, CalendarPlus, CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { buttonVariants } from '../components/ui/button-variants'
import { Card, CardContent } from '../components/ui/card'
import { register } from '../features/auth/api'
import { getStoredAuthSession, storeAuthSession } from '../features/auth/storage'
import { createBooking } from '../features/bookings/api'
import type { BookingItem } from '../features/bookings/types'
import { getCarById } from '../features/cars/api'
import type { CarDetailItem } from '../features/cars/types'
import { CheckoutBookingSummary } from '../features/checkout/CheckoutBookingSummary'
import { CheckoutCustomerForm } from '../features/checkout/CheckoutCustomerForm'
import { CheckoutPriceCard } from '../features/checkout/CheckoutPriceCard'
import {
  getBrowserTimezone,
  getCheckoutApiErrorMessage,
  type ContactFieldErrors,
  type RegisterFieldErrors,
  validateContactForm,
  validateRegisterFields,
} from '../features/checkout/utils'
import { quotePricing } from '../features/pricing/api'
import type { PricingQuote } from '../features/pricing/types'
import { getMyProfile, updateMyProfile } from '../features/users/api'

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
          setErrorMessage(getCheckoutApiErrorMessage(error, 'Unable to prepare checkout.'))
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
      const message = getCheckoutApiErrorMessage(error, 'Unable to submit this booking.')

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

          <CheckoutBookingSummary car={car} quote={quote} timezone={timezone} />

          <Card>
            <CardContent className="grid gap-3">
              <h2 className="m-0 text-xl font-semibold">
                {isSignedIn ? 'Customer' : 'Customer and account'}
              </h2>
              <CheckoutCustomerForm
                isSignedIn={isSignedIn}
                isDisabled={isLoading || isSubmitting}
                hasBooking={Boolean(booking)}
                contactEmail={contactEmail}
                contactFirstName={contactFirstName}
                contactLastName={contactLastName}
                contactPhone={contactPhone}
                contactCountryCode={contactCountryCode}
                accountPassword={accountPassword}
                confirmAccountPassword={confirmAccountPassword}
                contactErrors={contactErrors}
                registerErrors={registerErrors}
                onContactEmailChange={(value) => {
                  setContactEmail(value)
                  setRegisterErrors((currentErrors) => ({ ...currentErrors, email: undefined }))
                }}
                onContactFirstNameChange={(value) => {
                  setContactFirstName(value)
                  setContactErrors((currentErrors) => ({ ...currentErrors, firstName: undefined }))
                }}
                onContactLastNameChange={(value) => {
                  setContactLastName(value)
                  setContactErrors((currentErrors) => ({ ...currentErrors, lastName: undefined }))
                }}
                onContactPhoneChange={(value) => {
                  setContactPhone(value)
                  setContactErrors((currentErrors) => ({ ...currentErrors, phone: undefined }))
                }}
                onContactCountryCodeChange={(value) => {
                  setContactCountryCode(value)
                  setRegisterErrors((currentErrors) => ({
                    ...currentErrors,
                    countryCode: undefined,
                  }))
                }}
                onAccountPasswordChange={(value) => {
                  setAccountPassword(value)
                  setRegisterErrors((currentErrors) => ({
                    ...currentErrors,
                    password: undefined,
                  }))
                }}
                onConfirmAccountPasswordChange={(value) => {
                  setConfirmAccountPassword(value)
                  setRegisterErrors((currentErrors) => ({
                    ...currentErrors,
                    confirmPassword: undefined,
                  }))
                }}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-28">
          <CheckoutPriceCard
            quote={quote}
            booking={booking}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            isSignedIn={isSignedIn}
            onSubmit={handleSubmit}
          />
        </aside>
      </div>
    </PageSection>
  )
}
