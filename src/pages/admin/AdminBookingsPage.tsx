import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminBookingsPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <PlaceholderPanel
        label="Approval"
        title="Booking review table"
        description="This route should host filters, booking rows, customer data, quote breakdown, and approve/reject actions."
      />
      <PlaceholderPanel
        label="Actions"
        title="Status controls"
        description="Connect approve and reject buttons to admin booking endpoints with admin note support."
      />
      <PlaceholderPanel
        label="Audit"
        title="Booking timeline"
        description="Render status changes, timestamps, and actor history to support traceable approvals."
      />
    </div>
  )
}
