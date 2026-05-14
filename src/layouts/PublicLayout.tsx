import { CarFront, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { buttonVariants } from '../components/ui/button'
import { cn } from '../lib/utils'

const publicLinks = [
  { to: '/cars', label: 'Cars' },
  { to: '/checkout', label: 'Checkout' },
  { to: '/my-bookings', label: 'My Bookings' },
]

function getNavClassName({ isActive }: { isActive: boolean }) {
  return [
    'rounded-full px-3.5 py-2 text-sm font-semibold transition duration-150',
    isActive
      ? 'bg-forest-900 text-sand-50 shadow-[0_10px_26px_rgba(32,48,36,0.18)]'
      : 'text-stone-500 hover:bg-black/5 hover:text-forest-900',
  ].join(' ')
}

export function PublicLayout() {
  return (
    <div className="min-h-screen text-forest-900">
      <header className="sticky top-4 z-20 px-4">
        <div className="mx-auto flex min-h-[68px] w-[min(1200px,calc(100vw-32px))] items-center justify-between gap-3 rounded-full border border-black/10 bg-sand-50/78 px-3.5 shadow-[0_22px_70px_rgba(71,59,37,0.14)] backdrop-blur-2xl max-md:min-h-0 max-md:w-[min(100%,calc(100vw-24px))] max-md:flex-wrap max-md:rounded-[26px] max-md:py-3">
          <NavLink to="/" className="inline-flex items-center gap-2.5 pl-1">
            <span className="flex size-10 items-center justify-center rounded-full bg-forest-900 text-sand-50">
              <CarFront className="size-5" />
            </span>
            <span className="grid leading-tight">
              <span className="font-(--font-heading) text-[1.05rem] font-bold uppercase tracking-[0.12em]">
              Funch Drive
              </span>
              <span className="text-[0.78rem] text-stone-500">Global rentals</span>
            </span>
          </NavLink>

          <nav
            className="flex items-center rounded-full bg-white/58 p-1 max-md:order-3 max-md:w-full max-md:justify-between"
            aria-label="Public navigation"
          >
            {publicLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getNavClassName}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'max-md:hidden')}
              aria-label="Sign in"
            >
              <UserRound className="size-4" />
            </NavLink>
            <NavLink
              to="/register"
              className={cn(buttonVariants(), 'max-sm:hidden')}
            >
              Create Account
            </NavLink>
          </div>
        </div>
      </header>

      <main className="-mt-[92px] pt-[92px]">
        <Outlet />
      </main>

      <footer className="px-0 py-8 pb-12 text-stone-500">
        <div className="mx-auto flex w-[min(1200px,calc(100%-32px))] flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-6 text-sm max-md:w-[min(100%,calc(100%-24px))]">
          <span>Funch Drive rental booking platform</span>
          <NavLink to="/admin" className="font-semibold text-forest-900">
            Admin
          </NavLink>
        </div>
      </footer>
    </div>
  )
}
