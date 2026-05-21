import type { ReactNode } from 'react'

type PlaceholderPanelProps = {
  label: string
  title: string
  description: string
  children?: ReactNode
  wide?: boolean
}

export function PlaceholderPanel({
  label,
  title,
  description,
  children,
  wide = false,
}: PlaceholderPanelProps) {
  return (
    <article
      className={[
        wide ? 'col-span-12' : 'col-span-12 min-h-[220px] md:col-span-6 xl:col-span-4',
        'rounded-3xl border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(244,239,228,0.7))] p-5 shadow-[0_24px_64px_rgba(71,59,37,0.08)]',
      ].join(' ')}
    >
      <span className="mb-2.5 inline-flex items-center rounded-full bg-forest-700/10 px-2.5 py-[7px] text-[0.8rem] font-bold uppercase tracking-[0.08em] text-forest-700">
        {label}
      </span>
      <h2 className="m-0 font-(--font-heading) text-[1.35rem]">{title}</h2>
      <p className="m-0 text-stone-500">{description}</p>
      {children}
    </article>
  )
}
