import { Globe2, MailCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { listAdminMembers, type AdminMemberItem, updateAdminMemberStatus } from '../../features/users/admin-api'

function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function getMemberName(member: AdminMemberItem) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ').trim()
  return fullName || 'No name'
}

function getStatusVariant(status: AdminMemberItem['status']) {
  if (status === 'ACTIVE') {
    return 'success' as const
  }

  if (status === 'SUSPENDED') {
    return 'danger' as const
  }

  return 'muted' as const
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not yet'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AdminMemberDetailPage() {
  const navigate = useNavigate()
  const { memberId } = useParams()
  const [member, setMember] = useState<AdminMemberItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMemberId, setActionMemberId] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadMember() {
      if (!memberId) {
        setErrorMessage('Missing member id.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await listAdminMembers()
        const match = result.find((item) => item.id === memberId) ?? null

        if (!isCurrent) {
          return
        }

        if (!match) {
          setMember(null)
          setErrorMessage('This member could not be found.')
          return
        }

        setMember(match)
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load this member.'))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadMember()

    return () => {
      isCurrent = false
    }
  }, [memberId])

  async function handleStatusChange(status: 'ACTIVE' | 'SUSPENDED') {
    if (!member) {
      return
    }

    setActionMemberId(member.id)
    setErrorMessage('')

    try {
      const updatedMember = await updateAdminMemberStatus(member.id, status)
      setMember(updatedMember)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to update this member status.'))
    } finally {
      setActionMemberId('')
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/members')}>
          Back to members
        </Button>
      </div>

      {errorMessage ? <Alert title="Member unavailable">{errorMessage}</Alert> : null}

      {isLoading ? (
        <Card>
          <CardContent className="grid min-h-[220px] place-items-center text-stone-500">
            Loading member details...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && member ? (
        <Card>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                <Badge variant="muted">{member.role}</Badge>
                {member.emailVerifiedAt ? <Badge variant="chip">Verified email</Badge> : null}
              </div>
              <h1 className="m-0 text-2xl font-semibold">{getMemberName(member)}</h1>
              <p className="m-0 text-stone-500">{member.email}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Bookings</span>
                <strong>{member.bookingCount} total bookings</strong>
                <p className="m-0 text-stone-500">{member.activeBookingCount} currently active</p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4">
                <span className="block text-sm font-semibold text-stone-500">Verification</span>
                <strong>{member.emailVerifiedAt ? 'Email verified' : 'Email not verified'}</strong>
                <p className="m-0 text-stone-500">{formatDate(member.emailVerifiedAt)}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <MailCheck className="mt-0.5 size-4 text-stone-500" />
                <div>
                  <strong className="block">Contact</strong>
                  <span className="text-stone-500">
                    {member.email}
                    {member.phone ? ` · ${member.phone}` : ' · No phone'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <Globe2 className="mt-0.5 size-4 text-stone-500" />
                <div>
                  <strong className="block">Location and billing</strong>
                  <span className="text-stone-500">
                    {member.countryCode} · {member.timezone} · {member.currencyCode}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                <Users className="mt-0.5 size-4 text-stone-500" />
                <div>
                  <strong className="block">Account created</strong>
                  <span className="text-stone-500">{formatDate(member.createdAt)}</span>
                </div>
              </div>
            </div>

            {member.role === 'CUSTOMER' ? (
              <div className="flex justify-end">
                {member.status === 'ACTIVE' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionMemberId === member.id}
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => void handleStatusChange('SUSPENDED')}
                  >
                    {actionMemberId === member.id ? 'Updating...' : 'Suspend member'}
                  </Button>
                ) : member.status === 'SUSPENDED' ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionMemberId === member.id}
                    className="border-forest-700/20 bg-forest-700/10 text-forest-800 hover:bg-forest-700/15"
                    onClick={() => void handleStatusChange('ACTIVE')}
                  >
                    {actionMemberId === member.id ? 'Updating...' : 'Activate member'}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
