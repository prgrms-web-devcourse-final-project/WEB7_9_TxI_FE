import { useAuthStore } from '@/stores/authStore'
import { redirect } from '@tanstack/react-router'

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

/**
 * JWT 토큰에서 Role을 추출합니다.
 * @param token JWT 토큰 문자열
 * @returns Role 문자열 또는 null
 */
export function getRoleFromToken(token: string | null): string | null {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.role || decoded.Role || null
  } catch {
    return null
  }
}