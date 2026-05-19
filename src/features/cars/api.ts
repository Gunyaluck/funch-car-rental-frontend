import { api } from '../../api/axios'
import type { CarDetailItem, CarFilters, CarListItem, CreateCarPayload } from './types'

type ApiResponse<T> = {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export type ListCarsResult = {
  data: CarListItem[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

function buildListCarsParams(filters: CarFilters, limit = 100) {
  const params: Record<string, string | number> = {
    limit,
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params[key] = value
    }
  })

  return params
}

export async function listCars(filters: CarFilters, limit = 100): Promise<ListCarsResult> {
  const response = await api.get<ApiResponse<CarListItem[]>>('/cars', {
    params: buildListCarsParams(filters, limit),
  })

  return {
    data: response.data.data,
    meta: {
      page: response.data.meta?.page ?? 1,
      limit: response.data.meta?.limit ?? limit,
      total: response.data.meta?.total ?? response.data.data.length,
    },
  }
}

export async function getCarById(carId: string): Promise<CarDetailItem> {
  const response = await api.get<ApiResponse<CarDetailItem>>(`/cars/${carId}`)
  return response.data.data
}

export async function createAdminCar(payload: CreateCarPayload): Promise<CarDetailItem> {
  const response = await api.post<ApiResponse<CarDetailItem>>('/cars/admin', payload)
  return response.data.data
}

export async function updateAdminCar(
  carId: string,
  payload: CreateCarPayload,
): Promise<CarDetailItem> {
  const response = await api.put<ApiResponse<CarDetailItem>>(`/cars/admin/${carId}`, payload)
  return response.data.data
}

export async function updateAdminCarStatus(
  carId: string,
  status: CarListItem['status'],
): Promise<CarDetailItem> {
  const response = await api.patch<ApiResponse<CarDetailItem>>(`/cars/admin/${carId}/status`, {
    status,
  })

  return response.data.data
}
