import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function RegisterPage() {
  return (
    <PageSection
      eyebrow="Auth"
      title="Customer registration route scaffold"
      description="Use this route for account creation when the customer books and signs up in the same flow."
    >
      <div className="placeholder-grid">
        <PlaceholderPanel
          label="Profile"
          title="Registration form"
          description="Collect email, password, first name, last name, phone, country, timezone, and preferred currency."
        />
        <PlaceholderPanel
          label="Booking Continuation"
          title="Create account and continue"
          description="After successful registration, redirect the customer back to checkout with selected rental data intact."
        />
        <PlaceholderPanel
          label="Rules"
          title="Validation and consent"
          description="Add password rules, duplicate email handling, and legal consent capture here."
        />
      </div>
    </PageSection>
  )
}
