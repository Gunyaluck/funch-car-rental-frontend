import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-2xl border border-black/12 bg-white/80 px-3.5 text-forest-900 outline-none transition focus:border-clay-600/35 focus:ring-2 focus:ring-clay-600/20',
        className,
      )}
      {...props}
    />
  )
}
