import { ErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'
import { ErrorFallback } from '@/components/common/ErrorFallback'

interface ErrorBoundaryProviderProps {
  children: ReactNode
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const handleError = (error: Error) => {
    console.error('ErrorBoundary caught an error:', error)
  }

  const handleReset = () => {
    window.location.href = '/'
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  )
}
