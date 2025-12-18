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
const NOTIFICATION_DESTINATION = '/user/notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { accessToken, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return
    }

    const wsClient = getWebSocketClient(WS_URL, () => accessToken)

    const handleConnect = async () => {
      setIsConnected(true)
      setError(null)

      try {
        setIsLoading(true)
        const response = await notificationApi.getNotifications()
        const notificationList = response.data.map(mapNotificationDTOToNotification)

        setNotifications(notificationList)
        setUnreadCount(notificationList.filter((n) => !n.read).length)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }

      wsClient.subscribe(NOTIFICATION_DESTINATION, (message) => {
        try {
          const notificationDTO: NotificationDTO = JSON.parse(message.body)
          const notification = mapNotificationDTOToNotification(notificationDTO)

          setNotifications((prev) => [notification, ...prev])

          if (!notification.read) {
            setUnreadCount((prev) => prev + 1)
          }
        } catch (err) {
          setError(err as Error)
        }
      })
    }

    const handleError = (err: Error) => {
      setIsConnected(false)
      setError(err)
    }

    wsClient.connect(handleConnect, handleError)

    return () => {
      wsClient.unsubscribe(NOTIFICATION_DESTINATION)
    }
  }, [isAuthenticated, accessToken])

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
