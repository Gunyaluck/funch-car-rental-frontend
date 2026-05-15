import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageSection } from '../components/PageSection'
import { Alert } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { FieldLabel, Label } from '../components/ui/label'
import { register } from '../features/auth/api'
import { storeAuthSession } from '../features/auth/storage'

const countryDefaults: Record<string, { timezone: string; currency: string }> = {
  TH: { timezone: 'Asia/Bangkok', currency: 'THB' },
  JP: { timezone: 'Asia/Tokyo', currency: 'JPY' },
  SG: { timezone: 'Asia/Singapore', currency: 'SGD' },
  MY: { timezone: 'Asia/Kuala_Lumpur', currency: 'MYR' },
  US: { timezone: 'America/New_York', currency: 'USD' },
  GB: { timezone: 'Europe/London', currency: 'GBP' },
  AU: { timezone: 'Australia/Sydney', currency: 'AUD' },
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('TH')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTo = searchParams.get('redirect') || '/cars'
  const countryProfile = countryDefaults[countryCode] ?? countryDefaults.TH

  function updateCountryCode(value: string) {
    const nextCountryCode = value.toUpperCase()
    setCountryCode(nextCountryCode)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!firstName || !lastName || !email || !password || !countryCode) {
      setErrorMessage('Complete the required account details.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
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
        timezone: countryProfile.timezone,
        preferredCurrency: countryProfile.currency,
      })
      storeAuthSession(session)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to create your account right now.'))
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
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>First name</FieldLabel>
                  <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                </Label>
                <Label>
                  <FieldLabel>Last name</FieldLabel>
                  <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>Phone</FieldLabel>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </Label>
                <Label>
                  <FieldLabel>Country</FieldLabel>
                  <Input
                    maxLength={2}
                    value={countryCode}
                    onChange={(event) => updateCountryCode(event.target.value)}
                  />
                </Label>
              </div>
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
