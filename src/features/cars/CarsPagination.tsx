import { Button } from '../../components/ui/button'

type CarsPaginationProps = {
  currentPage: number
  totalPages: number
  totalCars: number
  carsPerPage: number
  onPrevious: () => void
  onNext: () => void
}

export function CarsPagination({
  currentPage,
  totalPages,
  totalCars,
  carsPerPage,
  onPrevious,
  onNext,
}: CarsPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-black/8 bg-white/55 px-4 py-3 backdrop-blur">
      <p className="m-0 text-sm text-stone-500">
        Showing {(currentPage - 1) * carsPerPage + 1}-{Math.min(currentPage * carsPerPage, totalCars)} of {totalCars} cars
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={currentPage === 1} onClick={onPrevious}>
          Previous
        </Button>
        <span className="min-w-20 text-center text-sm font-medium text-stone-600">
          {currentPage} / {totalPages}
        </span>
        <Button type="button" variant="outline" disabled={currentPage === totalPages} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
