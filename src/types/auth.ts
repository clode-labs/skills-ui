export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (redirectPath?: string) => void
  signUp: (redirectPath?: string) => void
  signOut: () => void
  refreshAccessToken: () => Promise<boolean>
  setCredentials: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => void
}

export interface TokenExchangeResponse {
  user: User
}

export interface Credentials {
  accessToken: string
  refreshToken: string
  user: User
}
