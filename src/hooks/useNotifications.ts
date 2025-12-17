import { getWebSocketClient } from '@/lib/websocket'
import { useAuthStore } from '@/stores/authStore'
import {
  type Notification,
  type NotificationDTO,
  mapNotificationDTOToNotification,
} from '@/types/notification'
import { useEffect, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'https://api.waitfair.shop/ws'
const NOTIFICATION_DESTINATION = '/user/notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const { accessToken, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return
    }

    const wsClient = getWebSocketClient(WS_URL, () => accessToken)

    const handleConnect = () => {
      console.log('Notification WebSocket connected')
      setIsConnected(true)

      wsClient.subscribe(NOTIFICATION_DESTINATION, (message) => {
        try {
          const notificationDTO: NotificationDTO = JSON.parse(message.body)
          const notification = mapNotificationDTOToNotification(notificationDTO)

          setNotifications((prev) => [notification, ...prev])

          if (!notification.read) {
            setUnreadCount((prev) => prev + 1)
          }

          const stored = localStorage.getItem('notifications')
          const existingNotifications: Notification[] = stored ? JSON.parse(stored) : []
          const updated = [notification, ...existingNotifications]
          localStorage.setItem('notifications', JSON.stringify(updated))

          console.log('New notification received:', notification)
        } catch (error) {
          console.error('Failed to parse notification:', error)
        }
      })
    }

    const handleError = (error: Error) => {
      console.error('Notification WebSocket error:', error)
      setIsConnected(false)
    }

    wsClient.connect(handleConnect, handleError)

    const stored = localStorage.getItem('notifications')
    if (stored) {
      const parsed = JSON.parse(stored)
      setNotifications(parsed)
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
    }

    const handleStorageChange = () => {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        setNotifications(parsed)
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      wsClient.unsubscribe(NOTIFICATION_DESTINATION)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isAuthenticated, accessToken])

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      localStorage.setItem('notifications', JSON.stringify(updated))
      setUnreadCount(updated.filter((n) => !n.read).length)
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      localStorage.setItem('notifications', JSON.stringify(updated))
      setUnreadCount(0)
      return updated
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem('notifications')
  }

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  }
}
