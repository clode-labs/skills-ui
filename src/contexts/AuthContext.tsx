import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

import type { AuthContextType, AuthState, User } from '../types/auth'
import * as authService from '../services/auth'

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)

  // Load credentials from storage on mount
  useEffect(() => {
    const credentials = authService.loadCredentials()

    if (credentials) {
      // Check if access token is expired
      if (authService.isTokenExpired(credentials.accessToken)) {
        // Try to refresh
        authService
          .refreshAccessToken(credentials.refreshToken)
          .then(newCreds => {
            if (newCreds) {
              authService.saveCredentials(newCreds)
              setState({
                user: newCreds.user,
                accessToken: newCreds.accessToken,
                refreshToken: newCreds.refreshToken,
                isAuthenticated: true,
                isLoading: false,
              })
            } else {
              // Refresh failed, clear credentials
              authService.clearCredentials()
              setState({ ...initialState, isLoading: false })
            }
          })
      } else {
        setState({
          user: credentials.user,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } else {
      setState({ ...initialState, isLoading: false })
    }
  }, [])

  const signIn = useCallback((redirectPath?: string) => {
    const callbackUrl = `${window.location.origin}/auth/callback`
    const loginUrl = authService.buildLoginUrl(callbackUrl, false, redirectPath)
    window.location.href = loginUrl
  }, [])

  const signUp = useCallback((redirectPath?: string) => {
    const callbackUrl = `${window.location.origin}/auth/callback`
    const loginUrl = authService.buildLoginUrl(callbackUrl, true, redirectPath)
    window.location.href = loginUrl
  }, [])

  const signOut = useCallback(async () => {
    if (state.accessToken && state.refreshToken) {
      await authService.revokeTokens(state.accessToken, state.refreshToken)
    }
    authService.clearCredentials()
    setState({ ...initialState, isLoading: false })
  }, [state.accessToken, state.refreshToken])

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!state.refreshToken) return false

    const newCreds = await authService.refreshAccessToken(state.refreshToken)
    if (newCreds) {
      authService.saveCredentials(newCreds)
      setState(prev => ({
        ...prev,
        accessToken: newCreds.accessToken,
        refreshToken: newCreds.refreshToken,
        user: newCreds.user,
      }))
      return true
    }

    // Refresh failed, sign out
    authService.clearCredentials()
    setState({ ...initialState, isLoading: false })
    return false
  }, [state.refreshToken])

  // Function to set credentials after callback
  const setCredentials = useCallback(
    (user: User, accessToken: string, refreshToken: string) => {
      authService.saveCredentials({ user, accessToken, refreshToken })
      setState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      })
    },
    [],
  )

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      refreshAccessToken,
      setCredentials,
    }),
    [state, signIn, signUp, signOut, refreshAccessToken, setCredentials],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
