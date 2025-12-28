import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type {
  ShuffleQueueRequest,
  ShuffleQueueResponse,
  QueueStatisticsResponse,
} from '@/types/admin/queue'

const BASE_URL = '/admin/queues'

export const adminQueuesApi = {
  shuffleQueue: async (
    eventId: number,
    data: ShuffleQueueRequest,
  ): Promise<ApiResponse<ShuffleQueueResponse>> => {
    const response = await apiClient.post<ApiResponse<ShuffleQueueResponse>>(
      `${BASE_URL}/${eventId}/shuffle`,
      data,
    )

    if (response.data.status === '400 BAD_REQUEST') {
      throw Error(response.data.message)
    }

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '409 CONFLICT') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  getQueueStatistics: async (
    eventId: number,
  ): Promise<ApiResponse<QueueStatisticsResponse>> => {
    const response = await apiClient.get<ApiResponse<QueueStatisticsResponse>>(
      `${BASE_URL}/${eventId}/statistics`,
    )

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },
}