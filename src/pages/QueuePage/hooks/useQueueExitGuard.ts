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
  const handlersRef = useRef<{
    beforeunload: ((e: BeforeUnloadEvent) => void) | null
    pagehide: ((e: PageTransitionEvent) => void) | null
    popstate: (() => void) | null
    click: ((e: MouseEvent) => void) | null
  }>({
    beforeunload: null,
    pagehide: null,
    popstate: null,
    click: null,
  })

  useEffect(() => {
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

    const removeListeners = () => {
      if (handlersRef.current.beforeunload) {
        window.removeEventListener('beforeunload', handlersRef.current.beforeunload)
        handlersRef.current.beforeunload = null
      }
      if (handlersRef.current.pagehide) {
        window.removeEventListener('pagehide', handlersRef.current.pagehide)
        handlersRef.current.pagehide = null
      }
      if (handlersRef.current.popstate) {
        window.removeEventListener('popstate', handlersRef.current.popstate)
        handlersRef.current.popstate = null
      }
      if (handlersRef.current.click) {
        document.removeEventListener('click', handlersRef.current.click, true)
        handlersRef.current.click = null
      }
      handlePopStateRef.current = null
      handlersRegisteredRef.current = false
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!enabled || !handlersRegisteredRef.current) return

      // 결제 진행 중이면 페이지 이탈 방지 안 함
      if (isPaymentInProgress) {
        console.log('[QueueExitGuard] 결제 진행 중이므로 beforeunload 스킵')
        return
      }

      e.preventDefault()
      return ''
    }

    const handlePageHide = (e: PageTransitionEvent) => {
      if (!enabled || !handlersRegisteredRef.current) return

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
      if (!enabled || !handlersRegisteredRef.current || isNavigatingRef.current) return

      pendingNavigationRef.current = 'back'
      onExitAttempt()
      window.history.pushState(null, '', window.location.pathname)
    }

    const handleClick = (e: MouseEvent) => {
      if (!enabled || !handlersRegisteredRef.current || isNavigatingRef.current) return

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

    // enabled가 false일 때는 리스너 제거
    if (!enabled) {
      removeListeners()
      return
    }

    // enabled가 true이고 아직 등록되지 않았을 때만 등록
    if (handlersRegisteredRef.current) return

    handlersRegisteredRef.current = true
    handlePopStateRef.current = handlePopState
    handlersRef.current.beforeunload = handleBeforeUnload
    handlersRef.current.pagehide = handlePageHide
    handlersRef.current.popstate = handlePopState
    handlersRef.current.click = handleClick

    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleClick, true)

    return () => {
      removeListeners()
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
