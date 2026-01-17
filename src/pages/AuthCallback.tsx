import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import * as authService from '../services/auth'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setCredentials } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const sessionId = searchParams.get('sessionId')
      const sessionCode = searchParams.get('sessionCode')
      const storedSessionId = sessionStorage.getItem('auth_session_id')

      // Validate session ID matches (CSRF protection)
      if (!sessionId || !sessionCode) {
        setError('Missing authentication parameters')
        return
      }

      if (sessionId !== storedSessionId) {
        setError('Session mismatch - possible security issue')
        return
      }

      try {
        // Exchange code for tokens
        const credentials = await authService.exchangeCodeForTokens(sessionId, sessionCode)

        // Clear the stored session ID
        sessionStorage.removeItem('auth_session_id')

        // Update auth context
        setCredentials(credentials.user, credentials.accessToken, credentials.refreshToken)

        // Redirect to home
        navigate('/', { replace: true })
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleCallback()
  }, [searchParams, navigate, setCredentials])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
