import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getStoredAuthSession } from '../features/auth/storage'

type RequireAuthProps = {
  children: ReactNode
  role?: 'CUSTOMER' | 'ADMIN'
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const location = useLocation()
  const session = getStoredAuthSession()

  if (!session) {
    const redirect = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  if (role && session.user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}
