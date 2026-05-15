import { ArrowRight, CalendarDays, CarFront, ChevronLeft, ChevronRight, Gauge, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { buttonVariants } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { listCars } from '../features/cars/api'
import { defaultCarFilters } from '../features/cars/constants'
import type { CarListItem } from '../features/cars/types'
import { formatMoney } from '../features/cars/utils/car-detail-utils'
import { cn } from '../lib/utils'

const metrics = [
  { value: '24/7', label: 'self-service booking' },
  { value: '6', label: 'sample destinations' },
  { value: '2 hr', label: 'minimum advance' },
]

const fallbackHeroSlide = {
  image: '',
  alt: 'Featured rental car',
  label: 'Featured cars',
  title: 'Find your next rental',
  tags: ['Flexible pickup', 'Local pricing', 'Easy booking'],
}

function carToHeroSlide(car: CarListItem) {
  return {
    image: car.coverImage ?? '',
    alt: car.name,
    label: `${car.city} pickup`,
    title: car.name,
    tags: [
      car.transmission,
      `${car.seats} seats`,
      `From ${formatMoney(car.currencyCode, car.hourlyRate)}/hr`,
    ],
  }
}

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
  const [featuredCars, setFeaturedCars] = useState<CarListItem[]>([])
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const heroSlides = featuredCars.length > 0
    ? featuredCars.map(carToHeroSlide)
    : [fallbackHeroSlide]
  const activeSlide = heroSlides[activeSlideIndex]

  useEffect(() => {
    let isCurrent = true

    async function fetchFeaturedCars() {
      try {
        const result = await listCars(defaultCarFilters, 6)

        if (isCurrent) {
          setFeaturedCars(result.data.filter((car) => car.isAvailable !== false))
          setActiveSlideIndex(0)
        }
      } catch {
        if (isCurrent) {
          setFeaturedCars([])
        }
      }
    }

    fetchFeaturedCars()

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) => (currentIndex + 1) % heroSlides.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [heroSlides.length])

  function showPreviousSlide() {
    setActiveSlideIndex(
      (currentIndex) => (currentIndex - 1 + heroSlides.length) % heroSlides.length,
    )
  }

  function showNextSlide() {
    setActiveSlideIndex((currentIndex) => (currentIndex + 1) % heroSlides.length)
  }

  return (
    <>
      <section className="relative overflow-hidden pt-10 pb-12 md:pt-20 md:pb-14">
        <div className="mx-auto grid w-[min(1200px,calc(100%-32px))] grid-cols-12 items-center gap-8 max-md:w-[min(100%,calc(100%-24px))]">
          <div className="col-span-12 grid gap-5 lg:col-span-6">
            <div className="grid gap-4">
              <h1 className="m-0 max-w-[760px] font-body text-[3.25rem] leading-[0.95] font-black tracking-normal md:text-[5.5rem]">
                Rent the right car.
              </h1>
              <p className="m-0 max-w-[620px] text-[1.08rem] leading-7 text-stone-500">
                Find available cars by destination, dates, and travel style.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <NavLink to="/cars" className={cn(buttonVariants(), 'group')}>
              Find a Car
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
              {heroSlides.map((slide, index) => (
                slide.image ? (
                  <img
                    key={slide.title}
                    src={slide.image}
                    alt={slide.alt}
                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(${(index - activeSlideIndex) * 100}%)` }}
                  />
                ) : (
                  <div
                    key={slide.title}
                    className="absolute inset-0 bg-[linear-gradient(135deg,rgba(35,88,63,0.95),rgba(165,84,44,0.72))] transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(${(index - activeSlideIndex) * 100}%)` }}
                  />
                )
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,48,36,0.05),rgba(32,48,36,0.72))]" />
              <div className="absolute top-5 right-5 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/24 bg-white/18 text-sand-50 backdrop-blur hover:bg-white/28"
                  aria-label="Previous featured car"
                  onClick={showPreviousSlide}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/24 bg-white/18 text-sand-50 backdrop-blur hover:bg-white/28"
                  aria-label="Next featured car"
                  onClick={showNextSlide}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
              <div className="absolute right-5 bottom-5 left-5 grid gap-3 rounded-[28px] border border-white/18 bg-white/14 p-4 text-sand-50 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="m-0 text-sm text-sand-50/72">{activeSlide.label}</p>
                    <h2 className="m-0 font-(--font-heading) text-[1.6rem]">
                      {activeSlide.title}
                    </h2>
                  </div>
                  <Gauge className="size-6 text-sand-50/80" />
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {activeSlide.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/16 px-3 py-2">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      className={cn(
                        'h-2 rounded-full transition-all',
                        index === activeSlideIndex ? 'w-8 bg-sand-50' : 'w-2 bg-white/38',
                      )}
                      aria-label={`Show ${slide.title}`}
                      onClick={() => setActiveSlideIndex(index)}
                    />
                  ))}
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
