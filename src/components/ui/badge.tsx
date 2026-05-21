import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit items-center rounded-full px-2.5 py-[7px] text-[0.8rem] font-bold uppercase tracking-[0.08em]',
  {
    variants: {
      variant: {
        default: 'bg-forest-700/10 text-forest-700',
        muted: 'border border-black/10 bg-white/65 text-stone-500',
        chip: 'bg-black/5 text-forest-900',
        success: 'border border-forest-700/15 bg-forest-700/10 text-forest-800',
        danger: 'border border-red-700/15 bg-red-50 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
