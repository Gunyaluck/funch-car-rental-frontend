import { createPortal } from 'react-dom'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import type { BookingItem } from './types'

type AdminBookingConfirmDialogProps = {
  booking: BookingItem | null
  badgeLabel: string
  badgeVariant?: 'default' | 'muted' | 'danger'
  title: string
  description: string
  currentNote: string
  cancelLabel: string
  confirmLabel: string
  isBusy: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function AdminBookingConfirmDialog({
  booking,
  badgeLabel,
  badgeVariant,
  title,
  description,
  currentNote,
  cancelLabel,
  confirmLabel,
  isBusy,
  onCancel,
  onConfirm,
}: AdminBookingConfirmDialogProps) {
  if (!booking) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
            <h2 className="m-0 text-xl font-semibold">{title}</h2>
            <p className="m-0 text-stone-500">
              {booking.user.firstName} {booking.user.lastName} for {booking.car.brand}{' '}
              {booking.car.model}
            </p>
            <p className="m-0 text-sm text-stone-500">{description}</p>
          </div>

          <div className="rounded-2xl bg-white/60 p-4 text-sm text-stone-600">
            <strong className="block text-stone-900">Current note</strong>
            <span>{currentNote || 'No note added.'}</span>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" disabled={isBusy} onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button type="button" disabled={isBusy} onClick={onConfirm}>
              {isBusy ? 'Processing...' : confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body,
  )
}
