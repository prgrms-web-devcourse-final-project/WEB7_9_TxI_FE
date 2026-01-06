export interface NotificationDTO {
  id: number
  type: 'PAYMENT' | 'QUEUE_ENTRIES' | 'TICKET' | 'PRE_REGISTER' | 'SIGNUP'
  title: string
  content: string
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
    QUEUE_ENTRIES: 'ticketing',
    TICKET: 'ticketing',
    PRE_REGISTER: 'registration',
    SIGNUP: 'info',
  }

  return {
    id: dto.id.toString(),
    type: typeMap[dto.type] || 'info',
    title: dto.title,
    message: dto.content,
    timestamp: dto.createdAt,
    read: dto.isRead,
  }
}
