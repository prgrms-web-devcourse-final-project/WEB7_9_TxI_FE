import { ErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'
import { ErrorFallback } from '@/components/ErrorFallback'

interface ErrorBoundaryProviderProps {
  children: ReactNode
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const handleError = (error: Error) => {
    console.error('ErrorBoundary caught an error:', error)
    // 에러 발생 시 콘솔에만 로그 (toast는 각 mutation에서 처리)
  }

  const handleReset = () => {
    // 에러 리셋 시 페이지 새로고침
    window.location.href = '/'
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  )
}
