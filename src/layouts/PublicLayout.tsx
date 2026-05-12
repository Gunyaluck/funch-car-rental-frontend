import { NavLink, Outlet } from 'react-router-dom'

const publicLinks = [
  { to: '/cars', label: 'Cars' },
  { to: '/checkout', label: 'Checkout' },
  { to: '/my-bookings', label: 'My Bookings' },
]

function getNavClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link'
}

export function PublicLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="app-grid topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">Funch Drive</span>
            <span className="brand-copy">Global rental booking platform</span>
          </NavLink>

          <nav className="nav-row" aria-label="Public navigation">
            {publicLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getNavClassName}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-row">
            <NavLink to="/login" className="nav-ghost">
              Sign In
            </NavLink>
            <NavLink to="/register" className="nav-solid">
              Create Account
            </NavLink>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer-shell">
        <div className="app-grid">
          Routing foundation is ready for car listing, booking, auth, and admin
          approval flows.
        </div>
      </footer>
    </div>
  )
}
