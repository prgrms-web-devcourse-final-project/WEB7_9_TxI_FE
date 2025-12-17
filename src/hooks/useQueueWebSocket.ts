import { getWebSocketClient } from '@/lib/websocket'
import { useAuthStore } from '@/stores/authStore'
import type { QueuePersonalEvent, WaitingQueueResponse } from '@/types/queue'
import { useEffect, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'https://api.waitfair.shop/ws'

interface UseQueueWebSocketParams {
  eventId: number
  enabled?: boolean
}

export function useQueueWebSocket({ eventId, enabled = true }: UseQueueWebSocketParams) {
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [personalEvent, setPersonalEvent] = useState<QueuePersonalEvent | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const { accessToken, isAuthenticated, user } = useAuthStore()
  const userId = user?.userId

  useEffect(() => {
    if (!enabled || !isAuthenticated || !accessToken || !userId) {
      return
    }

    const wsClient = getWebSocketClient(WS_URL, () => accessToken)

    const handleConnect = () => {
      console.log('Queue WebSocket connected')
      setIsConnected(true)

      const personalDestination = `/topic/users/${userId}/queue`
      wsClient.subscribe(personalDestination, (message) => {
        try {
          const event: QueuePersonalEvent = JSON.parse(message.body)
          console.log('Personal queue event received:', event)
          setPersonalEvent(event)

          if ('enteredAt' in event) {
            console.log('입장 완료:', event.message)
          } else if ('expiredAt' in event) {
            console.log('시간 만료:', event.message)
          } else if ('completedAt' in event) {
            console.log('결제 완료:', event.message)
          }
        } catch (error) {
          console.error('Failed to parse personal queue event:', error)
        }
      })

      const queueDestination = `/topic/events/${eventId}/queue`
      wsClient.subscribe(queueDestination, (message) => {
        try {
          const updates: Record<string, WaitingQueueResponse> = JSON.parse(message.body)
          console.log('Queue updates received:', updates)

          const myUpdate = updates[userId.toString()]
          if (myUpdate) {
            setQueuePosition(myUpdate.position)
            setEstimatedWaitTime(myUpdate.estimatedWaitTime)
            setProgress(myUpdate.progressPercentage)
            console.log('My queue status updated:', myUpdate)
          }
        } catch (error) {
          console.error('Failed to parse queue updates:', error)
        }
      })
    }

    const handleError = (error: Error) => {
      console.error('Queue WebSocket error:', error)
      setIsConnected(false)
    }

    wsClient.connect(handleConnect, handleError)

    return () => {
      wsClient.unsubscribe(`/topic/users/${userId}/queue`)
      wsClient.unsubscribe(`/topic/events/${eventId}/queue`)
    }
  }, [enabled, isAuthenticated, accessToken, userId, eventId])

  const clearPersonalEvent = () => {
    setPersonalEvent(null)
  }

  return {
    queuePosition,
    estimatedWaitTime,
    progress,
    personalEvent,
    isConnected,
    clearPersonalEvent,
  }
}
