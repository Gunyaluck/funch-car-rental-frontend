import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function LoginPage() {
  return (
    <PageSection
      eyebrow="Auth"
      title="Customer sign-in route scaffold"
      description="Use this route for login form, session restoration, and booking continuation after authentication."
    >
      <div className="grid grid-cols-12 gap-4">
        <PlaceholderPanel
          label="Form"
          title="Login form"
          description="Connect this form to POST /auth/login and store the access token in the app auth layer."
        />
        <PlaceholderPanel
          label="Flow"
          title="Return to booking"
          description="If the user entered from checkout or quote flow, preserve selected car, dates, and options after login."
        />
        <PlaceholderPanel
          label="Security"
          title="Session guardrails"
          description="Add validation, auth error messaging, refresh token flow, and protected route redirects."
        />
      </div>
    </PageSection>
  )
}
