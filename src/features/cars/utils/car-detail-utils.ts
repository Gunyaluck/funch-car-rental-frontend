import { createSearchParams } from 'react-router-dom'

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatMoney(currencyCode: string, value: number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value)
}

const currencyByCountryCode: Record<string, string> = {
  TH: 'THB',
  JP: 'JPY',
  US: 'USD',
  GB: 'GBP',
  EU: 'EUR',
  SG: 'SGD',
  MY: 'MYR',
  KR: 'KRW',
  CN: 'CNY',
  AU: 'AUD',
}

const usdValueByCurrencyCode: Record<string, number> = {
  USD: 1,
  THB: 0.027,
  JPY: 0.0067,
  EUR: 1.08,
  GBP: 1.27,
  SGD: 0.74,
  MYR: 0.21,
  KRW: 0.00074,
  CNY: 0.14,
  AUD: 0.66,
}

export function getCurrencyForCountry(countryCode: string) {
  return currencyByCountryCode[countryCode.toUpperCase()]
}

export function getApproximateLocalMoney(
  sourceCurrencyCode: string,
  sourceValue: number,
  customerCountryCode?: string,
) {
  if (!customerCountryCode) {
    return null
  }

  const targetCurrencyCode = getCurrencyForCountry(customerCountryCode)

  if (!targetCurrencyCode || targetCurrencyCode === sourceCurrencyCode) {
    return null
  }

  const sourceUsdValue = usdValueByCurrencyCode[sourceCurrencyCode]
  const targetUsdValue = usdValueByCurrencyCode[targetCurrencyCode]

  if (!sourceUsdValue || !targetUsdValue) {
    return null
  }

  return {
    currencyCode: targetCurrencyCode,
    formattedValue: formatMoney(
      targetCurrencyCode,
      (sourceValue * sourceUsdValue) / targetUsdValue,
    ),
  }
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
