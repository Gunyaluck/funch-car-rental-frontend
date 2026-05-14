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
  operatingHours?: Array<{
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }>
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
    slotMinutes > minutesFromTime(hours.closeTime)
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
}) {
  return (
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
  operatingHours,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = useMemo(() => toDate(value), [value])
  const timeValue = selectedDate ? format(selectedDate, 'HH:mm') : '09:00'
  const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yy HH:mm') : placeholder
  const minimumDate = minDateTime ? startOfDay(minDateTime) : undefined
  const timeSlots = useMemo(() => buildTimeSlots(minuteStep), [minuteStep])

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
      })
    ) {
      const firstAvailableSlot = getFirstAvailableTimeSlot({
        selectedDate: nextDate,
        timeSlots,
        minDateTime,
        minDateTimeExclusive,
        operatingHours,
        is24Hours,
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
      (minDateTime && nextDate < minDateTime) ||
      isOutsideOperatingHours(time, nextDate, operatingHours, is24Hours)
    ) {
      const firstAvailableSlot = getFirstAvailableTimeSlot({
        selectedDate: nextDate,
        timeSlots,
        minDateTime,
        minDateTimeExclusive,
        operatingHours,
        is24Hours,
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
                    })}
                    className="data-[disabled]:text-stone-500/35"
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
