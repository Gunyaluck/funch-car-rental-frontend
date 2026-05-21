import type { CarDetailItem } from './types'

type CarDetailHeroProps = {
  car: CarDetailItem
  coverImage?: string
  onOpenGallery?: () => void
}

export function CarDetailHero({ car, coverImage, onOpenGallery }: CarDetailHeroProps) {
  return (
    <button
      type="button"
      onClick={onOpenGallery}
      disabled={!coverImage || !onOpenGallery}
      className="relative min-h-[430px] overflow-hidden rounded-[34px] border border-black/10 bg-forest-900 text-left shadow-[0_30px_80px_rgba(32,48,36,0.18)] transition hover:-translate-y-px disabled:cursor-default max-md:min-h-[320px]"
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={car.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,48,36,0.08),rgba(32,48,36,0.74))]" />
      <div className="absolute right-5 bottom-5 left-5 grid gap-3 text-sand-50">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/18 px-3 py-2 text-sm backdrop-blur">
            {car.category}
          </span>
          <span className="rounded-full bg-white/18 px-3 py-2 text-sm backdrop-blur">
            {car.transmission}
          </span>
          <span className="rounded-full bg-white/18 px-3 py-2 text-sm backdrop-blur">
            {car.status}
          </span>
        </div>
        <h2 className="m-0 font-(--font-heading) text-[clamp(2rem,4vw,3.3rem)] leading-none">
          {car.brand} {car.model}
        </h2>
      </div>
    </button>
  )
}
