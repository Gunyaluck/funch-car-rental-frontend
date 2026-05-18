import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

type DateTimePickerProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minDateTime?: Date
  minDateTimeExclusive?: boolean
  minuteStep?: number
  is24Hours?: boolean
  timezone?: string
  timezoneLabel?: string
  operatingHours?: Array<{
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }>
  unavailableRanges?: Array<{
    from: string
    to: string
  }>
  rangeBoundaryValue?: string
  rangeBoundaryRole?: 'start' | 'end'
}

function toDate(value: string) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toQueryValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

function startOfDay(date: Date) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function roundUpToMinuteStep(date: Date, minuteStep: number) {
  const nextDate = new Date(date)
  const minutes = nextDate.getMinutes()
  const roundedMinutes = Math.ceil(minutes / minuteStep) * minuteStep

  nextDate.setMinutes(roundedMinutes, 0, 0)
  return nextDate
}

function buildTimeSlots(minuteStep: number) {
  const slots: string[] = []

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += minuteStep) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
    }
  }

  return slots
}

function getDayOfWeek(date: Date) {
  return date.getDay()
}

function minutesFromTime(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

function timeSlotToDate(date: Date, time: string) {
  const [hour, minute] = time.split(':').map(Number)
  const slotDate = new Date(date)
  slotDate.setHours(hour, minute, 0, 0)
  return slotDate
}

function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB
}

function isDateWithinRange(date: Date, rangeStart: Date, rangeEnd: Date) {
  return date >= rangeStart && date < rangeEnd
}

function getTimeZoneName(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short',
    }).formatToParts(new Date())

    return parts.find((part) => part.type === 'timeZoneName')?.value ?? timezone
  } catch {
    return timezone
  }
}

function getZonedDateParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  }
}

function zonedWallTimeToDate(date: Date, timezone: string) {
  try {
    const desiredWallTime = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
    )
    const utcGuess = new Date(desiredWallTime)
    const zonedParts = getZonedDateParts(utcGuess, timezone)
    const guessedWallTime = Date.UTC(
      zonedParts.year,
      zonedParts.month - 1,
      zonedParts.day,
      zonedParts.hour,
      zonedParts.minute,
    )

    return new Date(utcGuess.getTime() + desiredWallTime - guessedWallTime)
  } catch {
    return date
  }
}

function formatDateTimeLabel(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

function isOutsideOperatingHours(
  time: string,
  selectedDate: Date | undefined,
  operatingHours: DateTimePickerProps['operatingHours'],
  is24Hours: boolean,
) {
  if (!selectedDate || is24Hours || !operatingHours?.length) {
    return false
  }

  const hours = operatingHours.find((item) => item.dayOfWeek === getDayOfWeek(selectedDate))

  if (!hours || hours.isClosed) {
    return true
  }

  const slotMinutes = minutesFromTime(time)
  return (
    slotMinutes < minutesFromTime(hours.openTime) ||
    slotMinutes >= minutesFromTime(hours.closeTime)
  )
}

function isPastTimeSlot(
  time: string,
  selectedDate: Date | undefined,
  minDateTime: Date | undefined,
  minDateTimeExclusive: boolean,
) {
  if (!selectedDate || !minDateTime || !isSameDay(selectedDate, minDateTime)) {
    return false
  }
  const slotDate = timeSlotToDate(selectedDate, time)
  return minDateTimeExclusive ? slotDate <= minDateTime : slotDate < minDateTime
}

function isTimeSlotDisabled(params: {
  time: string
  selectedDate: Date | undefined
  minDateTime: Date | undefined
  minDateTimeExclusive: boolean
  operatingHours: DateTimePickerProps['operatingHours']
  is24Hours: boolean
  unavailableRanges: DateTimePickerProps['unavailableRanges']
  rangeBoundaryDate: Date | undefined
  rangeBoundaryRole?: DateTimePickerProps['rangeBoundaryRole']
}) {
  const slotDate = params.selectedDate ? timeSlotToDate(params.selectedDate, params.time) : undefined

  const isUnavailable =
    slotDate &&
    params.unavailableRanges?.some((range) => {
      const rangeStart = toDate(range.from)
      const rangeEnd = toDate(range.to)

      if (!rangeStart || !rangeEnd) {
        return false
      }

      if (!params.rangeBoundaryDate || !params.rangeBoundaryRole) {
        return isDateWithinRange(slotDate, rangeStart, rangeEnd)
      }

      if (params.rangeBoundaryRole === 'start') {
        return rangesOverlap(params.rangeBoundaryDate, slotDate, rangeStart, rangeEnd)
      }

      return rangesOverlap(slotDate, params.rangeBoundaryDate, rangeStart, rangeEnd)
    })

  return (
    Boolean(isUnavailable) ||
    isPastTimeSlot(
      params.time,
      params.selectedDate,
      params.minDateTime,
      params.minDateTimeExclusive,
    ) ||
    isOutsideOperatingHours(
      params.time,
      params.selectedDate,
      params.operatingHours,
      params.is24Hours,
    )
  )
}

function getFirstAvailableTimeSlot(params: {
  selectedDate: Date
  timeSlots: string[]
  minDateTime: Date | undefined
  minDateTimeExclusive: boolean
  operatingHours: DateTimePickerProps['operatingHours']
  is24Hours: boolean
  unavailableRanges: DateTimePickerProps['unavailableRanges']
  rangeBoundaryDate: Date | undefined
  rangeBoundaryRole?: DateTimePickerProps['rangeBoundaryRole']
}) {
  return params.timeSlots.find(
    (time) =>
      !isTimeSlotDisabled({
        time,
        selectedDate: params.selectedDate,
        minDateTime: params.minDateTime,
        minDateTimeExclusive: params.minDateTimeExclusive,
        operatingHours: params.operatingHours,
        is24Hours: params.is24Hours,
        unavailableRanges: params.unavailableRanges,
        rangeBoundaryDate: params.rangeBoundaryDate,
        rangeBoundaryRole: params.rangeBoundaryRole,
      }),
  )
}

function isDateDisabled(params: {
  date: Date
  minimumDate: Date | undefined
  timeSlots: string[]
  minDateTime: Date | undefined
  minDateTimeExclusive: boolean
  operatingHours: DateTimePickerProps['operatingHours']
  is24Hours: boolean
  unavailableRanges: DateTimePickerProps['unavailableRanges']
  rangeBoundaryDate: Date | undefined
  rangeBoundaryRole?: DateTimePickerProps['rangeBoundaryRole']
}) {
  if (params.minimumDate && params.date < params.minimumDate) {
    return true
  }

  return !getFirstAvailableTimeSlot({
    selectedDate: params.date,
    timeSlots: params.timeSlots,
    minDateTime: params.minDateTime,
    minDateTimeExclusive: params.minDateTimeExclusive,
    operatingHours: params.operatingHours,
    is24Hours: params.is24Hours,
    unavailableRanges: params.unavailableRanges,
    rangeBoundaryDate: params.rangeBoundaryDate,
    rangeBoundaryRole: params.rangeBoundaryRole,
  })
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date and time',
  minDateTime,
  minDateTimeExclusive = false,
  minuteStep = 30,
  is24Hours = true,
  timezone,
  timezoneLabel,
  operatingHours,
  unavailableRanges,
  rangeBoundaryValue,
  rangeBoundaryRole,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = useMemo(() => toDate(value), [value])
  const rangeBoundaryDate = useMemo(() => toDate(rangeBoundaryValue ?? ''), [rangeBoundaryValue])
  const timeValue = selectedDate ? format(selectedDate, 'HH:mm') : '09:00'
  const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yy HH:mm') : placeholder
  const minimumDate = minDateTime ? startOfDay(minDateTime) : undefined
  const timeSlots = useMemo(() => buildTimeSlots(minuteStep), [minuteStep])
  const localTimezone = getLocalTimezone()
  const timezoneName = timezone ? getTimeZoneName(timezone) : ''
  const selectedLocalEquivalent =
    selectedDate && timezone && timezone !== localTimezone
      ? zonedWallTimeToDate(selectedDate, timezone)
      : undefined

  function updateDate(nextDate: Date | undefined) {
    if (!nextDate) {
      return
    }

    const [hour, minute] = timeValue.split(':').map(Number)
    nextDate.setHours(hour, minute, 0, 0)

    if (minDateTime && nextDate < minDateTime) {
      nextDate = roundUpToMinuteStep(minDateTime, minuteStep)
    }

    if (
      isTimeSlotDisabled({
        time: `${String(nextDate.getHours()).padStart(2, '0')}:${String(
          nextDate.getMinutes(),
        ).padStart(2, '0')}`,
        selectedDate: nextDate,
        minDateTime,
        minDateTimeExclusive,
        operatingHours,
        is24Hours,
        unavailableRanges,
        rangeBoundaryDate,
        rangeBoundaryRole,
      })
    ) {
      const firstAvailableSlot = getFirstAvailableTimeSlot({
        selectedDate: nextDate,
        timeSlots,
        minDateTime,
        minDateTimeExclusive,
        operatingHours,
        is24Hours,
        unavailableRanges,
        rangeBoundaryDate,
        rangeBoundaryRole,
      })

      if (!firstAvailableSlot) {
        return
      }

      nextDate = timeSlotToDate(nextDate, firstAvailableSlot)
    }

    onChange(toQueryValue(nextDate))
  }

  function updateTime(time: string) {
    const baseDate = selectedDate ?? new Date()
    const [hour, minute] = time.split(':').map(Number)
    const nextDate = new Date(baseDate)
    nextDate.setHours(hour, minute, 0, 0)

    if (
      isTimeSlotDisabled({
        time,
        selectedDate: nextDate,
        minDateTime,
        minDateTimeExclusive,
        operatingHours,
        is24Hours,
        unavailableRanges,
        rangeBoundaryDate,
        rangeBoundaryRole,
      })
    ) {
      const firstAvailableSlot = getFirstAvailableTimeSlot({
        selectedDate: nextDate,
        timeSlots,
        minDateTime,
        minDateTimeExclusive,
        operatingHours,
        is24Hours,
        unavailableRanges,
        rangeBoundaryDate,
        rangeBoundaryRole,
      })

      if (firstAvailableSlot) {
        onChange(toQueryValue(timeSlotToDate(nextDate, firstAvailableSlot)))
      }

      return
    }

    onChange(toQueryValue(nextDate))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-2">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-h-12 w-full justify-start rounded-2xl bg-white/80 px-3.5 text-left font-normal"
          >
            <CalendarIcon className="size-4 text-stone-500" />
            <span className={selectedDate ? 'text-forest-900' : 'text-stone-500'}>
              {displayValue}
            </span>
          </Button>
        </PopoverTrigger>
        {value ? (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-2xl bg-white/80"
            aria-label="Clear date"
            onClick={() => onChange('')}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      {selectedDate && timezone ? (
        <div className="mt-1 grid gap-0.5 text-[0.78rem] leading-5 text-stone-500">
          <span>
            {timezoneLabel ?? 'Location time'}: {formatDateTimeLabel(selectedDate)} {timezoneName}
          </span>
          {selectedLocalEquivalent ? (
            <span>
              Your local time: {formatDateTimeLabel(selectedLocalEquivalent)}
            </span>
          ) : null}
        </div>
      ) : null}

      <PopoverContent className="w-auto">
        <div className="grid gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            disabled={(date) =>
              isDateDisabled({
                date,
                minimumDate,
                timeSlots,
                minDateTime,
                minDateTimeExclusive,
                operatingHours,
                is24Hours,
                unavailableRanges,
                rangeBoundaryDate,
                rangeBoundaryRole,
              })
            }
            onSelect={updateDate}
          />
          <div className="grid gap-2">
            <span className="text-[0.86rem] font-semibold text-stone-500">Time</span>
            <Select value={timeValue} onValueChange={updateTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem
                    key={time}
                    value={time}
                    disabled={isTimeSlotDisabled({
                      time,
                      selectedDate,
                      minDateTime,
                      minDateTimeExclusive,
                      operatingHours,
                      is24Hours,
                      unavailableRanges,
                      rangeBoundaryDate,
                      rangeBoundaryRole,
                    })}
                    className="data-[disabled]:cursor-not-allowed data-[disabled]:text-stone-500/35"
                  >
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
