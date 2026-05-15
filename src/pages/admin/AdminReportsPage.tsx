import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminReportsPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <PlaceholderPanel
        label="Summary"
        title="Booking summary report"
        description="Review revenue totals, bookings by country, approval timing, and fleet utilization."
      />
      <PlaceholderPanel
        label="Export"
        title="Operational exports"
        description="Download reports for management reviews and operational planning."
      />
      <PlaceholderPanel
        label="Slices"
        title="Filterable analytics"
        description="Filter reports by date range, country, city, and vehicle category."
      />
    </div>
  )
}
