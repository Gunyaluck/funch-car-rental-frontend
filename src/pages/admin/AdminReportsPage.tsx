import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminReportsPage() {
  return (
    <div className="placeholder-grid">
      <PlaceholderPanel
        label="Summary"
        title="Booking summary report"
        description="Use this route for revenue totals, bookings by country, average approval time, and utilization charts."
      />
      <PlaceholderPanel
        label="Export"
        title="Operational exports"
        description="Later add CSV and PDF export actions for management reporting."
      />
      <PlaceholderPanel
        label="Slices"
        title="Filterable analytics"
        description="Reserve filters for date ranges, countries, cities, and car categories."
      />
    </div>
  )
}
