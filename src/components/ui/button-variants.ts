import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-600/25 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-clay-600 text-sand-50 shadow-[0_14px_28px_rgba(165,84,44,0.22)] hover:-translate-y-px',
        outline:
          'border border-black/12 bg-white/45 text-forest-900 hover:-translate-y-px hover:bg-white/70',
        ghost: 'text-forest-900 hover:bg-black/5',
      },
      size: {
        default: 'min-h-11 px-4 py-2.5',
        sm: 'min-h-9 px-3 py-2 text-xs',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
