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
  progress: number
}
