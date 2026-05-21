import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CarDetailImage } from './types'

type CarGalleryLightboxProps = {
  carName: string
  images: CarDetailImage[]
  activeIndex: number | null
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  onSelectImage: (index: number) => void
}

export function CarGalleryLightbox({
  carName,
  images,
  activeIndex,
  onClose,
  onPrevious,
  onNext,
  onSelectImage,
}: CarGalleryLightboxProps) {
  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft') {
        onPrevious()
      } else if (event.key === 'ArrowRight') {
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, onClose, onNext, onPrevious])

  if (activeIndex === null || !images[activeIndex]) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/92 px-4 py-4 md:px-8" onClick={onClose}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between text-sand-50">
          <div className="text-sm font-medium text-sand-50/75">
            {activeIndex + 1} / {images.length}
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/18 bg-white/10 transition hover:bg-white/16"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-sand-50 transition hover:bg-white/16 disabled:opacity-40"
            onClick={(event) => {
              event.stopPropagation()
              onPrevious()
            }}
            disabled={images.length <= 1}
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex min-h-0 items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <img
              src={images[activeIndex].url}
              alt={`${carName} ${activeIndex + 1}`}
              className="max-h-full max-w-full rounded-[28px] object-contain shadow-[0_22px_70px_rgba(0,0,0,0.35)]"
            />
          </div>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-sand-50 transition hover:bg-white/16 disabled:opacity-40"
            onClick={(event) => {
              event.stopPropagation()
              onNext()
            }}
            disabled={images.length <= 1}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {images.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-1" onClick={(event) => event.stopPropagation()}>
            {images.map((image, index) => {
              const isActive = index === activeIndex

              return (
                <button
                  type="button"
                  key={image.id}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border transition ${
                    isActive
                      ? 'border-white shadow-[0_0_0_2px_rgba(255,255,255,0.2)]'
                      : 'border-white/12 opacity-75 hover:opacity-100'
                  }`}
                  onClick={() => onSelectImage(index)}
                >
                  <img
                    src={image.url}
                    alt={`${carName} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
