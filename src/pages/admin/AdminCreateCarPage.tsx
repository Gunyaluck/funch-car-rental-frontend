import { useNavigate } from 'react-router-dom'
import { PageSection } from '../../components/PageSection'
import { Button } from '../../components/ui/button'
import { AdminCarForm } from '../../features/cars/AdminCarForm'

export function AdminCreateCarPage() {
  const navigate = useNavigate()

  return (
    <PageSection
      title="Create a rental car"
      description="Add a new fleet entry, pricing setup, gallery images, rental options, and weekly opening hours."
    >
      <div className="grid gap-5">
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/cars')}>
            Back to cars
          </Button>
        </div>

        <AdminCarForm onSubmitted={() => navigate('/admin/cars')} />
      </div>
    </PageSection>
  )
}
