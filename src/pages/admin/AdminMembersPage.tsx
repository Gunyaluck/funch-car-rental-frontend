import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableContainer,
  AdminDataTableHead,
  AdminDataTableHeaderCell,
  AdminDataTableRow,
} from '../../components/ui/admin-data-table'
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
import { listAdminMembers, type AdminMemberItem } from '../../features/users/admin-api'

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

export function AdminMembersPage() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<AdminMemberItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdminMemberItem['status'] | 'ALL'>('ALL')

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
  const activeCount = members.filter((member) => member.status === 'ACTIVE').length
  const suspendedCount = members.filter((member) => member.status === 'SUSPENDED').length
  const verifiedCount = members.filter((member) => member.emailVerifiedAt).length

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
        <div className="grid gap-4 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-semibold">Members</h2>
              <p className="m-0 text-stone-500">
                Showing {filteredMembers.length} of {members.length} members. Click a row to open details.
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

          {!isLoading && filteredMembers.length > 0 ? (
            <AdminDataTableContainer>
              <AdminDataTable>
                <AdminDataTableHead>
                  <tr>
                    <AdminDataTableHeaderCell>Member</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Region</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Activity</AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>Status</AdminDataTableHeaderCell>
                  </tr>
                </AdminDataTableHead>
                <AdminDataTableBody>
                  {filteredMembers.map((member) => (
                    <AdminDataTableRow
                      key={member.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/members/${member.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/admin/members/${member.id}`)
                        }
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      <AdminDataTableCell className="min-w-[220px]">
                        <div className="grid gap-2">
                          <div className="font-semibold text-forest-900">{getMemberName(member)}</div>
                          <div className="text-sm text-stone-500">{member.email}</div>
                          <div className="text-xs text-stone-400">{member.role}</div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>
                        <div className="grid gap-1">
                          <div>
                            {member.countryCode} · {member.timezone}
                          </div>
                          <div className="text-sm text-stone-500">{member.currencyCode}</div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell>
                        <div className="grid gap-1">
                          <div>{member.bookingCount} total bookings</div>
                          <div className="text-sm text-stone-500">
                            {member.activeBookingCount} active · {member.phone || 'No phone'}
                          </div>
                        </div>
                      </AdminDataTableCell>
                      <AdminDataTableCell className="min-w-[170px]">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                          {member.emailVerifiedAt ? (
                            <Badge variant="chip">Verified email</Badge>
                          ) : null}
                        </div>
                      </AdminDataTableCell>
                    </AdminDataTableRow>
                  ))}
                </AdminDataTableBody>
              </AdminDataTable>
            </AdminDataTableContainer>
          ) : null}
        </div>
      </div>
    </div>
  )
}
