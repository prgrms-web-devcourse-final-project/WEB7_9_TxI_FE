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
  // localStorage에서 직접 토큰 읽기 (zustand persist가 아직 업데이트되지 않았을 수 있음)
  let token: string | null = null
  let isAuthenticated = false
  
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      token = parsed?.state?.accessToken || null
      isAuthenticated = parsed?.state?.isAuthenticated || false
    }
  } catch (error) {
    console.warn('Failed to read token from localStorage:', error)
  }

  // zustand store에서도 확인 (fallback)
  if (!token) {
    const storeState = useAuthStore.getState()
    token = storeState.accessToken
    isAuthenticated = storeState.isAuthenticated
  }

  // accessToken이 있으면 인증된 것으로 간주 (로그인 직후 상태 업데이트 지연 대응)
  const hasAuth = isAuthenticated || !!token

  // 디버깅을 위한 로그
  console.log('requireAdmin check:', { 
    hasAuth, 
    hasToken: !!token, 
    tokenLength: token?.length,
    pathname: location.pathname 
  })

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
    console.error('requireAdmin: Token is null but hasAuth is true')
    toast.error('인증 토큰이 없습니다')
    throw redirect({ to: '/' })
  }

  const userRole = getRoleFromToken(token)
  
  console.log('requireAdmin role check:', { userRole, isAdmin: userRole === 'ADMIN' })
  
  if (userRole !== 'ADMIN') {
    console.warn('Admin access denied:', { 
      userRole, 
      expected: 'ADMIN',
      tokenPreview: token?.substring(0, 30) + '...' 
    })
    toast.error('관리자 권한이 필요합니다')
    throw redirect({ to: '/events' })
  }
  
  console.log('requireAdmin: Access granted')
}


export function getRoleFromToken(token: string | null): string | null {
  if (!token) {
    console.warn('getRoleFromToken: No token provided')
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('Invalid token format: expected 3 parts, got', parts.length)
      return null
    }

    const payload = parts[1]
    // Base64 URL 디코딩
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64))
    
    const role = decoded.role || decoded.Role || null
    console.log('getRoleFromToken:', { role, decoded })
    
    return role
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}