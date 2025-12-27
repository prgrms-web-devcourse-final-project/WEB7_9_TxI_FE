import { useEffect, useRef } from 'react'
import { queueApi } from '@/api/queue'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

interface UseQueueExitGuardParams {
  eventId: string
  enabled: boolean
  onExitAttempt: () => void
}

export function useQueueExitGuard({ eventId, enabled, onExitAttempt }: UseQueueExitGuardParams) {
  const navigate = useNavigate()
  const pendingNavigationRef = useRef<string | null>(null)
  const isNavigatingRef = useRef(false)
  const handlersRegisteredRef = useRef(false)
  const handlePopStateRef = useRef<((e: PopStateEvent) => void) | null>(null) // 추가

  useEffect(() => {
    if (!enabled) {
      handlersRegisteredRef.current = false
      return
    }

    if (handlersRegisteredRef.current) return
    handlersRegisteredRef.current = true

    // 1. 브라우저 탭 닫기/새로고침 감지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!handlersRegisteredRef.current) return
      
      e.preventDefault()
      e.returnValue = ''
      
      // sendBeacon으로 순번 뒤로 보내기
      const url = `${import.meta.env.VITE_API_BASE_URL}/queues/${eventId}/move-to-back`
      navigator.sendBeacon(url, new Blob([JSON.stringify({})], { type: 'application/json' }))
      
      return ''
    }

    // 2. 브라우저 뒤로가기 감지
    const handlePopState = () => {
      if (!handlersRegisteredRef.current || isNavigatingRef.current) return
      
      pendingNavigationRef.current = 'back'
      onExitAttempt()
      window.history.pushState(null, '', window.location.pathname)
    }
    
    handlePopStateRef.current = handlePopState // 참조 저장

    // 3. 모든 링크 클릭 감지
    const handleClick = (e: MouseEvent) => {
      if (!handlersRegisteredRef.current || isNavigatingRef.current) return

      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link && link.href) {
        const currentPath = window.location.pathname
        const linkUrl = new URL(link.href, window.location.origin)
        const linkPath = linkUrl.pathname

        // 같은 페이지가 아닌 경우에만 차단
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
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleClick, true)

    return () => {
      handlersRegisteredRef.current = false
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleClick, true)
      handlePopStateRef.current = null
    }
  }, [enabled, onExitAttempt, eventId])

  const moveToBackAndNavigate = async () => {
    // 즉시 핸들러 비활성화 및 이벤트 리스너 제거
    isNavigatingRef.current = true
    handlersRegisteredRef.current = false
    
    // popstate 이벤트 리스너 즉시 제거
    if (handlePopStateRef.current) {
      window.removeEventListener('popstate', handlePopStateRef.current)
    }
    
    try {
      const response = await queueApi.moveToBack(eventId)
      toast.info('대기 순번이 맨 뒤로 이동되었습니다.', {
        description: `${response.data.previousRank}번 → ${response.data.newRank}번`,
      })
    } catch (error) {
      console.error('Failed to move to back:', error)
      toast.error('순번 이동 처리 중 오류가 발생했습니다.')
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