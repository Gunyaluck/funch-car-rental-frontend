import { BookOpen, CarFront, LogOut, Settings, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { buttonVariants } from '../components/ui/button-variants'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { clearAuthSession, getStoredAuthSession, subscribeToAuthSessionChange } from '../features/auth/storage'
import type { AuthSession } from '../features/auth/types'
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
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession())
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  useEffect(() => {
    return subscribeToAuthSessionChange(() => setSession(getStoredAuthSession()))
  }, [])

  function handleSignOut() {
    clearAuthSession()
    setSession(null)
    setIsProfileMenuOpen(false)

    if (
      location.pathname === '/checkout' ||
      location.pathname === '/my-bookings' ||
      location.pathname === '/profile'
    ) {
      navigate('/login', { replace: true })
    }
  }

  const userName = session?.user.firstName ?? session?.user.email

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

          {session ? (
            <div className="flex items-center gap-2">
              <Popover open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="max-w-[190px] px-3 max-sm:size-11 max-sm:p-0">
                    <UserRound className="size-4 shrink-0" />
                    <span className="truncate max-sm:hidden">{userName}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 rounded-2xl p-2">
                  <div className="grid gap-1">
                    <div className="px-3 py-2">
                      <p className="m-0 truncate text-sm font-semibold text-forest-900">{userName}</p>
                      <p className="m-0 truncate text-xs text-stone-500">{session.user.email}</p>
                    </div>
                    <NavLink
                      to="/profile"
                      className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="size-4" />
                      Profile
                    </NavLink>
                    <NavLink
                      to="/my-bookings"
                      className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <BookOpen className="size-4" />
                      My Bookings
                    </NavLink>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start text-red-700 hover:text-red-800')}
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
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
          )}
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
