import { CarFront, Fuel, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import type { CarDetailItem } from './types'

type CarSpecsGridProps = {
  car: CarDetailItem
}

export function CarSpecsGrid({ car }: CarSpecsGridProps) {
  const specs = [
    { icon: Users, label: 'Seats', value: `${car.seats} passengers` },
    { icon: Fuel, label: 'Fuel', value: car.fuelType },
    { icon: CarFront, label: 'Vehicle', value: `${car.year} ${car.category}` },
    { icon: MapPin, label: 'Pickup city', value: car.city },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
      {specs.map((spec) => {
        const Icon = spec.icon
        return (
          <Card key={spec.label}>
            <CardContent className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-forest-700/10 text-forest-700">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="m-0 text-[0.84rem] text-stone-500">{spec.label}</p>
                <strong>{spec.value}</strong>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
