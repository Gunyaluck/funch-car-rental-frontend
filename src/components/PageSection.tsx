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
    <section className="section-shell">
      <div className="app-grid">
        <div className="page-card">
          <header className="page-header">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="page-title">{title}</h1>
            <p className="page-copy">{description}</p>
          </header>

          {children}
        </div>
      </div>
    </section>
  )
}
