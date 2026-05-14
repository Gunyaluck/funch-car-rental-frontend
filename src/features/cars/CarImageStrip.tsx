import type { CarDetailImage } from './types'

type CarImageStripProps = {
  carName: string
  images: CarDetailImage[]
}

export function CarImageStrip({ carName, images }: CarImageStripProps) {
  if (images.length <= 1) {
    return null
  }

  return (
    <section className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative h-28 overflow-hidden rounded-3xl border border-black/10 bg-black/5"
        >
          <img
            src={image.url}
            alt={`${carName} ${image.sortOrder + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </section>
  )
}
