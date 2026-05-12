import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function MyBookingsPage() {
  return (
    <PageSection
      eyebrow="Account"
      title="My bookings route scaffold"
      description="This page should show booking history, statuses, dates, car info, and next-step actions for the customer."
    >
      <div className="placeholder-grid">
        <PlaceholderPanel
          label="History"
          title="Booking list"
          description="Connect this route to GET /my-bookings with cards or table rows grouped by status."
        />
        <PlaceholderPanel
          label="Status"
          title="Approval timeline"
          description="Show pending, approved, rejected, cancelled, and completed states with admin notes where appropriate."
        />
        <PlaceholderPanel
          label="Support"
          title="Booking detail drill-down"
          description="Later this page can link into booking detail, invoice, cancellation rules, and contact support actions."
        />
      </div>
    </PageSection>
  )
}
