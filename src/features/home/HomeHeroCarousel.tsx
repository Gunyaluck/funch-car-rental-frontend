import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'
import type { HomeHeroSlide } from './home-data'

type HomeHeroCarouselProps = {
  slides: HomeHeroSlide[]
  activeSlideIndex: number
  onPrevious: () => void
  onNext: () => void
  onSelectSlide: (index: number) => void
}

export function HomeHeroCarousel({
  slides,
  activeSlideIndex,
  onPrevious,
  onNext,
  onSelectSlide,
}: HomeHeroCarouselProps) {
  const activeSlide = slides[activeSlideIndex]

  return (
    <div className="grid gap-4">
      <div className="relative min-h-[560px] overflow-hidden rounded-[40px] border border-black/10 bg-forest-900 shadow-[0_34px_90px_rgba(32,48,36,0.22)] max-md:min-h-[420px]">
        {slides.map((slide, index) =>
          slide.image ? (
            <img
              key={slide.title}
              src={slide.image}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover brightness-110 contrast-110 saturate-110 transition-transform duration-700 ease-out"
              style={{ transform: `translateX(${(index - activeSlideIndex) * 100}%)` }}
            />
          ) : (
            <div
              key={slide.title}
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(35,88,63,0.95),rgba(165,84,44,0.72))] transition-transform duration-700 ease-out"
              style={{ transform: `translateX(${(index - activeSlideIndex) * 100}%)` }}
            />
          ),
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(32,48,36,0.12)_42%,rgba(32,48,36,0.28))]" />
        <div className="absolute top-5 right-5 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-white/24 bg-white/18 text-sand-50 backdrop-blur hover:bg-white/28"
            aria-label="Previous featured car"
            onClick={onPrevious}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-white/24 bg-white/18 text-sand-50 backdrop-blur hover:bg-white/28"
            aria-label="Next featured car"
            onClick={onNext}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
        <div className="absolute right-5 bottom-5 left-5 flex flex-wrap gap-2 text-sm text-sand-50">
          <span className="rounded-full bg-black/28 px-3 py-2 backdrop-blur-md">
            {activeSlide.label}
          </span>
          {activeSlide.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-black/22 px-3 py-2 backdrop-blur-md">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-[30px] border border-black/10 bg-white/62 px-5 py-4 backdrop-blur-xl">
        <div className="grid gap-1">
          <p className="m-0 text-sm text-stone-500">{activeSlide.label}</p>
          <h2 className="m-0 font-(--font-heading) text-[1.9rem] leading-tight text-forest-900">
            {activeSlide.title}
          </h2>
        </div>
        <div className="flex gap-2">
          {activeSlide.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white px-3 py-2 text-sm text-stone-600 shadow-[0_8px_20px_rgba(71,59,37,0.08)]">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={cn(
                'h-2 rounded-full transition-all',
                index === activeSlideIndex ? 'w-8 bg-forest-900' : 'w-2 bg-black/18',
              )}
              aria-label={`Show ${slide.title}`}
              onClick={() => onSelectSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
