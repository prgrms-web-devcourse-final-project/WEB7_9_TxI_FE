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
  eventId: number
  status: QueueStatus
  queueRank: number
  waitingAhead: number
  estimatedWaitTime: number
  progress: number
}

export interface EnteredQueueResponse {
  userId: number
  eventId: number
  status: 'ENTERED'
  enteredAt: string
  expiredAt: string
  message: string
}

export interface ExpiredQueueResponse {
  userId: number
  eventId: number
  status: 'EXPIRED'
  message: string
}

export interface CompletedQueueResponse {
  userId: number
  eventId: number
  status: 'COMPLETED'
  message: string
}

export type QueuePersonalEvent =
  | EnteredQueueResponse
  | ExpiredQueueResponse
  | CompletedQueueResponse
