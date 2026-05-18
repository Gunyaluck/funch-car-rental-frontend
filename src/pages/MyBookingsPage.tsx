import { isAxiosError } from 'axios'
import { ArrowRight, CalendarPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { buttonVariants } from '../components/ui/button-variants'
import { Card, CardContent } from '../components/ui/card'
import { listMyBookings } from '../features/bookings/api'
import type { BookingItem, BookingStatus } from '../features/bookings/types'
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

function getStatusVariant(status: BookingStatus) {
  if (status === 'REJECTED' || status === 'CANCELLED') {
    return 'danger' as const
  }

  if (status === 'APPROVED' || status === 'COMPLETED') {
    return 'default' as const
  }

  return 'muted' as const
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
  }, [])

  return (
    <PageSection
      title="My bookings"
      description="Track your booking requests, approval status, vehicle details, and pricing."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {errorMessage ? <Alert title="Bookings unavailable">{errorMessage}</Alert> : null}

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

          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="grid gap-4">
                <div>
                  <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                  <h2 className="m-0 mt-2 text-xl font-semibold">
                    {booking.car.brand} {booking.car.model}
                  </h2>
                  <p className="m-0 text-stone-500">
                    {booking.car.name} · {booking.car.city}, {booking.car.countryCode} ·{' '}
                    {booking.car.year}
                  </p>
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

                <div className="grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-3">
                  <div>
                    <span className="block text-sm font-semibold text-stone-500">Rental</span>
                    <strong>{formatMoney(booking.currencyCode, booking.subtotal)}</strong>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-stone-500">Options</span>
                    <strong>{formatMoney(booking.currencyCode, booking.optionsTotal)}</strong>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-stone-500">Total</span>
                    <strong>{formatMoney(booking.currencyCode, booking.grandTotal)}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-28">
          <Card>
            <CardContent className="grid gap-4">
              <h2 className="m-0 text-xl font-semibold">Next steps</h2>
              <div className="grid gap-3">
                <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                  <Badge variant="muted" className="w-fit">Pending</Badge>
                  <p className="m-0 text-sm text-stone-500">
                    Your request is waiting for admin approval. No action is needed yet.
                  </p>
                </div>
                <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                  <Badge className="w-fit">Approved</Badge>
                  <p className="m-0 text-sm text-stone-500">
                    Your booking is confirmed. Bring your booking details when picking up the car.
                  </p>
                </div>
                <div className="grid gap-1 rounded-2xl bg-white/60 p-4">
                  <Badge variant="danger" className="w-fit">Rejected</Badge>
                  <p className="m-0 text-sm text-stone-500">
                    Review the admin note and choose another vehicle or rental time.
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
