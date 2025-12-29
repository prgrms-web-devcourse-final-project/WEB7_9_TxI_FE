import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useNotifications } from '@/hooks/useNotifications'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { getTypeColor } from '@/utils/getTypeColor'
import { getTypeLabel } from '@/utils/getTypeLabel'
import { AlertCircle, Bell, WifiOff } from 'lucide-react'
import { useEffect } from 'react'

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    clearError,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotifications()

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative cursor-pointer">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 20 ? '20+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">알림</h3>
              {!isConnected && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <WifiOff className="w-3 h-3" />
                  <span>연결 끊김</span>
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={isMarkingAllAsRead}
                className="text-xs h-auto py-1 px-2"
              >
                {isMarkingAllAsRead ? '처리 중...' : '모두 읽음'}
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error.message}</span>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">새로운 알림이 없습니다</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 transition-colors ${
                    !notification.read
                      ? 'cursor-pointer hover:border-blue-600/50 border-blue-600/30 bg-blue-600/5'
                      : 'cursor-default'
                  } ${isMarkingAsRead ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <Badge className={`${getTypeColor(notification.type)} text-xs`}>
                      {getTypeLabel(notification.type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                      <span className="text-xs text-gray-600">
                        {formatTimestamp(notification.timestamp)}
                      </span>
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
