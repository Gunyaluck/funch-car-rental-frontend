import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function RegisterPage() {
  return (
    <PageSection
      eyebrow="Auth"
      title="Create your account"
      description="Set up your profile once for faster bookings and clearer local pricing."
    >
      <div className="grid grid-cols-12 gap-4">
        <PlaceholderPanel
          label="Profile"
          title="Personal details"
          description="Add your name, contact details, country, timezone, and preferred currency."
        />
        <PlaceholderPanel
          label="Booking Continuation"
          title="Create account and continue"
          description="Keep your selected vehicle and dates while you finish account setup."
        />
        <PlaceholderPanel
          label="Rules"
          title="Validation and consent"
          description="Review password requirements and consent before creating your account."
        />
      </div>
    </PageSection>
  )
}
