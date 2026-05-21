import type { CarDetailImage } from './types'

type CarImageStripProps = {
  carName: string
  images: CarDetailImage[]
  onSelectImage?: (index: number) => void
}

export function CarImageStrip({ carName, images, onSelectImage }: CarImageStripProps) {
  if (images.length <= 1) {
    return null
  }

  return (
    <section className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
      {images.map((image, index) => (
        <button
          type="button"
          key={image.id}
          onClick={() => onSelectImage?.(index)}
          className="relative h-28 overflow-hidden rounded-3xl border border-black/10 bg-black/5 transition hover:-translate-y-px"
        >
          <img
            src={image.url}
            alt={`${carName} ${image.sortOrder + 1}`}
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </section>
  )
}
