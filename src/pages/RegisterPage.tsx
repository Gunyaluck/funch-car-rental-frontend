import { isAxiosError } from 'axios'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import { register } from '../features/auth/api'
import { storeAuthSession } from '../features/auth/storage'
import { countryOptions } from '../lib/country-options'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[+\d\s()-]{6,20}$/

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  isVisible: boolean
  onVisibilityChange: () => void
}

type RegisterFieldErrors = Partial<
  Record<'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'phone' | 'countryCode', string>
>

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="m-0 text-sm font-medium text-red-600">{message}</p>
}

function PasswordField({
  className,
  isVisible,
  onVisibilityChange,
  ...props
}: PasswordFieldProps) {
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return getErrorMessage(error, fallback)
}

function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function validateRegisterForm({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  phone,
  countryCode,
}: {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  countryCode: string
}) {
  const errors: RegisterFieldErrors = {}

  if (!firstName.trim()) {
    errors.firstName = 'First name is required.'
  }

  if (!lastName.trim()) {
    errors.lastName = 'Last name is required.'
  }

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (phone.trim() && !phonePattern.test(phone.trim())) {
    errors.phone = 'Enter a valid phone number.'
  }

  if (!countryCode) {
    errors.countryCode = 'Select your country.'
  }

  return errors
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('TH')
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTo = searchParams.get('redirect') || '/cars'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const nextFieldErrors = validateRegisterForm({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      countryCode,
    })

    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const session = await register({
        firstName,
        lastName,
        email,
        password,
        phone,
        countryCode,
        timezone: getBrowserTimezone(),
      })
      storeAuthSession(session)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create your account right now.')

      if (message === 'Email is already registered') {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          email: 'This email is already registered.',
        }))
        return
      }

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageSection
      title="Create account"
      description="Save your profile for faster bookings and local price estimates."
      align="center"
      variant="plain"
    >
      <div className="mx-auto grid w-full max-w-[680px] gap-4">
        <Card>
          <CardContent>
            <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>First name</FieldLabel>
                  <Input
                    value={firstName}
                    className={fieldErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.firstName)}
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
                    onChange={(event) => setLastName(event.target.value)}
                  />
                  <FieldError message={fieldErrors.lastName} />
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    className={fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.email)}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <FieldError message={fieldErrors.email} />
                </Label>
                <Label>
                  <FieldLabel>Password</FieldLabel>
                  <PasswordField
                    autoComplete="new-password"
                    isVisible={isPasswordVisible}
                    value={password}
                    className={fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.password)}
                    onVisibilityChange={() => setIsPasswordVisible((isVisible) => !isVisible)}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <FieldError message={fieldErrors.password} />
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>Confirm password</FieldLabel>
                  <PasswordField
                    autoComplete="new-password"
                    isVisible={isConfirmPasswordVisible}
                    value={confirmPassword}
                    className={fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    onVisibilityChange={() =>
                      setIsConfirmPasswordVisible((isVisible) => !isVisible)
                    }
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <FieldError message={fieldErrors.confirmPassword} />
                </Label>
                <Label>
                  <FieldLabel>Phone</FieldLabel>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    className={fieldErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                  <FieldError message={fieldErrors.phone} />
                </Label>
              </div>

              <Label>
                <FieldLabel>Country</FieldLabel>
                <Select value={countryCode} onValueChange={setCountryCode}>
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
              {errorMessage ? <Alert title="Account could not be created">{errorMessage}</Alert> : null}

              <div className="flex justify-center">
                <Button type="submit" className="w-fit px-6" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="m-0 text-center text-sm text-stone-500">
          Already registered?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-forest-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </PageSection>
  )
}

