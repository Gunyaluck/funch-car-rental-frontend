import { NavLink } from 'react-router-dom'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function HomePage() {
  return (
    <>
      <section className="hero-strip">
        <div className="app-grid hero-content">
          <span className="eyebrow">Foundation Ready</span>
          <h1 className="hero-title">Build the rental journey before styling the edges.</h1>
          <p className="hero-description">
            This shell already separates public booking flow and admin approval
            flow, so listing, detail, pricing, auth, and booking features can be
            added without changing route architecture again.
          </p>

          <div className="hero-actions">
            <NavLink to="/cars" className="nav-solid">
              Browse Cars
            </NavLink>
            <NavLink to="/admin" className="nav-ghost">
              Open Admin Shell
            </NavLink>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="app-grid">
          <div className="placeholder-grid">
            <PlaceholderPanel
              label="Public"
              title="Vehicle discovery flow"
              description="Listing and destination filters will live under /cars with route-safe expansion for search, country, and availability filters."
            />

            <PlaceholderPanel
              label="Checkout"
              title="Quote and booking flow"
              description="Pickup-return date selection, pricing quote, login/register handoff, and booking creation will plug into this foundation."
            />

            <PlaceholderPanel
              label="Admin"
              title="Approval workspace"
              description="Fleet, booking approval, member management, and report pages already have dedicated admin routes."
            />
          </div>
        </div>
      </section>
    </>
  )
}
