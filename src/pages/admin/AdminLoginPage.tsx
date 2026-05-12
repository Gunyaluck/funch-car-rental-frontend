import { PageSection } from '../../components/PageSection'
import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminLoginPage() {
  return (
    <div className="auth-center">
      <div className="auth-card">
        <PageSection
          eyebrow="Admin Auth"
          title="Admin login route scaffold"
          description="This route is reserved for role-protected admin authentication before entering management pages."
        >
          <div className="placeholder-grid">
            <PlaceholderPanel
              wide
              label="Admin Session"
              title="Protected access entry point"
              description="Connect this form to an admin-capable login flow and redirect authenticated admins into /admin."
            />
          </div>
        </PageSection>
      </div>
    </div>
  )
}
