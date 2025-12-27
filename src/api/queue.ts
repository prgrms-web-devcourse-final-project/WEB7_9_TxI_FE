import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { QueueExistsResponse, QueueStatusResponse, MoveToBackResponse} from '@/types/queue'

export const queueApi = {
  getQueueStatus: async (eventId: string): Promise<ApiResponse<QueueStatusResponse>> => {
    const response = await apiClient.get<ApiResponse<QueueStatusResponse>>(
      `/queues/${eventId}/status`,
    )

    if (response.data.status === '401 UNAUTHORIZED') {
      throw Error(response.data.message)
    }

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  checkQueueExists: async (eventId: string): Promise<ApiResponse<QueueExistsResponse>> => {
    const response = await apiClient.get<ApiResponse<QueueExistsResponse>>(
      `/queues/${eventId}/exists`,
    )

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  processIncludeMe: async (
    eventId: string,
  ): Promise<
    ApiResponse<{
      eventId: number
      processedCount: number
      remainingWaitingCount: number
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        eventId: number
        processedCount: number
        remainingWaitingCount: number
      }>
    >(`/queues/${eventId}/process-include-me`)

    if (response.data.status === '400 BAD_REQUEST') {
      throw Error(response.data.message)
    }

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  moveToBack: async (eventId: string): Promise<ApiResponse<MoveToBackResponse>> => {
    const response = await apiClient.post<ApiResponse<MoveToBackResponse>>(
      `/queues/${eventId}/move-to-back`,
    )

    if (response.data.status === '400 BAD_REQUEST') {
      throw Error(response.data.message)
    }

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

}
