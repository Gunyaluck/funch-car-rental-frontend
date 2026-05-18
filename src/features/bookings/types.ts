export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export type PaymentStatus =
  | 'UNPAID'
  | 'DEPOSIT_PENDING'
  | 'DEPOSIT_PAID'
  | 'REFUND_PENDING'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'

export type BookingOption = {
  id: string
  carOptionId: string
  name: string
  pricePerDay: number
  totalPrice: number
}

export type BookingItem = {
  id: string
  pickupAt: string
  returnAt: string
  pickupTimezone: string
  totalHours: number
  totalDays: number
  subtotal: number
  optionsTotal: number
  grandTotal: number
  currencyCode: string
  pricingMode: 'HOURLY' | 'DAILY' | 'MIXED'
  depositAmount: number
  amountDueAtPickup: number
  depositDueAt: string | null
  depositPaidAt: string | null
  paymentStatus: PaymentStatus
  paymentProvider: string | null
  paymentReference: string | null
  status: BookingStatus
  adminNote: string | null
  approvedAt: string | null
  createdAt: string
  canCancel: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
  car: {
    id: string
    name: string
    brand: string
    model: string
    year: number
    countryCode: string
    city: string
    timezone: string
    coverImage: string | null
  }
  options: BookingOption[]
}

export type CreateBookingPayload = {
  carId: string
  pickupAt: string
  returnAt: string
  optionIds: string[]
}

export type DepositCheckout = {
  provider: string
  amount: number
  currencyCode: string
  expiresAt: string | null
  mode: string
  message: string
}

export type DepositCheckoutResult = {
  booking: BookingItem
  checkout: DepositCheckout
}

export type BookingActionPayload = {
  adminNote?: string
}
