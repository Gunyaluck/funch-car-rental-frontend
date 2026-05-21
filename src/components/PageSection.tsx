import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type PageSectionProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  variant?: 'panel' | 'plain'
  children: ReactNode
}

export function PageSection({
  eyebrow,
  title,
  description,
  align = 'left',
  variant = 'panel',
  children,
}: PageSectionProps) {
  return (
    <section className="py-10 pb-16">
      <div className="mx-auto w-[min(1200px,calc(100%-32px))] max-md:w-[min(100%,calc(100%-24px))]">
        <div
          className={cn(
            'grid gap-6',
            variant === 'panel'
              ? 'rounded-[32px] border border-black/10 bg-white/70 p-7 shadow-[0_32px_90px_rgba(71,59,37,0.1)] backdrop-blur-xl max-md:rounded-[24px] max-md:p-[22px]'
              : 'py-7',
          )}
        >
          <header className={cn('grid gap-2', align === 'center' && 'justify-items-center text-center')}>
            {eyebrow ? (
              <span className="inline-flex w-fit items-center rounded-full border border-black/10 bg-white/65 px-3 py-2 text-[0.84rem] uppercase tracking-[0.08em] text-stone-500">
                {eyebrow}
              </span>
            ) : null}
            <h1 className="m-0 max-w-[760px] text-[clamp(1.8rem,3vw,3rem)] tracking-tighter font-semibold">
              {title}
            </h1>
            {description ? (
              <p className="m-0 max-w-[760px] text-stone-500">{description}</p>
            ) : null}
          </header>

          {children}
        </div>
      </div>
    </section>
  )
}
