import { isAxiosError } from 'axios'
import { ArrowRight, CalendarPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { buttonVariants } from '../components/ui/button-variants'
import { Card, CardContent } from '../components/ui/card'
import {
  cancelBooking,
  listMyBookings,
  startDepositCheckout,
} from '../features/bookings/api'
import type { BookingItem, BookingStatus, PaymentStatus } from '../features/bookings/types'
import { formatMoney } from '../features/cars/utils/car-detail-utils'

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

function getStatusVariant(status: BookingStatus, paymentStatus: PaymentStatus) {
  if (paymentStatus === 'REFUND_PENDING' || paymentStatus === 'REFUNDED') {
    return 'danger' as const
  }

  if (status === 'REJECTED' || status === 'CANCELLED') {
    return 'danger' as const
  }

  if (status === 'APPROVED' || status === 'COMPLETED') {
    return 'default' as const
  }

  return 'muted' as const
}

function getBookingHeadline(booking: BookingItem) {
  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING') {
    return 'Deposit required'
  }

  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID') {
    return 'Awaiting confirmation'
  }

  if (booking.status === 'APPROVED') {
    return 'Confirmed by branch'
  }

  if (booking.paymentStatus === 'REFUND_PENDING') {
    return 'Refund pending'
  }

  if (booking.paymentStatus === 'REFUNDED') {
    return 'Refund completed'
  }

  if (booking.paymentStatus === 'EXPIRED') {
    return 'Deposit window expired'
  }

  return booking.status
}

function getBookingMessage(booking: BookingItem) {
  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING') {
    return 'Pay the deposit to move this booking into the confirmation queue.'
  }

  if (booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PAID') {
    return 'Your booking is awaiting confirmation.'
  }

  if (booking.status === 'APPROVED') {
    return 'Branch confirmed the booking. Bring these details on pickup day.'
  }

  if (booking.status === 'REJECTED' && booking.paymentStatus === 'REFUND_PENDING') {
    return 'The branch could not confirm this booking. Refund still needs to be processed.'
  }

  if (booking.status === 'CANCELLED' && booking.paymentStatus === 'REFUND_PENDING') {
    return 'This booking was cancelled in time. Refund still needs to be processed.'
  }

  if (booking.paymentStatus === 'REFUNDED') {
    return 'The deposit has been marked as refunded.'
  }

  if (booking.paymentStatus === 'EXPIRED') {
    return 'The deposit was not paid before the payment window closed.'
  }

  return 'Track confirmation, payment progress, and any admin notes here.'
}

function canPayDeposit(booking: BookingItem) {
  return booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING'
}

function canCancelBooking(booking: BookingItem) {
  return booking.canCancel && ['PENDING', 'APPROVED'].includes(booking.status)
}

export function MyBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionBookingId, setActionBookingId] = useState('')
  const depositResult = searchParams.get('deposit')
  const depositBookingId = searchParams.get('bookingId')

  useEffect(() => {
    let isCurrent = true

    async function loadBookings() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await listMyBookings()

        if (isCurrent) {
          setBookings(result)
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load your bookings.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      isCurrent = false
    }
  }, [depositBookingId, depositResult])

  useEffect(() => {
    if (!depositResult) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('deposit')
      nextParams.delete('bookingId')
      setSearchParams(nextParams, { replace: true })
    }, 12000)

    return () => window.clearTimeout(timeoutId)
  }, [depositResult, searchParams, setSearchParams])

  async function handlePayDeposit(bookingId: string) {
    setActionBookingId(bookingId)
    setErrorMessage('')

    try {
      const result = await startDepositCheckout(bookingId)

      if (result.checkout.url) {
        window.location.assign(result.checkout.url)
        return
      }

      setErrorMessage('Stripe checkout URL is not available yet.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to start the deposit checkout.'))
    } finally {
      setActionBookingId('')
    }
  }

  async function handleCancelBooking(bookingId: string) {
    setActionBookingId(bookingId)
    setErrorMessage('')

    try {
      const updatedBooking = await cancelBooking(bookingId)
      setBookings((currentBookings) =>
        currentBookings.map((booking) => (booking.id === bookingId ? updatedBooking : booking)),
      )
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to cancel this booking.'))
    } finally {
      setActionBookingId('')
    }
  }

  return (
    <PageSection
      title="My bookings"
      description="Track deposit payment, confirmation, refund handling, and pickup details."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {errorMessage ? <Alert title="Bookings unavailable">{errorMessage}</Alert> : null}
          {depositResult === 'success' ? (
            <Alert title="Deposit received">
              Your booking is awaiting confirmation.
            </Alert>
          ) : null}
          {depositResult === 'cancelled' ? (
            <Alert title="Deposit not completed">
              Stripe Checkout was cancelled before payment finished. You can try again from this page.
            </Alert>
          ) : null}

          {isLoading ? (
            <Card>
              <CardContent className="grid gap-4">
                <div>
                  <Badge>Loading</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">Booking list</h2>
                  <p className="m-0 text-stone-500">Loading your booking requests...</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && bookings.length === 0 ? (
            <Card>
              <CardContent className="grid justify-items-center gap-4 py-12 text-center">
                <div className="grid size-14 place-items-center rounded-full bg-clay-600/10 text-clay-700">
                  <CalendarPlus className="size-7" />
                </div>
                <div className="grid max-w-[520px] gap-2">
                  <h2 className="m-0 text-2xl font-semibold">No bookings yet</h2>
                  <p className="m-0 text-stone-500">
                    Choose a vehicle and submit a booking request to start tracking it here.
                  </p>
                </div>
                <Link to="/cars" className={buttonVariants()}>
                  Browse cars
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {bookings.map((booking) => {
            const isBusy = actionBookingId === booking.id

            return (
              <Card key={booking.id}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Badge variant={getStatusVariant(booking.status, booking.paymentStatus)}>
                      {getBookingHeadline(booking)}
                    </Badge>
                    <h2 className="m-0 text-xl font-semibold">
                      {booking.car.brand} {booking.car.model}
                    </h2>
                    <p className="m-0 text-stone-500">
                      {booking.car.name} · {booking.car.city}, {booking.car.countryCode} ·{' '}
                      {booking.car.year}
                    </p>
                    <p className="m-0 text-sm text-stone-500">{getBookingMessage(booking)}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                      <span className="text-sm font-semibold text-stone-500">Pickup</span>
                      <span>{formatDateTime(booking.pickupAt, booking.pickupTimezone)}</span>
                    </div>
                    <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                      <span className="text-sm font-semibold text-stone-500">Return</span>
                      <span>{formatDateTime(booking.returnAt, booking.pickupTimezone)}</span>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-3">
                    <div>
                      <span className="block text-sm font-semibold text-stone-500">Deposit</span>
                      <strong>{formatMoney(booking.currencyCode, booking.depositAmount)}</strong>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-stone-500">
                        Pay at pickup
                      </span>
                      <strong>
                        {formatMoney(booking.currencyCode, booking.amountDueAtPickup)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-stone-500">Total</span>
                      <strong>{formatMoney(booking.currencyCode, booking.grandTotal)}</strong>
                    </div>
                  </div>

                  {booking.depositDueAt ? (
                    <p
                      className={
                        booking.status === 'PENDING' && booking.paymentStatus === 'DEPOSIT_PENDING'
                          ? 'm-0 text-sm font-medium text-red-600'
                          : 'm-0 text-sm text-stone-500'
                      }
                    >
                      Deposit due by {formatDateTime(booking.depositDueAt, booking.pickupTimezone)}
                    </p>
                  ) : null}

                  {booking.options.length ? (
                    <div className="grid gap-2">
                      <span className="text-sm font-semibold text-stone-500">Options</span>
                      {booking.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3"
                        >
                          <span>{option.name}</span>
                          <strong>{formatMoney(booking.currencyCode, option.totalPrice)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {booking.adminNote ? (
                    <Alert title="Branch note">{booking.adminNote}</Alert>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    {canPayDeposit(booking) ? (
                      <Button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handlePayDeposit(booking.id)}
                      >
                        {isBusy ? 'Processing...' : 'Pay deposit now'}
                      </Button>
                    ) : null}

                    {canCancelBooking(booking) ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        {isBusy ? 'Processing...' : 'Cancel booking'}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-28">
          <Card>
            <CardContent className="grid gap-4">
              <h2 className="m-0 text-xl font-semibold">How this works</h2>
              <div className="grid gap-3">
                <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                  <Badge variant="muted" className="w-fit">Deposit required</Badge>
                  <p className="m-0 text-sm text-stone-500">
                    Pay the deposit first so the booking enters the confirmation queue.
                  </p>
                </div>
                <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                  <Badge className="w-fit">Awaiting confirmation</Badge>
                  <p className="m-0 text-sm text-stone-500">
                    After deposit payment, the branch calls the customer and confirms availability.
                  </p>
                </div>
                <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                  <Badge variant="danger" className="w-fit">Refund handling</Badge>
                  <p className="m-0 text-sm text-stone-500">
                    If the branch rejects the booking or the customer cancels in time, the deposit moves to refund handling.
                  </p>
                </div>
              </div>
              <Link to="/cars" className={buttonVariants({ variant: 'outline' })}>
                Book another car
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageSection>
  )
}
