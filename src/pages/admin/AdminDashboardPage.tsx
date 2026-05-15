import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminDashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
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
        description="Review bookings by country, approval rate, and revenue snapshots."
      />
      <PlaceholderPanel
        wide
        label="Operations"
        title="Admin command center"
        description="Monitor key metrics, approval queues, and recent booking activity."
      />
    </div>
  )
}
