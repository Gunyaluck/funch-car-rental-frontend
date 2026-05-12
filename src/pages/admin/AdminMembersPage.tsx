import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminMembersPage() {
  return (
    <div className="placeholder-grid">
      <PlaceholderPanel
        label="Members"
        title="Customer directory"
        description="This route should list member profiles, statuses, countries, and booking activity summaries."
      />
      <PlaceholderPanel
        label="Support"
        title="Member review tools"
        description="Later add detail drawers for customer profile review, document checks, and booking history."
      />
      <PlaceholderPanel
        label="Controls"
        title="Account management"
        description="Reserve status changes, suspension, and internal notes for admin-only operations."
      />
    </div>
  )
}
