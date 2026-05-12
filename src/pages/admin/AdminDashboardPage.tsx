import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminDashboardPage() {
  return (
    <div className="placeholder-grid">
      <PlaceholderPanel
        label="Queue"
        title="Pending approvals"
        description="This area should surface pending booking counts, urgent pickups, and rejected booking trends."
      />
      <PlaceholderPanel
        label="Fleet"
        title="Vehicle availability"
        description="Use this panel for active cars, maintenance blocks, and utilization metrics."
      />
      <PlaceholderPanel
        label="Revenue"
        title="Daily summary"
        description="Reserve this card for bookings by country, approval rate, and revenue snapshots."
      />
      <PlaceholderPanel
        wide
        label="Operations"
        title="Admin command center"
        description="The dashboard route is ready for KPI cards, approval queue previews, and recent booking activity widgets."
      />
    </div>
  )
}
