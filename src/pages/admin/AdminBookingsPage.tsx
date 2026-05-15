import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminBookingsPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <PlaceholderPanel
        label="Approval"
        title="Booking review table"
        description="Review booking requests, customer details, price breakdowns, and approval actions."
      />
      <PlaceholderPanel
        label="Actions"
        title="Status controls"
        description="Approve, reject, or add internal notes before updating a booking status."
      />
      <PlaceholderPanel
        label="Audit"
        title="Booking timeline"
        description="Track status changes, timestamps, and staff activity for each booking."
      />
    </div>
  )
}
