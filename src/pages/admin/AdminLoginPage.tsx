import { isAxiosError } from 'axios'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageSection } from '../../components/PageSection'
import { Alert } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { FieldLabel, Label } from '../../components/ui/label'
import { login } from '../../features/auth/api'
import { clearAuthSession, storeAuthSession } from '../../features/auth/storage'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginFieldErrors = Partial<Record<'email' | 'password', string>>

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  isVisible: boolean
  onVisibilityChange: () => void
}

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

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

function validateLoginForm({ email, password }: { email: string; password: string }) {
  const errors: LoginFieldErrors = {}

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

  return errors
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTo = searchParams.get('redirect') || '/admin'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const nextFieldErrors = validateLoginForm({ email, password })

    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const session = await login({ email, password })

      if (session.user.role !== 'ADMIN') {
        clearAuthSession()
        setErrorMessage('This account does not have admin access.')
        return
      }

      storeAuthSession(session)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to sign in right now.')

      if (message === 'Invalid credentials') {
        setFieldErrors({
          email: 'Email or password is incorrect.',
        })
        return
      }

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-[480px]">
        <PageSection
          eyebrow="Admin"
          title="Admin sign in"
          description="Sign in with an authorized admin account to manage bookings, cars, and members."
        >
          <Card>
            <CardContent>
              <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
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
                    autoComplete="current-password"
                    value={password}
                    isVisible={isPasswordVisible}
                    className={fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
                    aria-invalid={Boolean(fieldErrors.password)}
                    onVisibilityChange={() => setIsPasswordVisible((isVisible) => !isVisible)}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <FieldError message={fieldErrors.password} />
                </Label>

                {errorMessage ? <Alert title="Sign in failed">{errorMessage}</Alert> : null}

                <div className="flex justify-center">
                  <Button type="submit" className="w-fit px-6" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </PageSection>
      </div>
    </div>
  )
}
