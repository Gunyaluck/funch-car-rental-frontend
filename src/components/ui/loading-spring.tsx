import { cn } from '../../lib/utils'

type LoadingSpringProps = {
  label?: string
  className?: string
}

export function LoadingSpring({ label = 'Loading', className }: LoadingSpringProps) {
  return (
    <div className={cn('flex items-center gap-3 text-sm font-semibold text-forest-700', className)}>
      <span className="flex h-8 items-end gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className="loading-spring-dot size-2.5 rounded-full bg-forest-700"
            style={{ animationDelay: `${item * 120}ms` }}
          />
        ))}
      </span>
      <span>{label}</span>
    </div>
  )
}
