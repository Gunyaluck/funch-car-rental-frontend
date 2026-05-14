import { ArrowRight, CalendarDays, CarFront, Gauge, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import heroImage from '../assets/hero.png'
import { Badge } from '../components/ui/badge'
import { buttonVariants } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { cn } from '../lib/utils'

const metrics = [
  { value: '24/7', label: 'self-service booking' },
  { value: '6', label: 'sample destinations' },
  { value: '2 hr', label: 'minimum advance' },
]

const steps = [
  {
    icon: CarFront,
    title: 'Choose a vehicle',
    description: 'Filter by destination, car type, seats, and transmission.',
  },
  {
    icon: CalendarDays,
    title: 'Set the schedule',
    description: 'Pick pickup and return times before checking availability.',
  },
  {
    icon: ShieldCheck,
    title: 'Reserve with confidence',
    description: 'Booking rules and approval states are ready for the next flow.',
  },
]

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pt-10 pb-12 md:pt-16 md:pb-14">
        <div className="mx-auto grid w-[min(1200px,calc(100%-32px))] grid-cols-12 items-center gap-8 max-md:w-[min(100%,calc(100%-24px))]">
          <div className="col-span-12 grid gap-5 lg:col-span-6">
            <Badge variant="muted" className="px-3 py-2">
              Premium car rental
            </Badge>
            <div className="grid gap-4">
              <h1 className="m-0 max-w-[760px] font-(--font-heading) text-[clamp(3rem,6vw,6.25rem)] leading-[0.9] tracking-tighter">
                Drive-ready cars for every trip.
              </h1>
              <p className="m-0 max-w-[620px] text-[1.08rem] leading-7 text-stone-500">
                Browse vehicles by destination, schedule your pickup window, and
                move into booking with a clean rental workflow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <NavLink to="/cars" className={cn(buttonVariants(), 'group')}>
                Browse Cars
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </NavLink>
              <NavLink to="/my-bookings" className={buttonVariants({ variant: 'outline' })}>
                My Bookings
              </NavLink>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 max-sm:grid-cols-1">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-black/10 bg-white/58 px-4 py-3.5 backdrop-blur"
                >
                  <strong className="block font-(--font-heading) text-[1.55rem] leading-none">
                    {metric.value}
                  </strong>
                  <span className="text-[0.86rem] text-stone-500">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="relative min-h-[440px] overflow-hidden rounded-[36px] border border-black/10 bg-forest-900 shadow-[0_34px_90px_rgba(32,48,36,0.22)] max-md:min-h-[360px]">
              <img
                src={heroImage}
                alt="Premium rental car"
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,48,36,0.05),rgba(32,48,36,0.72))]" />
              <div className="absolute right-5 bottom-5 left-5 grid gap-3 rounded-[28px] border border-white/18 bg-white/14 p-4 text-sand-50 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="m-0 text-sm text-sand-50/72">Featured route</p>
                    <h2 className="m-0 font-(--font-heading) text-[1.6rem]">
                      Tokyo city pickup
                    </h2>
                  </div>
                  <Gauge className="size-6 text-sand-50/80" />
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-white/16 px-3 py-2">Automatic</span>
                  <span className="rounded-full bg-white/16 px-3 py-2">5 seats</span>
                  <span className="rounded-full bg-white/16 px-3 py-2">From JPY 900/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid w-[min(1200px,calc(100%-32px))] grid-cols-3 gap-4 max-md:w-[min(100%,calc(100%-24px))] max-lg:grid-cols-1">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Card key={step.title}>
                <CardContent className="grid gap-4">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-forest-700/10 text-forest-700">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="m-0 font-(--font-heading) text-[1.35rem]">
                      {step.title}
                    </h2>
                    <p className="mt-1 mb-0 text-stone-500">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </>
  )
}
