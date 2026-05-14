import { useParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function CarDetailPage() {
  const { carId } = useParams()

  return (
    <PageSection
      eyebrow="Car Detail"
      title="Vehicle detail route scaffold"
      description={`This route is reserved for car "${carId ?? ':carId'}" and should consume GET /cars/:id, quote data, options, and availability rules.`}
    >
      <div className="grid grid-cols-12 gap-4">
        <PlaceholderPanel
          label="Gallery"
          title="Hero media and specification summary"
          description="Place image carousel, cover photo, badges, and key specs above the fold."
        />

        <PlaceholderPanel
          label="Pricing"
          title="Quote panel mount point"
          description="This panel will host pickup-return date selection and live POST /pricing/quote integration."
        />

        <PlaceholderPanel
          label="Options"
          title="Add-ons and rental rules"
          description="Display child seats, GPS, insurance, operating hours, cutoff logic, and booking notes here."
        />

        <PlaceholderPanel
          wide
          label="Flow"
          title="Booking handoff"
          description="The primary CTA from this page should persist selected dates and options into checkout, whether the customer logs in first or registers during booking."
        />
      </div>
    </PageSection>
  )
}
