import { notificationApi } from '@/api/notifications'
import { getWebSocketClient } from '@/lib/websocket'
import { useAuthStore } from '@/stores/authStore'
import {
  type Notification,
  type NotificationDTO,
  mapNotificationDTOToNotification,
} from '@/types/notification'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'https://api.waitfair.shop/ws'
const MAX_NOTIFICATIONS = 20

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { accessToken, isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    console.log('[Notifications] useEffect triggered', { isAuthenticated, hasToken: !!accessToken, userId: user?.userId })

    if (!isAuthenticated || !accessToken || !user?.userId) {
      console.log('[Notifications] Not authenticated, no token, or no userId - skipping')
      return
    }

    // 동적 구독 경로 생성
    const notificationDestination = `/user/${user.userId}/notifications`
    console.log('[Notifications] Notification destination:', notificationDestination)

    const wsClient = getWebSocketClient(WS_URL, () => accessToken)
    console.log('[Notifications] WebSocket client obtained, connected:', wsClient.isConnected())

    const handleConnect = async () => {
      console.log('[Notifications] ✅ handleConnect called - WebSocket connected!')
      setIsConnected(true)
      setError(null)

      try {
        setIsLoading(true)
        console.log('[Notifications] Fetching initial notifications via HTTP API...')
        const response = await notificationApi.getNotifications()
        const notificationList = response.data.map(mapNotificationDTOToNotification)

        const limitedNotifications = notificationList.slice(0, MAX_NOTIFICATIONS)
        console.log('[Notifications] Initial notifications loaded:', limitedNotifications.length)
        setNotifications(limitedNotifications)
        setUnreadCount(limitedNotifications.filter((n) => !n.read).length)
      } catch (err) {
        console.error('[Notifications] ❌ Error loading initial notifications:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }

      console.log('[Notifications] 📡 Setting up WebSocket subscription to:', notificationDestination)
      wsClient.subscribe(notificationDestination, (message) => {
        console.log('[Notifications] 🔔 WebSocket message received!', message.body)
        try {
          const notificationDTO: NotificationDTO = JSON.parse(message.body)
          const notification = mapNotificationDTOToNotification(notificationDTO)
          console.log('[Notifications] Parsed notification:', notification)

          setNotifications((prev) => {
            const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS)
            console.log('[Notifications] State updated, total notifications:', updated.length, 'unread:', updated.filter((n) => !n.read).length)

            setUnreadCount(updated.filter((n) => !n.read).length)
            return updated
          })
        } catch (err) {
          console.error('[Notifications] ❌ Error processing WebSocket message:', err)
          setError(err as Error)
        }
      })
      console.log('[Notifications] ✅ WebSocket subscription complete')
    }

    const handleError = (err: Error) => {
      console.error('[Notifications] ❌ WebSocket error:', err)
      setIsConnected(false)
      setError(err)
    }

    console.log('[Notifications] Calling wsClient.connect()')
    wsClient.connect(handleConnect, handleError)

    return () => {
      console.log('[Notifications] 🧹 Cleanup: Unsubscribing from WebSocket')
      wsClient.unsubscribe(notificationDestination)
    }
  }, [isAuthenticated, user?.userId]) // userId 변경 시에도 재구독

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onMutate: async (id) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        setUnreadCount(updated.filter((n) => !n.read).length)
        return updated
      })
    },
    onError: (err, id) => {
      setError(err as Error)

      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        setUnreadCount(updated.filter((n) => !n.read).length)
        return updated
      })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onMutate: async () => {
      const previousNotifications = notifications
      const previousUnreadCount = unreadCount

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)

      return { previousNotifications, previousUnreadCount }
    },
    onError: (err, _variables, context) => {
      setError(err as Error)

      if (context) {
        setNotifications(context.previousNotifications)
        setUnreadCount(context.previousUnreadCount)
      }
    },
  })

  const markAsRead = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id)
    },
    [markAsReadMutation],
  )

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate()
  }, [markAllAsReadMutation])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearError,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }
}