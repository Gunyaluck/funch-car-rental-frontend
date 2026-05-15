import { AlertTriangle } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  children: ReactNode
}

export function Alert({ title, children, className, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-red-700/20 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-[0_12px_28px_rgba(185,28,28,0.08)]',
        className,
      )}
      role="alert"
      {...props}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-700" />
      <div className="grid gap-1">
        {title ? <strong className="text-red-800">{title}</strong> : null}
        <div className="text-red-900/85">{children}</div>
      </div>
    </div>
  )
}
