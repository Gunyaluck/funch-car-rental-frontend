import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function CarsPage() {
  return (
    <PageSection
      eyebrow="Cars"
      title="Car listing route scaffold"
      description="This page is ready for destination search, availability filters, pagination, and result cards connected to GET /cars."
    >
      <div className="placeholder-grid">
        <PlaceholderPanel
          label="Filters"
          title="Country and date search"
          description="Add country, city, pickup time, return time, category, seats, and transmission filters here."
        >
          <ul className="bullet-list">
            <li>Country-based inventory for global bookings</li>
            <li>Timezone-safe pickup and return date inputs</li>
            <li>Availability preview from quote and booking rules</li>
          </ul>
        </PlaceholderPanel>

        <PlaceholderPanel
          label="Results"
          title="Listing cards"
          description="Each card should show cover image, rates, seats, transmission, destination, and CTA to open the detail page."
        />

        <PlaceholderPanel
          label="Data"
          title="API integration target"
          description="Connect this route to GET /cars and map backend filters directly to URL query params."
        />

        <PlaceholderPanel
          wide
          label="Next Build"
          title="Suggested next component set"
          description="CarsToolbar, CarsFilterDrawer, CarCard, CarEmptyState, and CarsPagination are the next frontend slices to build on this route."
        />
      </div>
    </PageSection>
  )
}
