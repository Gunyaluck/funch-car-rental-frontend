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

const countryCurrencyDefaults: Record<string, string> = {
  TH: 'THB',
  JP: 'JPY',
  US: 'USD',
  SG: 'SGD',
  MY: 'MYR',
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok'
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
  const [timezone, setTimezone] = useState(getLocalTimezone)
  const [preferredCurrency, setPreferredCurrency] = useState('THB')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTo = searchParams.get('redirect') || '/cars'

  function updateCountryCode(value: string) {
    const nextCountryCode = value.toUpperCase()
    setCountryCode(nextCountryCode)
    setPreferredCurrency(countryCurrencyDefaults[nextCountryCode] ?? preferredCurrency)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!firstName || !lastName || !email || !password || !countryCode || !timezone) {
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
        timezone,
        preferredCurrency,
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
      eyebrow="Auth"
      title="Create account"
      description="Save your profile for faster bookings and local price estimates."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)]">
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
                  <FieldLabel>Country code</FieldLabel>
                  <Input
                    maxLength={2}
                    value={countryCode}
                    onChange={(event) => updateCountryCode(event.target.value)}
                  />
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  <FieldLabel>Timezone</FieldLabel>
                  <Input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
                </Label>
                <Label>
                  <FieldLabel>Preferred currency</FieldLabel>
                  <Input
                    maxLength={3}
                    value={preferredCurrency}
                    onChange={(event) => setPreferredCurrency(event.target.value.toUpperCase())}
                  />
                </Label>
              </div>

              {errorMessage ? <Alert title="Account could not be created">{errorMessage}</Alert> : null}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid content-start gap-3">
            <h2 className="m-0 font-(--font-heading) text-[1.35rem]">Already registered?</h2>
            <p className="m-0 text-stone-500">
              Sign in to continue with your saved booking details.
            </p>
            <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-forest-700">
              Sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageSection>
  )
}
