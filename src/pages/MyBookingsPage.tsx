import { ArrowRight, CalendarPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { buttonVariants } from '../components/ui/button-variants'
import { Card, CardContent } from '../components/ui/card'
import {
  cancelBooking,
  listMyBookings,
  startDepositCheckout,
} from '../features/bookings/api'
import { MyBookingCancelDialog } from '../features/bookings/MyBookingCancelDialog'
import { MyBookingCard } from '../features/bookings/MyBookingCard'
import type { BookingItem } from '../features/bookings/types'
import { getMyBookingsApiErrorMessage } from '../features/bookings/my-bookings-utils'

export function MyBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionBookingId, setActionBookingId] = useState('')
  const [confirmCancelBookingId, setConfirmCancelBookingId] = useState('')
  const depositResult = searchParams.get('deposit')
  const depositBookingId = searchParams.get('bookingId')
  const confirmCancelBooking =
    bookings.find((booking) => booking.id === confirmCancelBookingId) ?? null

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
          setErrorMessage(getMyBookingsApiErrorMessage(error, 'Unable to load your bookings.'))
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

      setErrorMessage('Payment checkout is temporarily unavailable. Please try again shortly.')
    } catch (error) {
      setErrorMessage(getMyBookingsApiErrorMessage(error, 'Unable to start the deposit checkout.'))
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
      setErrorMessage(getMyBookingsApiErrorMessage(error, 'Unable to cancel this booking.'))
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
              <MyBookingCard
                key={booking.id}
                booking={booking}
                isBusy={isBusy}
                onPayDeposit={() => handlePayDeposit(booking.id)}
                onCancel={() => setConfirmCancelBookingId(booking.id)}
              />
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

      <MyBookingCancelDialog
        booking={confirmCancelBooking}
        isBusy={actionBookingId === confirmCancelBooking?.id}
        onCancel={() => setConfirmCancelBookingId('')}
        onConfirm={async () => {
          if (!confirmCancelBooking) {
            return
          }

          await handleCancelBooking(confirmCancelBooking.id)
          setConfirmCancelBookingId('')
        }}
      />
    </PageSection>
  )
}
