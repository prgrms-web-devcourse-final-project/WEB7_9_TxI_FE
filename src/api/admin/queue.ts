import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'
import type { PageResponse } from '@/types/event'
import type {
  ShuffleQueueRequest,
  ShuffleQueueResponse,
  QueueStatisticsResponse,
  QueueEntryListResponse,
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

  getQueueStatistics: async (eventId: number): Promise<ApiResponse<QueueStatisticsResponse>> => {
    const emptyStatisticsResponse: ApiResponse<QueueStatisticsResponse> = {
      status: '200 OK',
      message: '대기열 통계가 없습니다',
      data: {
        eventId,
        totalCount: 0,
        waitingCount: 0,
        enteredCount: 0,
        expiredCount: 0,
        progress: 0,
      },
    }

    try {
      const response = await apiClient.get<ApiResponse<QueueStatisticsResponse>>(
        `${BASE_URL}/${eventId}/statistics`,
        {
          validateStatus: (status) => status < 500,
        },
      )

      if (response.status === 404 || response.data?.status === '404 NOT_FOUND') {
        return emptyStatisticsResponse
      }

      if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
        throw Error(response.data.message)
      }

      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ status: string; message: string }>
      if (axiosError?.response?.status === 404) {
        return emptyStatisticsResponse
      }
      throw error
    }
  },

  getQueueEntriesByEventId: async (
    eventId: number,
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<PageResponse<QueueEntryListResponse>>> => {
    const emptyResponse = {
      status: '200 OK' as const,
      message: '대기열 항목이 없습니다',
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        numberOfElements: 0,
        pageable: {
          offset: page * size,
          sort: {
            empty: true,
            sorted: false,
            unsorted: true,
          },
          paged: true,
          pageNumber: page,
          pageSize: size,
          unpaged: false,
        },
        first: page === 0,
        last: true,
        empty: true,
      },
    }

    try {
      const response = await apiClient.get<ApiResponse<PageResponse<QueueEntryListResponse>>>(
        `${BASE_URL}/${eventId}`,
        {
          params: {
            page,
            size,
          },
          validateStatus: (status) => status < 500,
        },
      )

      if (response.status === 404 || response.data?.status === '404 NOT_FOUND') {
        return emptyResponse
      }

      if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
        throw Error(response.data.message)
      }

      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ status: string; message: string }>
      if (axiosError?.response?.status === 404) {
        return emptyResponse
      }
      throw error
    }
  },
}
