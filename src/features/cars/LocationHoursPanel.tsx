import { CalendarClock, Clock3 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import type { CarDetailItem } from './types'
import { dayNames } from './utils/car-detail-utils'

type LocationHoursPanelProps = {
  car: CarDetailItem
}

export function LocationHoursPanel({ car }: LocationHoursPanelProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <Clock3 className="size-5 text-forest-700" />
          <h2 className="m-0 font-(--font-heading) text-[1.45rem]">Pickup Hours</h2>
        </div>
        <div className="grid gap-2">
          {car.locationHours.map((hour) => (
            <div
              key={hour.dayOfWeek}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white/58 px-4 py-3"
            >
              <span className="font-semibold">{dayNames[hour.dayOfWeek]}</span>
              <span className="text-stone-500">
                {hour.isClosed ? 'Closed' : `${hour.openTime} - ${hour.closeTime}`}
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-2 rounded-3xl border border-black/10 bg-white/58 p-4">
          <span className="inline-flex items-center gap-2 font-semibold">
            <CalendarClock className="size-4" />
            Rental rules
          </span>
          <p className="m-0 text-stone-500">
            Book at least {car.minAdvanceBookingHr} hours ahead. Maximum rental
            length is {car.maxBookingDays} days. A {car.bufferHours}-hour buffer is
            reserved after each return.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
