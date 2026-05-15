import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminMembersPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <PlaceholderPanel
        label="Members"
        title="Customer directory"
        description="Review customer profiles, countries, account statuses, and booking activity."
      />
      <PlaceholderPanel
        label="Support"
        title="Member review tools"
        description="Open customer details, document checks, and booking history when support needs context."
      />
      <PlaceholderPanel
        label="Controls"
        title="Account management"
        description="Manage account status, suspension, and internal notes for staff review."
      />
    </div>
  )
}
