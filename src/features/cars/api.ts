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

function normalizeSupabaseStorageUrl(url?: string | null) {
  if (!url) {
    return url ?? null
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const bucketName = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'car-images'
  const trimmedUrl = url.trim()
  const absoluteUrlMatch = trimmedUrl.match(/https?:\/\/.+$/i)
  const absoluteUrl = absoluteUrlMatch?.[0]

  if (absoluteUrl) {
    if (absoluteUrl.includes('/storage/v1/object/public/')) {
      return absoluteUrl
    }

    if (absoluteUrl.includes('/storage/v1/object/')) {
      return absoluteUrl.replace('/storage/v1/object/', '/storage/v1/object/public/')
    }

    return absoluteUrl
  }

  if (!supabaseUrl) {
    return trimmedUrl
  }

  const escapedBucketName = bucketName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const normalizedPath = trimmedUrl
    .replace(/^\/+/, '')
    .replace(/^storage\/v1\/object\/public\//, '')
    .replace(/^storage\/v1\/object\//, '')
    .replace(new RegExp(`^public/${escapedBucketName}/`), '')
    .replace(new RegExp(`^${escapedBucketName}/`), '')

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${normalizedPath}`
}

function normalizeSupabaseStoragePath(url: string) {
  const normalizedUrl = normalizeSupabaseStorageUrl(url)

  return normalizedUrl ?? url
}

function normalizeImageCollection<T extends { url: string }>(images: T[]) {
  return images.map((image) => ({
    ...image,
    url: normalizeSupabaseStoragePath(image.url),
  }))
}

function getNormalizedCoverImageUrl(car: CarListItem) {
  if (car.coverImage) {
    return normalizeSupabaseStoragePath(car.coverImage)
  }

  return null
}

function normalizeCarListItem(car: CarListItem): CarListItem {
  return {
    ...car,
    coverImage: getNormalizedCoverImageUrl(car),
  }
}

function normalizeCarDetailItem(car: CarDetailItem): CarDetailItem {
  return {
    ...car,
    images: normalizeImageCollection(car.images),
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
    data: response.data.data.map(normalizeCarListItem),
    meta: {
      page: response.data.meta?.page ?? 1,
      limit: response.data.meta?.limit ?? limit,
      total: response.data.meta?.total ?? response.data.data.length,
    },
  }
}

export async function getCarById(carId: string): Promise<CarDetailItem> {
  const response = await api.get<ApiResponse<CarDetailItem>>(`/cars/${carId}`)
  return normalizeCarDetailItem(response.data.data)
}

export async function createAdminCar(payload: CreateCarPayload): Promise<CarDetailItem> {
  const response = await api.post<ApiResponse<CarDetailItem>>('/cars/admin', payload)
  return normalizeCarDetailItem(response.data.data)
}

export async function updateAdminCar(
  carId: string,
  payload: CreateCarPayload,
): Promise<CarDetailItem> {
  const response = await api.put<ApiResponse<CarDetailItem>>(`/cars/admin/${carId}`, payload)
  return normalizeCarDetailItem(response.data.data)
}

export async function updateAdminCarStatus(
  carId: string,
  status: CarListItem['status'],
): Promise<CarDetailItem> {
  const response = await api.patch<ApiResponse<CarDetailItem>>(`/cars/admin/${carId}/status`, {
    status,
  })

  return normalizeCarDetailItem(response.data.data)
}
