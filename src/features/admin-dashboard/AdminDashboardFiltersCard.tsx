import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import type { BookingStatus } from '../bookings/types'
import { STATUS_OPTIONS } from './utils'

type CountryOption = {
  code: string
  label: string
}

type AdminDashboardFiltersCardProps = {
  searchTerm: string
  countryFilter: string
  statusFilter: BookingStatus | 'ALL'
  countryOptions: CountryOption[]
  onSearchTermChange: (value: string) => void
  onCountryFilterChange: (value: string) => void
  onStatusFilterChange: (value: BookingStatus | 'ALL') => void
  onClearFilters: () => void
  onExportCsv: () => void
}

export function AdminDashboardFiltersCard({
  searchTerm,
  countryFilter,
  statusFilter,
  countryOptions,
  onSearchTermChange,
  onCountryFilterChange,
  onStatusFilterChange,
  onClearFilters,
  onExportCsv,
}: AdminDashboardFiltersCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Badge variant="muted">Filters</Badge>
          <h2 className="m-0 text-xl font-semibold">Filterable analytics</h2>
          <p className="m-0 text-stone-500">
            Narrow the dashboard by market, booking status, or the latest booking activity.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
          <Input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search by booking ID, customer, email, car, or city"
          />

          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Country</span>
            <Select value={countryFilter} onValueChange={onCountryFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All countries</SelectItem>
                {countryOptions.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Booking status</span>
            <Select
              value={statusFilter}
              onValueChange={(value) => onStatusFilterChange(value as BookingStatus | 'ALL')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'ALL' ? 'All statuses' : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-2xl border border-black/12 bg-white/60 px-4 py-[11px] font-semibold text-forest-900 transition hover:-translate-y-px"
              onClick={onClearFilters}
            >
              Clear filters
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-2xl border border-black/12 bg-forest-900 px-4 py-[11px] font-semibold text-sand-50 transition hover:-translate-y-px"
              onClick={onExportCsv}
            >
              Export CSV
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
