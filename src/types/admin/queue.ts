export interface ShuffleQueueRequest {
  preRegisteredUserIds: number[]
}

export interface ShuffleQueueResponse {
  eventId: number
  totalCount: number
  shuffledAt: string
}

export interface QueueStatisticsResponse {
  eventId: number
  totalCount: number
  waitingCount: number
  enteredCount: number
  expiredCount: number
  completedCount: number
  progress: number
}

export type QueueEntryStatus = 'WAITING' | 'ENTERED' | 'COMPLETED' | 'EXPIRED'

export interface QueueEntryListResponse {
  id: number
  queueRank: number
  userEmail: string
  createdAt: string
  enteredAt: string | null
  expiredAt: string | null
  queueEntryStatus: QueueEntryStatus
  statusText: string
}