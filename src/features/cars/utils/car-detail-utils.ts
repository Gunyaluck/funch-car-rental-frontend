import { createSearchParams } from 'react-router-dom'

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatMoney(currencyCode: string, value: number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value)
}

export function estimateRentalDays(pickupAt: string, returnAt: string) {
  if (!pickupAt || !returnAt) {
    return 1
  }

  const pickupTime = new Date(pickupAt).getTime()
  const returnTime = new Date(returnAt).getTime()

  if (Number.isNaN(pickupTime) || Number.isNaN(returnTime) || returnTime <= pickupTime) {
    return 1
  }

  return Math.max(1, Math.ceil((returnTime - pickupTime) / (24 * 60 * 60 * 1000)))
}

export function buildCheckoutLink(params: {
  carId: string
  pickupAt: string
  returnAt: string
  optionIds: string[]
}) {
  const search = createSearchParams(
    Object.entries({
      carId: params.carId,
      pickupAt: params.pickupAt,
      returnAt: params.returnAt,
      optionIds: params.optionIds.join(','),
    }).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value) {
        acc[key] = value
      }
      return acc
    }, {}),
  ).toString()

  return {
    pathname: '/checkout',
    search: search ? `?${search}` : '',
  }
}
