import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminCarsPage() {
  return (
    <div className="placeholder-grid">
      <PlaceholderPanel
        label="Fleet"
        title="Car catalog management"
        description="Manage core car data, pricing, operating hours, and booking constraints from this route."
      />
      <PlaceholderPanel
        label="Assets"
        title="Image and option management"
        description="Add forms for gallery uploads, add-ons, cover images, and descriptive content here."
      />
      <PlaceholderPanel
        label="Status"
        title="Availability and maintenance"
        description="Reserve this area for availability blocks, maintenance periods, and retirement status changes."
      />
    </div>
  )
}
