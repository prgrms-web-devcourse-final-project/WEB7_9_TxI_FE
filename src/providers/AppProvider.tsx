import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/authStore'
import { type ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider'
import { QueryProvider } from './QueryProvider'

interface AppProviderProps {
  children: ReactNode
}

function AuthInitializer({ children }: { children: ReactNode }) {
  const { setUser, clearUser, accessToken, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated || !accessToken) {
        return
      }

      try {
        const { data } = await userApi.getUserProfile()
        setUser(data)
      } catch {
        clearUser()
      }
    }

    checkAuth()
  }, [accessToken, isAuthenticated, setUser, clearUser])

  useEffect(() => {
    const handleLogout = () => {
      clearUser()
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [clearUser])

  return <>{children}</>
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundaryProvider>
      <QueryProvider>
        <AuthInitializer>
          {children}
          <Toaster position="top-right" richColors closeButton theme="system" />
        </AuthInitializer>
      </QueryProvider>
    </ErrorBoundaryProvider>
  )
}
