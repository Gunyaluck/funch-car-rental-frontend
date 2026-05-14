import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function CheckoutPage() {
  return (
    <PageSection
      eyebrow="Checkout"
      title="Booking checkout route scaffold"
      description="This route should consolidate quote summary, selected options, customer details, and booking creation."
    >
      <div className="grid grid-cols-12 gap-4">
        <PlaceholderPanel
          label="Quote"
          title="Booking summary"
          description="Render selected car, pickup-return date, pricing breakdown, timezone, and rental rules."
        />

        <PlaceholderPanel
          label="Customer"
          title="Auth-aware contact panel"
          description="If the user is logged in, preload their profile. If not, redirect them through login or register and return here."
        />

        <PlaceholderPanel
          label="Submit"
          title="Create booking"
          description="POST /bookings should create a pending booking and preserve backend pricing snapshot as source of truth."
        />

        <PlaceholderPanel
          wide
          label="Admin Dependency"
          title="Pending approval state"
          description="Final UX should clearly explain that booking is submitted first and becomes active only after admin approval."
        />
      </div>
    </PageSection>
  )
}
