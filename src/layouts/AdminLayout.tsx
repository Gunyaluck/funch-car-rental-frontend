import { NavLink, Outlet, useLocation } from 'react-router-dom'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/cars', label: 'Cars' },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/reports', label: 'Reports' },
]

function getAdminClassName({ isActive }: { isActive: boolean }) {
  return [
    'inline-flex items-center gap-2.5 rounded-2xl px-3.5 py-[13px] transition',
    isActive
      ? 'bg-white/8 text-sand-50/95'
      : 'text-sand-50/75 hover:bg-white/8 hover:text-sand-50/95',
  ].join(' ')
}

export function AdminLayout() {
  const location = useLocation()
  const currentSection =
    adminLinks.find((link) =>
      link.end ? location.pathname === link.to : location.pathname.startsWith(link.to),
    )?.label ?? 'Dashboard'

  return (
    <div className="grid min-h-screen xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside
        className="border-b border-white/10 px-5 py-7 text-sand-50/90 xl:border-r xl:border-b-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(32, 42, 34, 0.98), rgba(39, 52, 43, 0.98)), #202a22',
        }}
      >
        <div className="mb-7 grid gap-2">
          <h1 className="m-0 text-[1.25rem] uppercase tracking-[0.08em]">Funch Admin</h1>
          <p className="m-0 text-sand-50/65">Approval, fleet, and reporting workspace.</p>
        </div>

        <nav className="grid gap-2.5" aria-label="Admin navigation">
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

      <div
        style={{
          background:
            'radial-gradient(circle at top left, rgba(35, 88, 63, 0.1), transparent 30%), linear-gradient(180deg, rgba(247, 243, 235, 0.84), rgba(252, 249, 243, 0.96))',
        }}
      >
        <div className="mx-auto w-[min(1200px,calc(100%-32px))] max-md:w-[min(100%,calc(100%-24px))]">
          <header className="flex flex-col items-start justify-between gap-4 py-[22px] pb-2.5 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 font-(--font-heading) text-[clamp(1.6rem,3vw,2.6rem)] tracking-tighter">
                {currentSection}
              </h2>
              <p className="mt-1 mb-0 text-stone-500">
                Scaffolded admin shell for management and approval flows.
              </p>
            </div>

            <NavLink
              to="/"
              className="rounded-full border border-black/12 bg-white/40 px-4 py-[11px] font-semibold text-forest-900 transition duration-150 hover:-translate-y-px"
            >
              Back to Website
            </NavLink>
          </header>

          <section className="px-0 py-2.5 pb-12">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  )
}
