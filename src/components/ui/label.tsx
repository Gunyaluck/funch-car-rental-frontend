import type { HTMLAttributes, LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('grid gap-2', className)} {...props} />
}

export function FieldLabel({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-[0.92rem] font-semibold text-stone-500', className)}
      {...props}
    />
  )
}
