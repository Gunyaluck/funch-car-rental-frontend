import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { buttonVariants } from '../components/ui/button-variants'
import { Card, CardContent } from '../components/ui/card'
import { listCars } from '../features/cars/api'
import { defaultCarFilters } from '../features/cars/constants'
import { getCountryName } from '../features/cars/country-names'
import { HomeHeroCarousel } from '../features/home/HomeHeroCarousel'
import { carToHeroSlide, fallbackHeroSlide, homeMetrics, homeSteps } from '../features/home/home-data'
import type { CarListItem } from '../features/cars/types'
import { cn } from '../lib/utils'

export function HomePage() {
  const [availableCars, setAvailableCars] = useState<CarListItem[]>([])
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const featuredCars = availableCars.slice(0, 6)
  const availableCountries = Array.from(new Set(availableCars.map((car) => car.countryCode)))
    .sort()
    .map((countryCode) => ({
      code: countryCode,
      label: getCountryName(countryCode),
    }))
  const heroSlides = featuredCars.length > 0
    ? featuredCars.map(carToHeroSlide)
    : [fallbackHeroSlide]

  useEffect(() => {
    let isCurrent = true

    async function fetchFeaturedCars() {
      try {
        const result = await listCars(defaultCarFilters, 100)

        if (isCurrent) {
          setAvailableCars(result.data.filter((car) => car.isAvailable !== false))
          setActiveSlideIndex(0)
        }
      } catch {
        if (isCurrent) {
          setAvailableCars([])
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
        <div className="mx-auto grid w-[min(1320px,calc(100%-32px))] grid-cols-12 items-center gap-8 max-md:w-[min(100%,calc(100%-24px))]">
          <div className="col-span-12 grid min-w-0 gap-5 lg:col-span-5">
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
              {homeMetrics.map((metric) => (
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

            {availableCountries.length > 0 ? (
              <div className="grid min-w-0 gap-2 pt-2">
                <span className="text-[0.78rem] font-black uppercase tracking-[0.14em] text-forest-900">
                  Available Countries
                </span>
                <div className="max-w-full overflow-hidden rounded-[28px] border border-black/8 bg-white/60 px-4 py-3 backdrop-blur-sm">
                  <div className="relative max-w-full overflow-hidden">
                    <div
                      className="flex w-max items-center gap-2 pr-2"
                      style={{ animation: 'supportedCountriesMarquee 24s linear infinite' }}
                    >
                      {[...availableCountries, ...availableCountries].map((country, index) => (
                        <span
                          key={`${country.code}-${index}`}
                          className="rounded-full border border-black/8 bg-white px-3 py-2 text-sm font-semibold whitespace-nowrap text-forest-900"
                        >
                          {country.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="col-span-12 lg:col-span-7">
            <HomeHeroCarousel
              slides={heroSlides}
              activeSlideIndex={activeSlideIndex}
              onPrevious={showPreviousSlide}
              onNext={showNextSlide}
              onSelectSlide={setActiveSlideIndex}
            />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid w-[min(1200px,calc(100%-32px))] grid-cols-3 gap-4 max-md:w-[min(100%,calc(100%-24px))] max-lg:grid-cols-1">
          {homeSteps.map((step) => {
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

      <style>
        {`
          @keyframes supportedCountriesMarquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}
      </style>

    </>
  )
}
