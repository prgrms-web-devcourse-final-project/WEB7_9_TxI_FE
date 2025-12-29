import { useAuthStore } from '@/stores/authStore'
import { redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export function requireAuth(location: { pathname: string }) {
  const isAuthenticated = useAuthStore.getState().isAuthenticated

  if (!isAuthenticated) {
    const shouldLogin = window.confirm('로그인이 필요한 페이지입니다. 로그인 하시겠습니까?')

    if (shouldLogin) {
      window.dispatchEvent(
        new CustomEvent('openLoginModal', {
          detail: { redirectPath: location.pathname },
        }),
      )
    }

    throw redirect({ to: '/' })
  }
}

export function requireAdmin(location: { pathname: string }) {
  const storeState = useAuthStore.getState()
  let token = storeState.accessToken
  let isAuthenticated = storeState.isAuthenticated

  if (!token) {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      token = parsed?.state?.accessToken || null
      isAuthenticated = parsed?.state?.isAuthenticated || false
    }
  }

  const hasAuth = isAuthenticated || !!token

  if (!hasAuth) {
    const shouldLogin = window.confirm('로그인이 필요한 페이지입니다. 로그인 하시겠습니까?')

    if (shouldLogin) {
      window.dispatchEvent(
        new CustomEvent('openLoginModal', {
          detail: { redirectPath: location.pathname },
        }),
      )
    }

    throw redirect({ to: '/' })
  }

  if (!token) {
    toast.error('인증 토큰이 없습니다')
    throw redirect({ to: '/' })
  }

  const userRole = getRoleFromToken(token)

  if (userRole !== 'ADMIN') {
    toast.error('관리자 권한이 필요합니다')
    throw redirect({ to: '/events' })
  }
}

export function getRoleFromToken(token: string | null): string | null {
  if (!token) {
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64))

    return decoded.role || decoded.Role || null
  } catch {
    return null
  }
}
