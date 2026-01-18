import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

export default function SignUp() {
  const { isAuthenticated, isLoading, signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Already signed in, redirect to home
        navigate('/', { replace: true })
      } else {
        // Redirect to web-app signup
        signUp()
      }
    }
  }, [isAuthenticated, isLoading, signUp, navigate])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to sign up...</p>
      </div>
    </div>
  )
}
