const AUTH_URL = import.meta.env.VITE_AUTH_URL
const USER_ID = import.meta.env.VITE_USER_ID

let cachedToken: string | null = null

export function getCurrentUserId(): string {
  return USER_ID
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken
  }

  const response = await fetch(
    `${AUTH_URL}/generate-dev-jwt-access-token?sub=${USER_ID}`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch access token: ${response.statusText}`)
  }

  const data = await response.json()

  // Handle multiple response formats
  let token: string
  if (data.OK?.Jwt) {
    token = data.OK.Jwt
  } else if (data.access_token) {
    token = data.access_token
  } else if (data.token) {
    token = data.token
  } else if (typeof data === 'string') {
    token = data
  } else {
    throw new Error('Unable to extract token from auth response')
  }

  cachedToken = token
  return token
}

export function clearAccessToken(): void {
  cachedToken = null
}
