import { NavLink, Outlet, useLocation } from 'react-router-dom'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/cars', label: 'Cars' },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/reports', label: 'Reports' },
]

function getAdminClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'admin-link active' : 'admin-link'
}

export function AdminLayout() {
  const location = useLocation()
  const currentSection =
    adminLinks.find((link) =>
      link.end ? location.pathname === link.to : location.pathname.startsWith(link.to),
    )?.label ?? 'Dashboard'

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1>Funch Admin</h1>
          <p>Approval, fleet, and reporting workspace.</p>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={getAdminClassName}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <div className="app-grid">
          <header className="admin-topbar">
            <div>
              <h2>{currentSection}</h2>
              <p>Scaffolded admin shell for management and approval flows.</p>
            </div>

            <NavLink to="/" className="nav-ghost">
              Back to Website
            </NavLink>
          </header>

          <section className="admin-content">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  )
}
