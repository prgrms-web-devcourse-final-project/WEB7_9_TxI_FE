import { LoginModal } from '@/components/LoginModal'
import { SignupModal } from '@/components/SignupModal'
import { PageErrorFallback } from '@/components/common/ErrorFallback'
import { LoadingFallback } from '@/components/common/LoadingFallback'
import { type ReactNode, Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useRouterState } from '@tanstack/react-router'
import { Footer } from './Footer'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const router = useRouterState()
  const currentPath = router.location.pathname
  
  const isAdminPage = currentPath.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSignupClick={() => setIsSignupModalOpen(true)}
      />
      <main className="flex-1">
        <ErrorBoundary FallbackComponent={PageErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </ErrorBoundary>
      </main>
      {!isAdminPage && <Footer />}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onOpenSignupChange={setIsSignupModalOpen}
      />
      <SignupModal
        open={isSignupModalOpen}
        onOpenChange={setIsSignupModalOpen}
        onOpenLoginChange={setIsLoginModalOpen}
      />
    </div>
  )
}
