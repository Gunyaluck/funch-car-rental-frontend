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
    <article className={wide ? 'placeholder-wide' : 'placeholder-panel'}>
      <span className="panel-label">{label}</span>
      <h2 className="panel-title">{title}</h2>
      <p className="panel-copy">{description}</p>
      {children}
    </article>
  )
}
