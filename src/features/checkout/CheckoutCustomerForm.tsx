import { Input } from '../../components/ui/input'
import { FieldLabel, Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { countryOptions } from '../../lib/country-options'
import type { ContactFieldErrors, RegisterFieldErrors } from './utils'

type CheckoutCustomerFormProps = {
  isSignedIn: boolean
  isDisabled: boolean
  hasBooking: boolean
  contactEmail: string
  contactFirstName: string
  contactLastName: string
  contactPhone: string
  contactCountryCode: string
  accountPassword: string
  confirmAccountPassword: string
  contactErrors: ContactFieldErrors
  registerErrors: RegisterFieldErrors
  onContactEmailChange: (value: string) => void
  onContactFirstNameChange: (value: string) => void
  onContactLastNameChange: (value: string) => void
  onContactPhoneChange: (value: string) => void
  onContactCountryCodeChange: (value: string) => void
  onAccountPasswordChange: (value: string) => void
  onConfirmAccountPasswordChange: (value: string) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="m-0 text-sm font-medium text-red-600">{message}</p>
}

export function CheckoutCustomerForm({
  isSignedIn,
  isDisabled,
  hasBooking,
  contactEmail,
  contactFirstName,
  contactLastName,
  contactPhone,
  contactCountryCode,
  accountPassword,
  confirmAccountPassword,
  contactErrors,
  registerErrors,
  onContactEmailChange,
  onContactFirstNameChange,
  onContactLastNameChange,
  onContactPhoneChange,
  onContactCountryCodeChange,
  onAccountPasswordChange,
  onConfirmAccountPasswordChange,
}: CheckoutCustomerFormProps) {
  const disabled = isDisabled || hasBooking

  return (
    <div className="grid gap-4 rounded-2xl bg-white/60 p-4">
      <Label>
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          value={contactEmail}
          className={registerErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
          aria-invalid={Boolean(registerErrors.email)}
          disabled={isSignedIn || disabled}
          onChange={(event) => onContactEmailChange(event.target.value)}
        />
        <FieldError message={registerErrors.email} />
      </Label>

      <div className="grid gap-4 md:grid-cols-2">
        <Label>
          <FieldLabel>First name</FieldLabel>
          <Input
            value={contactFirstName}
            autoComplete="given-name"
            className={contactErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
            aria-invalid={Boolean(contactErrors.firstName)}
            disabled={disabled}
            onChange={(event) => onContactFirstNameChange(event.target.value)}
          />
          <FieldError message={contactErrors.firstName} />
        </Label>
        <Label>
          <FieldLabel>Last name</FieldLabel>
          <Input
            value={contactLastName}
            autoComplete="family-name"
            className={contactErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
            aria-invalid={Boolean(contactErrors.lastName)}
            disabled={disabled}
            onChange={(event) => onContactLastNameChange(event.target.value)}
          />
          <FieldError message={contactErrors.lastName} />
        </Label>
      </div>

      <Label>
        <FieldLabel>Phone</FieldLabel>
        <Input
          type="tel"
          autoComplete="tel"
          value={contactPhone}
          className={contactErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
          aria-invalid={Boolean(contactErrors.phone)}
          disabled={disabled}
          onChange={(event) => onContactPhoneChange(event.target.value)}
        />
        <FieldError message={contactErrors.phone} />
      </Label>

      <Label>
        <FieldLabel>Country</FieldLabel>
        <Select
          value={contactCountryCode}
          onValueChange={onContactCountryCodeChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={registerErrors.countryCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
            aria-invalid={Boolean(registerErrors.countryCode)}
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
        <FieldError message={registerErrors.countryCode} />
      </Label>

      {!isSignedIn ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Label>
            <FieldLabel>Create password</FieldLabel>
            <Input
              type="password"
              autoComplete="new-password"
              value={accountPassword}
              className={registerErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
              aria-invalid={Boolean(registerErrors.password)}
              disabled={disabled}
              onChange={(event) => onAccountPasswordChange(event.target.value)}
            />
            <FieldError message={registerErrors.password} />
          </Label>
          <Label>
            <FieldLabel>Confirm password</FieldLabel>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmAccountPassword}
              className={registerErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined}
              aria-invalid={Boolean(registerErrors.confirmPassword)}
              disabled={disabled}
              onChange={(event) => onConfirmAccountPasswordChange(event.target.value)}
            />
            <FieldError message={registerErrors.confirmPassword} />
          </Label>
        </div>
      ) : null}
    </div>
  )
}
