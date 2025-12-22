import { authApi } from '@/api/auth'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useMutation } from '@tanstack/react-query'
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
  const { isAuthenticated, clearUser } = useAuthStore()

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearUser()
      toast.success('로그아웃되었습니다.')
      navigate({ to: '/' })
    },
    onError: () => {
      clearUser()
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

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">WaitFair</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/events"
            className={`text-sm transition-colors ${
              isActive('/events')
                ? 'text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            이벤트
          </Link>
          <Link
            to="/faq"
            className={`text-sm transition-colors ${
              isActive('/faq') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </header>
  )
}
