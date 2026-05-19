import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Alert } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { createAdminCar, updateAdminCar } from './api'
import type {
  CarCategory,
  CarDetailItem,
  CarListItem,
  CreateCarPayload,
  Transmission,
} from './types'
import { uploadCarImage } from './storage'

const CATEGORY_OPTIONS: CarCategory[] = [
  'SEDAN',
  'SUV',
  'VAN',
  'TRUCK',
  'SPORTS',
  'LUXURY',
  'ELECTRIC',
]

const STATUS_OPTIONS: CarListItem['status'][] = ['AVAILABLE', 'MAINTENANCE', 'RETIRED']
const TRANSMISSION_OPTIONS: Transmission[] = ['AUTOMATIC', 'MANUAL']
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const defaultLocationHours = WEEKDAY_LABELS.map((_, index) => ({
  dayOfWeek: index,
  openTime: '08:00',
  closeTime: '20:00',
  isClosed: false,
}))

const defaultCreateCarForm: CreateCarPayload = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'SEDAN',
  countryCode: 'TH',
  city: '',
  timezone: 'Asia/Bangkok',
  currencyCode: 'THB',
  hourlyRate: 0,
  dailyRate: 0,
  seats: 4,
  transmission: 'AUTOMATIC',
  fuelType: 'Petrol',
  description: '',
  status: 'AVAILABLE',
  is24Hours: false,
  minAdvanceBookingHr: 2,
  maxBookingDays: 30,
  bufferHours: 2,
  images: [],
  options: [],
  locationHours: defaultLocationHours,
}

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

type AdminCarFormProps = {
  mode?: 'create' | 'edit'
  carId?: string
  initialValues?: CreateCarPayload
  onSubmitted?: (car: CarDetailItem) => void
}

export function AdminCarForm({
  mode = 'create',
  carId,
  initialValues,
  onSubmitted,
}: AdminCarFormProps) {
  const [createForm, setCreateForm] = useState<CreateCarPayload>(initialValues ?? defaultCreateCarForm)
  const [createErrorMessage, setCreateErrorMessage] = useState('')
  const [createSuccessMessage, setCreateSuccessMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadErrorMessage, setImageUploadErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (initialValues) {
      setCreateForm(initialValues)
    }
  }, [initialValues])

  function updateCreateForm<K extends keyof CreateCarPayload>(key: K, value: CreateCarPayload[K]) {
    setCreateErrorMessage('')
    setCreateSuccessMessage('')
    setCreateForm((current) => ({ ...current, [key]: value }))
  }

  function updateImage(index: number, key: 'sortOrder' | 'isCover', value: number | boolean) {
    setCreateForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => {
        if (imageIndex !== index) {
          return key === 'isCover' && value === true ? { ...image, isCover: false } : image
        }

        if (key === 'isCover' && value === true) {
          return { ...image, isCover: true }
        }

        return { ...image, [key]: value }
      }),
    }))
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    setImageUploadErrorMessage('')
    setIsUploadingImage(true)

    try {
      const uploadedImages = await Promise.all(files.map((file) => uploadCarImage(file)))

      setCreateForm((current) => ({
        ...current,
        images: [
          ...current.images,
          ...uploadedImages.map((image, index) => ({
            url: image.url,
            sortOrder: current.images.length + index,
            isCover: current.images.length === 0 && index === 0,
          })),
        ],
      }))
    } catch (error) {
      setImageUploadErrorMessage(
        getApiErrorMessage(error, 'Unable to upload one or more images right now.'),
      )
    } finally {
      setIsUploadingImage(false)
      event.target.value = ''
    }
  }

  function removeImage(index: number) {
    setCreateForm((current) => {
      const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index)
      const hasCover = nextImages.some((image) => image.isCover)

      return {
        ...current,
        images: nextImages.map((image, imageIndex) => ({
          ...image,
          sortOrder: imageIndex,
          isCover: !hasCover && imageIndex === 0 ? true : image.isCover,
        })),
      }
    })
  }

  function updateOption(
    index: number,
    key: keyof CreateCarPayload['options'][number],
    value: string | number,
  ) {
    setCreateForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [key]: value } : option,
      ),
    }))
  }

  function addOption() {
    setCreateForm((current) => ({
      ...current,
      options: [...current.options, { name: '', pricePerDay: 0, description: '' }],
    }))
  }

  function removeOption(index: number) {
    setCreateForm((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    }))
  }

  function updateLocationHour(
    index: number,
    key: keyof CreateCarPayload['locationHours'][number],
    value: string | number | boolean,
  ) {
    setCreateForm((current) => ({
      ...current,
      locationHours: current.locationHours.map((hour, hourIndex) =>
        hourIndex === index ? { ...hour, [key]: value } : hour,
      ),
    }))
  }

  async function handleSubmitCar() {
    setIsCreating(true)
    setCreateErrorMessage('')
    setCreateSuccessMessage('')

    try {
      const payload = {
        ...createForm,
        countryCode: createForm.countryCode.trim().toUpperCase(),
        currencyCode: createForm.currencyCode.trim().toUpperCase(),
        description: createForm.description?.trim() || undefined,
        images: createForm.images
          .filter((image) => image.url.trim())
          .map((image, index) => ({
            url: image.url.trim(),
            sortOrder: index,
            isCover: image.isCover,
          })),
        options: createForm.options
          .filter((option) => option.name.trim())
          .map((option) => ({
            name: option.name.trim(),
            pricePerDay: option.pricePerDay,
            description: option.description?.trim() || undefined,
          })),
      }
      const createdCar =
        mode === 'edit' && carId
          ? await updateAdminCar(carId, payload)
          : await createAdminCar(payload)

      if (mode === 'create') {
        setCreateForm(defaultCreateCarForm)
      }
      setCreateSuccessMessage(
        mode === 'edit' ? 'Car updated successfully.' : 'Car created successfully.',
      )
      onSubmitted?.(createdCar)
    } catch (error) {
      setCreateErrorMessage(
        getApiErrorMessage(
          error,
          mode === 'edit'
            ? 'Unable to update this car right now.'
            : 'Unable to create this car right now.',
        ),
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <h2 className="m-0 text-xl font-semibold">
            {mode === 'edit' ? 'Edit rental car' : 'Add a rental car'}
          </h2>
          <p className="m-0 text-stone-500">
            {mode === 'edit'
              ? 'Update the fleet entry, pricing setup, gallery images, rental options, and weekly opening hours.'
              : 'Create a new fleet entry with the minimum data needed for pricing and booking rules.'}
          </p>
        </div>

        {createErrorMessage ? (
          <Alert title={mode === 'edit' ? 'Update car failed' : 'Create car failed'}>
            {createErrorMessage}
          </Alert>
        ) : null}
        {imageUploadErrorMessage ? (
          <Alert title="Image upload failed">{imageUploadErrorMessage}</Alert>
        ) : null}
        {createSuccessMessage ? (
          <div className="rounded-2xl border border-forest-700/15 bg-forest-700/8 px-4 py-3 text-sm text-forest-800">
            {createSuccessMessage}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Car name</span>
            <Input value={createForm.name} onChange={(e) => updateCreateForm('name', e.target.value)} placeholder="Toyota Altis 1.8" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Brand</span>
            <Input value={createForm.brand} onChange={(e) => updateCreateForm('brand', e.target.value)} placeholder="Toyota" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Model</span>
            <Input value={createForm.model} onChange={(e) => updateCreateForm('model', e.target.value)} placeholder="Altis" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Year</span>
            <Input type="number" value={createForm.year} onChange={(e) => updateCreateForm('year', Number(e.target.value))} placeholder="2025" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Category</span>
            <Select value={createForm.category} onValueChange={(value) => updateCreateForm('category', value as CarCategory)}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{CATEGORY_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Country code</span>
            <Input value={createForm.countryCode} onChange={(e) => updateCreateForm('countryCode', e.target.value)} placeholder="TH" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">City</span>
            <Input value={createForm.city} onChange={(e) => updateCreateForm('city', e.target.value)} placeholder="Bangkok" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Timezone</span>
            <Input value={createForm.timezone} onChange={(e) => updateCreateForm('timezone', e.target.value)} placeholder="Asia/Bangkok" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Currency code</span>
            <Input value={createForm.currencyCode} onChange={(e) => updateCreateForm('currencyCode', e.target.value)} placeholder="THB" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Hourly rate</span>
            <Input type="number" min="0" step="0.01" value={createForm.hourlyRate} onChange={(e) => updateCreateForm('hourlyRate', Number(e.target.value))} placeholder="500" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Daily rate</span>
            <Input type="number" min="0" step="0.01" value={createForm.dailyRate} onChange={(e) => updateCreateForm('dailyRate', Number(e.target.value))} placeholder="2500" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Seats</span>
            <Input type="number" min="1" value={createForm.seats} onChange={(e) => updateCreateForm('seats', Number(e.target.value))} placeholder="4" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Transmission</span>
            <Select value={createForm.transmission} onValueChange={(value) => updateCreateForm('transmission', value as Transmission)}>
              <SelectTrigger><SelectValue placeholder="Transmission" /></SelectTrigger>
              <SelectContent>{TRANSMISSION_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Fuel type</span>
            <Input value={createForm.fuelType} onChange={(e) => updateCreateForm('fuelType', e.target.value)} placeholder="Petrol" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Status</span>
            <Select value={createForm.status} onValueChange={(value) => updateCreateForm('status', value as CarListItem['status'])}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Min advance booking hours</span>
            <Input type="number" min="0" value={createForm.minAdvanceBookingHr} onChange={(e) => updateCreateForm('minAdvanceBookingHr', Number(e.target.value))} placeholder="2" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Max booking days</span>
            <Input type="number" min="1" value={createForm.maxBookingDays} onChange={(e) => updateCreateForm('maxBookingDays', Number(e.target.value))} placeholder="30" />
          </label>
          <label className="grid gap-1 text-sm text-stone-500">
            <span className="font-semibold">Buffer hours</span>
            <Input type="number" min="0" value={createForm.bufferHours} onChange={(e) => updateCreateForm('bufferHours', Number(e.target.value))} placeholder="2" />
          </label>
        </div>

        <label className="grid gap-2 text-sm text-stone-500">
          <span className="font-semibold">Description</span>
          <textarea
            value={createForm.description ?? ''}
            onChange={(e) => updateCreateForm('description', e.target.value)}
            rows={4}
            className="rounded-2xl border border-black/12 bg-white/80 px-3.5 py-3 text-forest-900 outline-none transition focus:border-clay-600/35 focus:ring-2 focus:ring-clay-600/20"
            placeholder="Short rental description, highlights, or branch notes for this car"
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-stone-600">
          <input type="checkbox" checked={createForm.is24Hours} onChange={(e) => updateCreateForm('is24Hours', e.target.checked)} className="size-4 rounded border-stone-300" />
          This location accepts pickup and return 24 hours
        </label>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="m-0 text-lg font-semibold">Gallery images</h3>
              <p className="m-0 text-sm text-stone-500">Upload image files from your computer and choose one cover image.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageFileChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingImage ? 'Uploading...' : 'Upload images'}
              </Button>
            </div>
          </div>
          {createForm.images.length === 0 ? <div className="rounded-2xl bg-white/60 p-4 text-sm text-stone-500">No images uploaded yet.</div> : null}
          {createForm.images.map((image, index) => (
            <div key={`image-${index}`} className="grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-[120px_minmax(0,1.8fr)_120px_auto_auto]">
              <div className="overflow-hidden rounded-2xl bg-black/5">
                <img src={image.url} alt={`Upload ${index + 1}`} className="h-24 w-full object-cover" />
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-stone-700">Uploaded image URL</span>
                <Input value={image.url} disabled />
              </div>
              <Input type="number" min="0" value={image.sortOrder} onChange={(e) => updateImage(index, 'sortOrder', Number(e.target.value))} placeholder="Sort" />
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={image.isCover} onChange={(e) => updateImage(index, 'isCover', e.target.checked)} className="size-4 rounded border-stone-300" />
                Cover
              </label>
              <Button type="button" variant="outline" onClick={() => removeImage(index)}>Remove</Button>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="m-0 text-lg font-semibold">Rental options</h3>
              <p className="m-0 text-sm text-stone-500">Create optional add-ons with daily pricing.</p>
            </div>
            <Button type="button" variant="outline" onClick={addOption}>Add option</Button>
          </div>
          {createForm.options.length === 0 ? <div className="rounded-2xl bg-white/60 p-4 text-sm text-stone-500">No add-ons yet.</div> : null}
          {createForm.options.map((option, index) => (
            <div key={`option-${index}`} className="grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-[minmax(0,1.1fr)_160px_auto]">
              <Input value={option.name} onChange={(e) => updateOption(index, 'name', e.target.value)} placeholder="Option name" />
              <Input type="number" min="0" step="0.01" value={option.pricePerDay} onChange={(e) => updateOption(index, 'pricePerDay', Number(e.target.value))} placeholder="Price per day" />
              <Button type="button" variant="outline" onClick={() => removeOption(index)}>Remove</Button>
              <div className="md:col-span-3">
                <Input value={option.description ?? ''} onChange={(e) => updateOption(index, 'description', e.target.value)} placeholder="Option description" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div>
            <h3 className="m-0 text-lg font-semibold">Weekly opening hours</h3>
            <p className="m-0 text-sm text-stone-500">Set the standard pickup and return schedule for each day of the week.</p>
          </div>
          <div className="grid gap-3">
            {createForm.locationHours.map((hour, index) => (
              <div key={hour.dayOfWeek} className="grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-[160px_1fr_1fr_auto]">
                <div className="flex items-center font-semibold text-stone-700">{WEEKDAY_LABELS[index]}</div>
                <Input type="time" value={hour.openTime} disabled={createForm.is24Hours || hour.isClosed} onChange={(e) => updateLocationHour(index, 'openTime', e.target.value)} />
                <Input type="time" value={hour.closeTime} disabled={createForm.is24Hours || hour.isClosed} onChange={(e) => updateLocationHour(index, 'closeTime', e.target.value)} />
                <label className="flex items-center gap-2 text-sm text-stone-600">
                  <input type="checkbox" checked={hour.isClosed} disabled={createForm.is24Hours} onChange={(e) => updateLocationHour(index, 'isClosed', e.target.checked)} className="size-4 rounded border-stone-300" />
                  Closed
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isCreating}
            onClick={() => {
              setCreateForm(initialValues ?? defaultCreateCarForm)
              setCreateErrorMessage('')
              setCreateSuccessMessage('')
            }}
          >
            Reset
          </Button>
          <Button type="button" disabled={isCreating} onClick={handleSubmitCar}>
            {isCreating
              ? mode === 'edit'
                ? 'Saving...'
                : 'Creating...'
              : mode === 'edit'
                ? 'Save changes'
                : 'Create car'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
