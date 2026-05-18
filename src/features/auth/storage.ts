import type { AuthSession } from './types'

const authSessionKey = 'authSession'
const authChangeEvent = 'auth-session-change'

export function getStoredAuthSession() {
  const rawSession = window.localStorage.getItem(authSessionKey)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(authSessionKey)
    return null
  }
}

export function getStoredAccessToken() {
  return getStoredAuthSession()?.accessToken ?? null
}

export function storeAuthSession(session: AuthSession) {
  window.localStorage.setItem(authSessionKey, JSON.stringify(session))

  if (session.user.countryCode) {
    window.localStorage.setItem('customerCountryCode', session.user.countryCode)
  }

  window.dispatchEvent(new Event(authChangeEvent))
}

export function clearAuthSession() {
  window.localStorage.removeItem(authSessionKey)
  window.dispatchEvent(new Event(authChangeEvent))
}

export function subscribeToAuthSessionChange(callback: () => void) {
  window.addEventListener(authChangeEvent, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(authChangeEvent, callback)
    window.removeEventListener('storage', callback)
  }
}
