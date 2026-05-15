import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function CheckoutPage() {
  return (
    <PageSection
      title="Complete your booking"
      description="Review your trip details, options, customer information, and final price."
    >
      <div className="grid grid-cols-12 gap-4">
        <PlaceholderPanel
          label="Quote"
          title="Booking summary"
          description="Check the selected car, pickup and return time, price breakdown, and rental rules."
        />

        <PlaceholderPanel
          label="Customer"
          title="Contact details"
          description="Use your saved profile or add the contact details needed for this booking."
        />

        <PlaceholderPanel
          label="Submit"
          title="Create booking"
          description="Submit your booking request for review and confirmation."
        />

        <PlaceholderPanel
          wide
          label="Approval"
          title="Pending approval state"
          description="Your booking becomes active after the rental team confirms availability."
        />
      </div>
    </PageSection>
  )
}
