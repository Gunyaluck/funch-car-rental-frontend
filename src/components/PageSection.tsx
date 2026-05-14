import type { ReactNode } from 'react'

type PageSectionProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function PageSection({
  eyebrow,
  title,
  description,
  children,
}: PageSectionProps) {
  return (
    <section className="py-10 pb-16">
      <div className="mx-auto w-[min(1200px,calc(100%-32px))] max-md:w-[min(100%,calc(100%-24px))]">
        <div className="grid gap-6 rounded-[32px] border border-black/10 bg-white/70 p-7 shadow-[0_32px_90px_rgba(71,59,37,0.1)] backdrop-blur-xl max-md:rounded-[24px] max-md:p-[22px]">
          <header className="grid gap-2">
            <span className="inline-flex w-fit items-center rounded-full border border-black/10 bg-white/65 px-3 py-2 text-[0.84rem] uppercase tracking-[0.08em] text-stone-500">
              {eyebrow}
            </span>
            <h1 className="m-0 max-w-[760px] font-(--font-heading) text-[clamp(1.8rem,3vw,3rem)] leading-none tracking-tighter">
              {title}
            </h1>
            <p className="m-0 max-w-[760px] text-stone-500">{description}</p>
          </header>

          {children}
        </div>
      </div>
    </section>
  )
}
