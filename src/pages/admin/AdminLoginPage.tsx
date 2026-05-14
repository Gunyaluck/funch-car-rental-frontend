import { PageSection } from '../../components/PageSection'
import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-[640px]">
        <PageSection
          eyebrow="Admin Auth"
          title="Admin login route scaffold"
          description="This route is reserved for role-protected admin authentication before entering management pages."
        >
          <div className="grid grid-cols-12 gap-4">
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
