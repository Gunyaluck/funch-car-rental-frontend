import { PageSection } from '../../components/PageSection'
import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-[640px]">
        <PageSection
          eyebrow="Admin Auth"
          title="Admin sign in"
          description="Sign in with an authorized admin account to manage bookings and fleet operations."
        >
          <div className="grid grid-cols-12 gap-4">
            <PlaceholderPanel
              wide
              label="Admin Session"
              title="Protected access entry point"
              description="Only authorized staff can access booking approvals, reports, and fleet controls."
            />
          </div>
        </PageSection>
      </div>
    </div>
  )
}
