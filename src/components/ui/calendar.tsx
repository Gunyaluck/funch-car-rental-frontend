import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { cn } from '../../lib/utils'

export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn('p-1', className)}
      classNames={{
        months: 'flex flex-col gap-4',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-semibold',
        nav: 'flex items-center gap-1',
        button_previous:
          'absolute left-1 inline-flex size-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-forest-900 hover:bg-white',
        button_next:
          'absolute right-1 inline-flex size-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-forest-900 hover:bg-white',
        chevron: 'size-4',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'w-9 rounded-md text-[0.8rem] font-semibold text-stone-500',
        week: 'mt-2 flex w-full',
        day: 'relative size-9 p-0 text-center text-sm',
        day_button:
          'inline-flex size-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-forest-900 hover:bg-white',
        selected:
          'bg-clay-600 text-sand-50 hover:bg-clay-600 hover:text-sand-50 focus:bg-clay-600 focus:text-sand-50',
        today: 'border border-clay-600/45',
        outside: 'text-stone-500/45',
        disabled:
          'pointer-events-none opacity-35 [&_button]:cursor-not-allowed [&_button]:border-black/5 [&_button]:bg-black/5 [&_button]:text-stone-500/45',
        ...classNames,
      }}
      {...props}
    />
  )
}
