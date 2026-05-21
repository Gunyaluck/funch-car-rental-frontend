import { Globe2, MailCheck, Phone, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { listAdminMembers, type AdminMemberItem, updateAdminMemberStatus } from '../../features/users/admin-api'

const STATUS_OPTIONS: Array<AdminMemberItem['status'] | 'ALL'> = [
  'ALL',
  'ACTIVE',
  'SUSPENDED',
  'DELETED',
]

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

export function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMemberItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdminMemberItem['status'] | 'ALL'>('ALL')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [actionMemberId, setActionMemberId] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function fetchMembers() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await listAdminMembers()

        if (!isCurrent) {
          return
        }

        setMembers(result)
        setSelectedMemberId((currentId) => currentId || result[0]?.id || '')
      } catch (error) {
        if (!isCurrent) {
          return
        }

        setMembers([])
        setErrorMessage(getApiErrorMessage(error, 'Unable to load member data right now.'))
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    fetchMembers()

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return members.filter((member) => {
      if (statusFilter !== 'ALL' && member.status !== statusFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        getMemberName(member),
        member.email,
        member.phone ?? '',
        member.countryCode,
        member.timezone,
        member.currencyCode,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [members, searchTerm, statusFilter])

  useEffect(() => {
    if (filteredMembers.length === 0) {
      return
    }

    if (!filteredMembers.some((member) => member.id === selectedMemberId)) {
      setSelectedMemberId(filteredMembers[0].id)
    }
  }, [filteredMembers, selectedMemberId])

  const selectedMember = filteredMembers.find((member) => member.id === selectedMemberId) ?? null
  const activeCount = members.filter((member) => member.status === 'ACTIVE').length
  const suspendedCount = members.filter((member) => member.status === 'SUSPENDED').length
  const verifiedCount = members.filter((member) => member.emailVerifiedAt).length

  async function handleStatusChange(memberId: string, status: 'ACTIVE' | 'SUSPENDED') {
    setActionMemberId(memberId)
    setErrorMessage('')

    try {
      const updatedMember = await updateAdminMemberStatus(memberId, status)
      setMembers((currentMembers) =>
        currentMembers.map((member) => (member.id === memberId ? updatedMember : member)),
      )
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to update this member status.'))
    } finally {
      setActionMemberId('')
    }
  }

  return (
    <div className="grid gap-5">
      {errorMessage ? <Alert title="Members unavailable">{errorMessage}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="grid gap-2">
            <Badge variant="success">Active</Badge>
            <strong className="text-3xl leading-none">{activeCount}</strong>
            <span className="text-sm text-stone-500">Members currently allowed to book.</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <Badge variant="danger">Suspended</Badge>
            <strong className="text-3xl leading-none">{suspendedCount}</strong>
            <span className="text-sm text-stone-500">Accounts that need staff review.</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-2">
            <Badge variant="muted">Verified email</Badge>
            <strong className="text-3xl leading-none">{verifiedCount}</strong>
            <span className="text-sm text-stone-500">Members with confirmed email addresses.</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="m-0 text-xl font-semibold">Customer directory</h2>
            <p className="m-0 text-stone-500">
              Search member records and open a profile summary for support context.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_1fr_auto]">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, phone, country, timezone, or currency"
            />

            <label className="grid gap-1 text-sm text-stone-500">
              <span className="font-semibold">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as AdminMemberItem['status'] | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'ALL' ? 'All statuses' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                className="inline-flex items-center rounded-2xl border border-black/12 bg-white/60 px-4 py-[11px] font-semibold text-forest-900 transition hover:-translate-y-px"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('ALL')
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-semibold">Members</h2>
              <p className="m-0 text-stone-500">
                Showing {filteredMembers.length} of {members.length} members
              </p>
            </div>
            <Badge variant="muted">{isLoading ? 'Loading' : `${filteredMembers.length} results`}</Badge>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="grid min-h-[220px] place-items-center text-stone-500">
                Loading members...
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && filteredMembers.length === 0 ? (
            <Card>
              <CardContent className="grid gap-2">
                <Badge variant="muted">No results</Badge>
                <h3 className="m-0 text-lg font-semibold">No members match these filters</h3>
                <p className="m-0 text-stone-500">Try a broader search or reset the status filter.</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4">
            {filteredMembers.map((member) => {
              const isSelected = member.id === selectedMemberId

              return (
                <button
                  key={member.id}
                  type="button"
                  className="text-left"
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <Card
                    className={
                      isSelected
                        ? 'border-forest-700/25 shadow-[0_20px_60px_rgba(32,48,36,0.12)]'
                        : undefined
                    }
                  >
                    <CardContent className="grid gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="grid gap-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                            {member.emailVerifiedAt ? (
                              <Badge variant="chip">Verified email</Badge>
                            ) : null}
                          </div>
                          <h3 className="m-0 text-xl font-semibold">{getMemberName(member)}</h3>
                          <p className="m-0 text-stone-500">{member.email}</p>
                        </div>
                        <div className="text-right text-sm text-stone-500">
                          <div>{member.bookingCount} bookings</div>
                          <div>{member.activeBookingCount} active</div>
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm text-stone-500 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <Phone className="size-4" />
                          <span>{member.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe2 className="size-4" />
                          <span>
                            {member.countryCode} · {member.timezone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="size-4" />
                          <span>{member.currencyCode}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 self-start xl:sticky xl:top-6">
          <div>
            <h2 className="m-0 text-xl font-semibold">Member profile</h2>
            <p className="m-0 text-stone-500">Review support context for the selected member.</p>
          </div>

          {!isLoading && !selectedMember ? (
            <Card>
              <CardContent className="grid min-h-[280px] place-items-center text-center text-stone-500">
                Choose a member from the list to open their profile summary.
              </CardContent>
            </Card>
          ) : null}

          {selectedMember ? (
            <Card>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getStatusVariant(selectedMember.status)}>{selectedMember.status}</Badge>
                    <Badge variant="muted">{selectedMember.role}</Badge>
                  </div>
                  <h3 className="m-0 text-2xl font-semibold">{getMemberName(selectedMember)}</h3>
                  <p className="m-0 text-stone-500">{selectedMember.email}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/60 p-4">
                    <span className="block text-sm font-semibold text-stone-500">Bookings</span>
                    <strong>{selectedMember.bookingCount} total bookings</strong>
                    <p className="m-0 text-stone-500">{selectedMember.activeBookingCount} currently active</p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4">
                    <span className="block text-sm font-semibold text-stone-500">Verification</span>
                    <strong>{selectedMember.emailVerifiedAt ? 'Email verified' : 'Email not verified'}</strong>
                    <p className="m-0 text-stone-500">{formatDate(selectedMember.emailVerifiedAt)}</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                    <MailCheck className="mt-0.5 size-4 text-stone-500" />
                    <div>
                      <strong className="block">Contact</strong>
                      <span className="text-stone-500">
                        {selectedMember.email}
                        {selectedMember.phone ? ` · ${selectedMember.phone}` : ' · No phone'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                    <Globe2 className="mt-0.5 size-4 text-stone-500" />
                    <div>
                      <strong className="block">Location and billing</strong>
                      <span className="text-stone-500">
                        {selectedMember.countryCode} · {selectedMember.timezone} · {selectedMember.currencyCode}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                    <Users className="mt-0.5 size-4 text-stone-500" />
                    <div>
                      <strong className="block">Account created</strong>
                      <span className="text-stone-500">{formatDate(selectedMember.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {selectedMember.role === 'CUSTOMER' ? (
                  <div className="flex justify-end">
                    {selectedMember.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        disabled={actionMemberId === selectedMember.id}
                        className="inline-flex items-center rounded-2xl border border-red-200 bg-red-50 px-4 py-[11px] font-semibold text-red-700 transition hover:-translate-y-px hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleStatusChange(selectedMember.id, 'SUSPENDED')}
                      >
                        {actionMemberId === selectedMember.id ? 'Updating...' : 'Suspend member'}
                      </button>
                    ) : selectedMember.status === 'SUSPENDED' ? (
                      <button
                        type="button"
                        disabled={actionMemberId === selectedMember.id}
                        className="inline-flex items-center rounded-2xl border border-forest-700/20 bg-forest-700/10 px-4 py-[11px] font-semibold text-forest-800 transition hover:-translate-y-px hover:bg-forest-700/15 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleStatusChange(selectedMember.id, 'ACTIVE')}
                      >
                        {actionMemberId === selectedMember.id ? 'Updating...' : 'Activate member'}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
