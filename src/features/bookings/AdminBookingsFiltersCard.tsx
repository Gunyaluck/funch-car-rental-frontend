import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import type { BookingStatus, PaymentStatus } from './types'
import {
  BOOKING_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from './admin-bookings-utils'

type AdminBookingsFiltersCardProps = {
  searchTerm: string
  statusFilter: BookingStatus | 'ALL'
  paymentFilter: PaymentStatus | 'ALL'
  onSearchTermChange: (value: string) => void
  onStatusFilterChange: (value: BookingStatus | 'ALL') => void
  onPaymentFilterChange: (value: PaymentStatus | 'ALL') => void
}

export function AdminBookingsFiltersCard({
  searchTerm,
  statusFilter,
  paymentFilter,
  onSearchTermChange,
  onStatusFilterChange,
  onPaymentFilterChange,
}: AdminBookingsFiltersCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <h2 className="m-0 text-xl font-semibold">Booking queue</h2>
          <p className="m-0 text-stone-500">
            Search bookings, filter by status, and review results page by page.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search by booking ID, customer, email, car, city, or note"
          />

          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Booking status</span>
            <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as BookingStatus | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'ALL' ? 'All statuses' : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Payment status</span>
            <Select value={paymentFilter} onValueChange={(value) => onPaymentFilterChange(value as PaymentStatus | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="All payments" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'ALL' ? 'All payments' : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
