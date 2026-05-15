import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function MyBookingsPage() {
  return (
    <PageSection
      eyebrow="Account"
      title="My bookings"
      description="Track your booking history, statuses, dates, vehicle details, and next steps."
    >
      <div className="grid grid-cols-12 gap-4">
        <PlaceholderPanel
          label="History"
          title="Booking list"
          description="Review upcoming, pending, completed, and cancelled bookings in one place."
        />
        <PlaceholderPanel
          label="Status"
          title="Approval timeline"
          description="Follow pending, approved, rejected, cancelled, and completed status updates."
        />
        <PlaceholderPanel
          label="Support"
          title="Booking details"
          description="Open a booking to view invoices, cancellation rules, and support options."
        />
      </div>
    </PageSection>
  )
}
