import { type ReactNode, useEffect } from 'react'
import { Toaster } from 'sonner'
import { QueryProvider } from './QueryProvider'
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider'
import { useAuthStore } from '@/stores/authStore'
import { userApi } from '@/api/user'

interface AppProviderProps {
  children: ReactNode
}

function AuthInitializer({ children }: { children: ReactNode }) {
  const { user, setUser, clearUser } = useAuthStore()

  // 앱 초기 로드 시 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      // store에 이미 사용자 정보가 있으면 API 호출 스킵
      if (user?.email && user?.nickname && user?.fullName) {
        return
      }

      try {
        const profile = await userApi.getProfile()
        setUser(profile)
      } catch (error) {
        // 인증 실패 (쿠키 없음 또는 만료)
        clearUser()
      }
    }

    checkAuth()
  }, [user, setUser, clearUser])

  // Axios에서 발생하는 로그아웃 이벤트 리스닝
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
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
          />
        </AuthInitializer>
      </QueryProvider>
    </ErrorBoundaryProvider>
  )
}
