import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'

type AdminDashboardMetricCardProps = {
  icon: LucideIcon
  iconClassName: string
  value: string
  label: string
  description: string
}

export function AdminDashboardMetricCard({
  icon: Icon,
  iconClassName,
  value,
  label,
  description,
}: AdminDashboardMetricCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-2">
        <span className={`flex size-11 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="size-5" />
        </span>
        <strong className="text-3xl leading-none">{value}</strong>
        <span className="text-sm font-semibold text-stone-700">{label}</span>
        <p className="m-0 text-sm text-stone-500">{description}</p>
      </CardContent>
    </Card>
  )
}
