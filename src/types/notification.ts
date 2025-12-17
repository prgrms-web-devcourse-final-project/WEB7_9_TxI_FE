export interface NotificationDTO {
  id: number
  type: 'PAYMENT' | 'QUEUE' | 'SEAT' | 'EVENT'
  typeDetail: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
  readAt: string | null
}

export interface Notification {
  id: string
  type: 'ticketing' | 'registration' | 'payment' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export function mapNotificationDTOToNotification(dto: NotificationDTO): Notification {
  const typeMap: Record<string, Notification['type']> = {
    PAYMENT: 'payment',
    QUEUE: 'ticketing',
    SEAT: 'ticketing',
    EVENT: 'registration',
  }

  return {
    id: dto.id.toString(),
    type: typeMap[dto.type] || 'info',
    title: dto.title,
    message: dto.message,
    timestamp: dto.createdAt,
    read: dto.isRead,
  }
}
