import { useEffect, useRef } from 'react'
import { queueApi } from '@/api/queue'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'

interface UseQueueExitGuardParams {
  eventId: string
  enabled: boolean
  onExitAttempt: () => void
  isPaymentInProgress?: boolean  // 결제 진행 중 플래그
}

interface UseQueueExitGuardReturn {
  moveToBackAndNavigate: () => Promise<void>
}

export function useQueueExitGuard({
  eventId,
  enabled,
  onExitAttempt,
  isPaymentInProgress = false,
}: UseQueueExitGuardParams): UseQueueExitGuardReturn {
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()
  const pendingNavigationRef = useRef<string | null>(null)
  const isNavigatingRef = useRef(false)
  const handlersRegisteredRef = useRef(false)
  const handlePopStateRef = useRef<((e: PopStateEvent) => void) | null>(null)

  useEffect(() => {
    if (!enabled) {
      handlersRegisteredRef.current = false
      return
    }

    if (handlersRegisteredRef.current) return
    handlersRegisteredRef.current = true

    const callMoveToBackApi = () => {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.waitfair.shop/api/v1'
      const url = `${baseURL}/queues/${eventId}/move-to-back`

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({}),
        keepalive: true,
        credentials: 'include',
      }).catch((error) => {
        console.error(error)
      })
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!handlersRegisteredRef.current) return
      e.preventDefault()
      return ''
    }

    const handlePageHide = (e: PageTransitionEvent) => {
      if (!handlersRegisteredRef.current) return

      // 결제 진행 중이면 move-to-back 호출 안 함
      if (isPaymentInProgress) {
        console.log('[QueueExitGuard] 결제 진행 중이므로 move-to-back 스킵')
        return
      }

      if (!e.persisted) {
        callMoveToBackApi()
      }
    }

    const handlePopState = () => {
      if (!handlersRegisteredRef.current || isNavigatingRef.current) return

      pendingNavigationRef.current = 'back'
      onExitAttempt()
      window.history.pushState(null, '', window.location.pathname)
    }

    handlePopStateRef.current = handlePopState

    const handleClick = (e: MouseEvent) => {
      if (!handlersRegisteredRef.current || isNavigatingRef.current) return

      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link && link.href) {
        const currentPath = window.location.pathname
        const linkUrl = new URL(link.href, window.location.origin)
        const linkPath = linkUrl.pathname

        if (linkPath !== currentPath) {
          e.preventDefault()
          e.stopPropagation()

          pendingNavigationRef.current = linkPath
          onExitAttempt()
        }
      }
    }

    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleClick, true)

    return () => {
      handlersRegisteredRef.current = false
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('click', handleClick, true)
      handlePopStateRef.current = null
    }
  }, [enabled, onExitAttempt, eventId, accessToken, isPaymentInProgress])

  const moveToBackAndNavigate = async () => {
    isNavigatingRef.current = true

    if (handlePopStateRef.current) {
      window.removeEventListener('popstate', handlePopStateRef.current)
    }

    try {
      const response = await queueApi.moveToBack(eventId)
      toast.info('대기 순번이 맨 뒤로 이동되었습니다.', {
        description: `${response.data.previousRank}번 → ${response.data.newRank}번`,
      })
    } catch (error) {
      console.error(error)
    }

    setTimeout(() => {
      if (pendingNavigationRef.current) {
        if (pendingNavigationRef.current === 'back') {
          navigate({ to: '/events' })
        } else {
          navigate({ to: pendingNavigationRef.current })
        }
        pendingNavigationRef.current = null
      }
      isNavigatingRef.current = false
    }, 100)
  }

  return { moveToBackAndNavigate }
}
