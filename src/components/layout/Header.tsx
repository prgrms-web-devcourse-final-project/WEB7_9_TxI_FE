import { authApi } from '@/api/auth'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'
import { toast } from 'sonner'

interface HeaderProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const router = useRouterState()
  const navigate = useNavigate()
  const currentPath = router.location.pathname
  const { isAuthenticated, clearUser, accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      toast.success('로그아웃되었습니다.')
      navigate({ to: '/' })
    },
    onError: () => {
      clearUser()
      queryClient.clear()
      navigate({ to: '/' })
    },
  })

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(path)
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const isAdminPage = currentPath.startsWith('/admin')

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={isAdminPage ? '/admin' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">{isAdmin ? 'WaitFair Admin' : 'WaitFair'}</span>
          </Link>

          {!isAdmin && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`text-base transition-colors text-lg ${
                  isActive('/')
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                홈
              </Link>
              <Link
                to="/events"
                className={`text-base transition-colors text-lg ${
                  isActive('/events')
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                이벤트
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
            </Button>
          ) : (
            <>
              {isAuthenticated && <NotificationDropdown />}
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/my-tickets">내 티켓</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/my-page">마이페이지</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onSignupClick}>
                    회원가입
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onLoginClick}>
                    로그인
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
