import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface Notification {
  id: string
  type: 'ticketing' | 'registration' | 'payment' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
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
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
    setUnreadCount(updated.filter((n) => !n.read).length)
  }

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
    setUnreadCount(0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ticketing':
        return 'bg-blue-600/20 text-blue-600'
      case 'registration':
        return 'bg-purple-600/20 text-purple-600'
      case 'payment':
        return 'bg-green-500/20 text-green-700'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ticketing':
        return '티켓팅'
      case 'registration':
        return '사전등록'
      case 'payment':
        return '결제'
      default:
        return '알림'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative cursor-pointer">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">알림</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-auto py-1 px-2"
              >
                모두 읽음
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">새로운 알림이 없습니다</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:border-blue-600/50 transition-colors ${
                    !notification.read ? 'border-blue-600/30 bg-blue-600/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <Badge className={`${getTypeColor(notification.type)} text-xs`}>
                      {getTypeLabel(notification.type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                      <span className="text-xs text-gray-600">{notification.timestamp}</span>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
