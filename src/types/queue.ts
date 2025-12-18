export type QueueStatus = 'WAITING' | 'ENTERED' | 'EXPIRED' | 'COMPLETED'

export interface QueueStatusResponse {
  userId: number
  eventId: number
  status: QueueStatus
  queueRank: number
  waitingAhead: number
  estimatedWaitTime: number
  progress: number
}

export interface QueueExistsResponse {
  exists: boolean
}

export interface WaitingQueueResponse {
  userId: number
  position: number
  estimatedWaitTime: number
  progressPercentage: number
}

export interface EnteredQueueResponse {
  userId: number
  enteredAt: string
  message: string
}

export interface ExpiredQueueResponse {
  userId: number
  expiredAt: string
  message: string
}

export interface CompletedQueueResponse {
  userId: number
  completedAt: string
  message: string
}

export type QueuePersonalEvent =
  | EnteredQueueResponse
  | ExpiredQueueResponse
  | CompletedQueueResponse
