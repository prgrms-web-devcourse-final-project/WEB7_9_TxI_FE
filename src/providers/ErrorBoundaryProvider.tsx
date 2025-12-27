import { ErrorFallback } from '@/components/common/ErrorFallback'
import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface ErrorBoundaryProviderProps {
  children: ReactNode
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const handleError = (error: Error) => {
    console.error(error)
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
