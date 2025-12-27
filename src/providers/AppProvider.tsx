import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider'
import { QueryProvider } from './QueryProvider'

interface AppProviderProps {
  children: ReactNode
}

function AuthInitializer({ children }: { children: ReactNode }) {
  const { setUser, clearUser, accessToken, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

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
        queryClient.clear()
      }
    }

    checkAuth()
  }, [accessToken, isAuthenticated, setUser, clearUser, queryClient])

  useEffect(() => {
    const handleLogout = () => {
      clearUser()
      queryClient.clear()
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [clearUser, queryClient])

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
