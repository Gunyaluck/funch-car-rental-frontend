import * as PopoverPrimitive from '@radix-ui/react-popover'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

type PopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-3xl border border-black/10 bg-sand-50 p-4 text-forest-900 shadow-[0_24px_64px_rgba(71,59,37,0.16)] outline-none',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
