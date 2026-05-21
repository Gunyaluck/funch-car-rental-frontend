import { isAxiosError } from 'axios'
import { Eye, EyeOff, KeyRound, Save } from 'lucide-react'
import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { FieldLabel, Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { getStoredAuthSession, storeAuthSession } from '../features/auth/storage'
import { changeMyPassword, getMyProfile, updateMyProfile } from '../features/users/api'
import { countryOptions } from '../lib/country-options'

type ProfileFieldErrors = Partial<Record<'firstName' | 'lastName' | 'phone' | 'countryCode', string>>
type PasswordFieldErrors = Partial<Record<'currentPassword' | 'newPassword' | 'confirmNewPassword', string>>
type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  isVisible: boolean
  onVisibilityChange: () => void
}

const phonePattern = /^[+\d\s()-]{6,20}$/

function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="m-0 text-sm font-medium text-red-600">{message}</p>
}

function PasswordInput({
  className,
  isVisible,
  onVisibilityChange,
  ...props
}: PasswordInputProps) {
  return (
    <div className="relative">
      <Input
        className={`pr-12 ${className ?? ''}`}
        type={isVisible ? 'text' : 'password'}
        {...props}
      />
      <button
        type="button"
        className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-black/5 hover:text-forest-800 focus:ring-2 focus:ring-clay-600/20 focus:outline-none"
        onClick={onVisibilityChange}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

function validateProfileForm({
  firstName,
  lastName,
  phone,
  countryCode,
}: {
  firstName: string
  lastName: string
  phone: string
  countryCode: string
}) {
  const errors: ProfileFieldErrors = {}

  if (!firstName.trim()) {
    errors.firstName = 'First name is required.'
  }

  if (!lastName.trim()) {
    errors.lastName = 'Last name is required.'
  }

  if (phone.trim() && !phonePattern.test(phone.trim())) {
    errors.phone = 'Enter a valid phone number.'
  }

  if (!countryCode) {
    errors.countryCode = 'Select your country.'
  }

  return errors
}

function validatePasswordForm({
  currentPassword,
  newPassword,
  confirmNewPassword,
}: {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}) {
  const errors: PasswordFieldErrors = {}

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.'
  }

  if (!newPassword) {
    errors.newPassword = 'New password is required.'
  } else if (newPassword.length < 8) {
    errors.newPassword = 'New password must be at least 8 characters.'
  }

  if (!confirmNewPassword) {
    errors.confirmNewPassword = 'Confirm your new password.'
  } else if (newPassword !== confirmNewPassword) {
    errors.confirmNewPassword = 'New passwords do not match.'
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.newPassword = 'New password must be different from current password.'
  }

  return errors
}

export function ProfilePage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [timezone, setTimezone] = useState('')
  const [currencyCode, setCurrencyCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<PasswordFieldErrors>({})
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('')
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const profile = await getMyProfile()

        if (!isMounted) {
          return
        }

        setEmail(profile.email)
        setFirstName(profile.firstName ?? '')
        setLastName(profile.lastName ?? '')
        setPhone(profile.phone ?? '')
        setCountryCode(profile.countryCode ?? '')
        setTimezone(profile.timezone ?? '')
        setCurrencyCode(profile.currencyCode ?? profile.preferredCurrency ?? '')
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load your profile.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const nextFieldErrors = validateProfileForm({ firstName, lastName, phone, countryCode })

    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const updatedProfile = await updateMyProfile({
        firstName,
        lastName,
        phone: phone.trim() ? phone : null,
        countryCode,
        timezone: getBrowserTimezone(),
      })
      const session = getStoredAuthSession()

      if (session) {
        storeAuthSession({
          ...session,
          user: {
            ...session.user,
            ...updatedProfile,
          },
        })
      }

      setFirstName(updatedProfile.firstName ?? '')
      setLastName(updatedProfile.lastName ?? '')
      setPhone(updatedProfile.phone ?? '')
      setCountryCode(updatedProfile.countryCode ?? '')
      setTimezone(updatedProfile.timezone ?? '')
      setCurrencyCode(updatedProfile.currencyCode ?? updatedProfile.preferredCurrency ?? '')
      setSuccessMessage('Profile updated.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to update your profile.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordErrorMessage('')
    setPasswordSuccessMessage('')

    const nextPasswordErrors = validatePasswordForm({
      currentPassword,
      newPassword,
      confirmNewPassword,
    })

    setPasswordErrors(nextPasswordErrors)
    if (Object.keys(nextPasswordErrors).length > 0) {
      return
    }

    setIsPasswordSubmitting(true)

    try {
      await changeMyPassword({
        currentPassword,
        newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPasswordSuccessMessage('Password updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update your password.')

      if (message === 'Current password is incorrect') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect.' })
        return
      }

      setPasswordErrorMessage(message)
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  return (
    <PageSection
      title="Profile"
      description="Keep your contact details up to date for bookings and receipts."
      align="center"
      variant="plain"
    >
      <div className="mx-auto grid w-full max-w-[640px] gap-4">
        <Card>
          <CardContent>
            <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
              <Label>
                <FieldLabel>Email</FieldLabel>
                <Input value={email} disabled />
              </Label>

              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>First name</FieldLabel>
                  <Input
                    value={firstName}
                    className={fieldErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    disabled={isLoading}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                  <FieldError message={fieldErrors.firstName} />
                </Label>
                <Label>
                  <FieldLabel>Last name</FieldLabel>
                  <Input
                    value={lastName}
                    className={fieldErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    disabled={isLoading}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                  <FieldError message={fieldErrors.lastName} />
                </Label>
              </div>

              <Label>
                <FieldLabel>Phone</FieldLabel>
                <Input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  className={fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  disabled={isLoading}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <FieldError message={fieldErrors.phone} />
              </Label>

              <div className="grid gap-4 md:grid-cols-3">
                <Label>
                  <FieldLabel>Country</FieldLabel>
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={isLoading}>
                    <SelectTrigger
                      className={fieldErrors.countryCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                      aria-invalid={Boolean(fieldErrors.countryCode)}
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={fieldErrors.countryCode} />
                </Label>
                <Label>
                  <FieldLabel>Timezone</FieldLabel>
                  <Input value={timezone} disabled />
                </Label>
                <Label>
                  <FieldLabel>Currency</FieldLabel>
                  <Input value={currencyCode} disabled />
                </Label>
              </div>

              {errorMessage ? <Alert title="Profile could not be saved">{errorMessage}</Alert> : null}
              {successMessage ? (
                <p className="m-0 rounded-2xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  {successMessage}
                </p>
              ) : null}

              <div className="flex justify-center">
                <Button type="submit" className="w-fit px-6" disabled={isLoading || isSubmitting}>
                  <Save className="size-4" />
                  {isSubmitting ? 'Saving...' : 'Save profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <form className="grid gap-4" noValidate onSubmit={handlePasswordSubmit}>
              <div className="grid gap-1">
                <h2 className="m-0 text-lg font-semibold text-forest-900">Change password</h2>
                <p className="m-0 text-sm text-stone-500">
                  Use at least 8 characters for your new password.
                </p>
              </div>

              <Label>
                <FieldLabel>Current password</FieldLabel>
                <PasswordInput
                  autoComplete="current-password"
                  value={currentPassword}
                  isVisible={isCurrentPasswordVisible}
                  className={passwordErrors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                  aria-invalid={Boolean(passwordErrors.currentPassword)}
                  onVisibilityChange={() => setIsCurrentPasswordVisible((isVisible) => !isVisible)}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <FieldError message={passwordErrors.currentPassword} />
              </Label>

              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>New password</FieldLabel>
                  <PasswordInput
                    autoComplete="new-password"
                    value={newPassword}
                    isVisible={isNewPasswordVisible}
                    className={passwordErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(passwordErrors.newPassword)}
                    onVisibilityChange={() => setIsNewPasswordVisible((isVisible) => !isVisible)}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                  <FieldError message={passwordErrors.newPassword} />
                </Label>
                <Label>
                  <FieldLabel>Confirm new password</FieldLabel>
                  <PasswordInput
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    isVisible={isConfirmNewPasswordVisible}
                    className={passwordErrors.confirmNewPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(passwordErrors.confirmNewPassword)}
                    onVisibilityChange={() =>
                      setIsConfirmNewPasswordVisible((isVisible) => !isVisible)
                    }
                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                  />
                  <FieldError message={passwordErrors.confirmNewPassword} />
                </Label>
              </div>

              {passwordErrorMessage ? (
                <Alert title="Password could not be saved">{passwordErrorMessage}</Alert>
              ) : null}
              {passwordSuccessMessage ? (
                <p className="m-0 rounded-2xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  {passwordSuccessMessage}
                </p>
              ) : null}

              <div className="flex justify-center">
                <Button type="submit" className="w-fit px-6" disabled={isPasswordSubmitting}>
                  <KeyRound className="size-4" />
                  {isPasswordSubmitting ? 'Saving...' : 'Update password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageSection>
  )
}
