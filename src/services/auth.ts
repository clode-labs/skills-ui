import type { Credentials, User } from '../types/auth'

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://auth.clode.space/auth'
const WEBAPP_URL = import.meta.env.VITE_WEBAPP_URL || 'https://app.clode.space'

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'skills_access_token',
  REFRESH_TOKEN: 'skills_refresh_token',
  USER: 'skills_user',
} as const

/**
 * Generate a UUID v4 for session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID()
}

/**
 * Build the login URL for web-app redirect
 */
export function buildLoginUrl(callbackUrl: string, isSignUp = false): string {
  const sessionId = generateSessionId()

  // Store session ID for verification on callback
  sessionStorage.setItem('auth_session_id', sessionId)

  const path = isSignUp ? '/signup' : '/login'
  const url = new URL(path, WEBAPP_URL)
  url.searchParams.set('sessionId', sessionId)
  url.searchParams.set('initiator', 'skills-ui')
  url.searchParams.set('callback', callbackUrl)

  return url.toString()
}

/**
 * Exchange session code for tokens via Raksha
 */
export async function exchangeCodeForTokens(
  sessionId: string,
  sessionCode: string
): Promise<Credentials> {
  const response = await fetch(`${AUTH_URL}/cli/sessions/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, sessionCode }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  // Extract tokens from headers
  const accessToken = response.headers.get('cl-access-token')
  const refreshToken = response.headers.get('cl-refresh-token')

  if (!accessToken || !refreshToken) {
    throw new Error('Missing tokens in response')
  }

  // Parse user from body
  const data = await response.json()
  const user = data.user as User

  return { accessToken, refreshToken, user }
}

/**
 * Refresh the access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<Credentials | null> {
  try {
    const response = await fetch(`${AUTH_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      return null
    }

    const accessToken = response.headers.get('cl-access-token')
    const newRefreshToken = response.headers.get('cl-refresh-token')

    if (!accessToken || !newRefreshToken) {
      return null
    }

    const data = await response.json()
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: data.user,
    }
  } catch {
    return null
  }
}

/**
 * Revoke tokens (logout)
 */
export async function revokeTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await fetch(`${AUTH_URL}/revoke-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        token: accessToken,
        refresh_token: refreshToken
      }),
    })
  } catch {
    // Ignore errors on logout
  }
}

/**
 * Storage helpers
 */
export function saveCredentials(credentials: Credentials): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, credentials.accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, credentials.refreshToken)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(credentials.user))
}

export function loadCredentials(): Credentials | null {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  const userJson = localStorage.getItem(STORAGE_KEYS.USER)

  if (!accessToken || !refreshToken || !userJson) {
    return null
  }

  try {
    const user = JSON.parse(userJson) as User
    return { accessToken, refreshToken, user }
  } catch {
    return null
  }
}

export function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  sessionStorage.removeItem('auth_session_id')
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Check if token is expired (with 5 min buffer)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    const buffer = 5 * 60 * 1000 // 5 minutes
    return Date.now() > exp - buffer
  } catch {
    return true
  }
}
