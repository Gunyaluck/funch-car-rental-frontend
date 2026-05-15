import { PlaceholderPanel } from '../../components/PlaceholderPanel'

export function AdminCarsPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <PlaceholderPanel
        label="Fleet"
        title="Car catalog management"
        description="Manage car details, pricing, operating hours, and booking constraints."
      />
      <PlaceholderPanel
        label="Assets"
        title="Image and option management"
        description="Maintain gallery images, add-ons, cover photos, and descriptive content."
      />
      <PlaceholderPanel
        label="Status"
        title="Availability and maintenance"
        description="Review availability blocks, maintenance periods, and retired vehicles."
      />
    </div>
  )
}
