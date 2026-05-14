import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { Button } from './button'
import { Calendar } from './calendar'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

type DateTimePickerProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
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

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date and time',
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = useMemo(() => toDate(value), [value])
  const timeValue = selectedDate ? format(selectedDate, 'HH:mm') : '09:00'
  const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yy HH:mm') : placeholder

  function updateDate(nextDate: Date | undefined) {
    if (!nextDate) {
      return
    }

    const [hour, minute] = timeValue.split(':').map(Number)
    nextDate.setHours(hour, minute, 0, 0)
    onChange(toQueryValue(nextDate))
  }

  function updateTime(time: string) {
    const baseDate = selectedDate ?? new Date()
    const [hour, minute] = time.split(':').map(Number)
    const nextDate = new Date(baseDate)
    nextDate.setHours(hour, minute, 0, 0)
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
            onSelect={updateDate}
          />
          <div className="grid gap-2">
            <span className="text-[0.86rem] font-semibold text-stone-500">Time</span>
            <Input
              type="time"
              value={timeValue}
              onChange={(event) => updateTime(event.target.value)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
