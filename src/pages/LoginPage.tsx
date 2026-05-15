import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { FieldLabel, Label } from '../components/ui/label'
import { login } from '../features/auth/api'
import { storeAuthSession } from '../features/auth/storage'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTo = searchParams.get('redirect') || '/cars'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!email || !password) {
      setErrorMessage('Enter your email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const session = await login({ email, password })
      storeAuthSession(session)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to sign in right now.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageSection
      title="Sign in"
      description="Access your bookings and continue checkout."
      align="center"
      variant="plain"
    >
      <div className="mx-auto grid w-full max-w-[420px] gap-4">
        <Card>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Label>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Label>

              <Label>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
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

        <p className="m-0 text-center text-sm text-stone-500">
          New customer?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-forest-700"
          >
            Create account
          </Link>
        </p>
      </div>
    </PageSection>
  )
}
