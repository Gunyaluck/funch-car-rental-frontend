import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function LoginPage() {
  return (
    <PageSection
      eyebrow="Auth"
      title="Sign in to your account"
      description="Access your bookings, saved details, and checkout progress."
    >
      <div className="grid grid-cols-12 gap-4">
        <PlaceholderPanel
          label="Form"
          title="Secure sign in"
          description="Enter your email and password to continue."
        />
        <PlaceholderPanel
          label="Flow"
          title="Return to booking"
          description="Your selected car, dates, and options will stay ready after sign in."
        />
        <PlaceholderPanel
          label="Security"
          title="Session guardrails"
          description="We protect your account and booking details while you use the service."
        />
      </div>
    </PageSection>
  )
}
