import { AxiosError } from 'axios'
import { api } from '../../api/axios'
import type { PricingQuote, PricingQuoteRequest } from './types'

type ApiResponse<T> = {
  data: T
}

type ApiErrorResponse = {
  message?: string
  errors?: Array<{
    message?: string
    path?: Array<string | number>
  }>
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiErrorResponse | undefined
    return responseData?.errors?.[0]?.message ?? responseData?.message ?? error.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

export async function quotePricing(input: PricingQuoteRequest) {
  const response = await api.post<ApiResponse<PricingQuote>>('/pricing/quote', input)
  return response.data.data
}
