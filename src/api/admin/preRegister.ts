import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'
import type { PageResponse } from '@/types/event'
import type { PreRegisterListResponse } from '@/types/admin/preRegister'

const BASE_URL = '/admin/pre-registers'

export const adminPreRegistersApi = {
  getPreRegistersByEventId: async (
    eventId: number,
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<PageResponse<PreRegisterListResponse>>> => {
    const emptyResponse: ApiResponse<PageResponse<PreRegisterListResponse>> = {
      status: '200 OK',
      message: '사전 등록 항목이 없습니다',
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
      const response = await apiClient.get<
        ApiResponse<PageResponse<PreRegisterListResponse>>
      >(`${BASE_URL}/${eventId}`, {
        params: {
          page,
          size,
        },
        validateStatus: (status) => status < 500,
      })

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

  getPreRegisterCountByEventId: async (
    eventId: number,
  ): Promise<ApiResponse<number>> => {
    const emptyCountResponse: ApiResponse<number> = {
      status: '200 OK',
      message: '사전 등록 수가 조회되었습니다',
      data: 0,
    }

    try {
      const response = await apiClient.get<ApiResponse<number>>(
        `${BASE_URL}/${eventId}/count`,
        {
          validateStatus: (status) => status < 500,
        },
      )

      if (response.status === 404 || response.data?.status === '404 NOT_FOUND') {
        return emptyCountResponse
      }

      if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
        throw Error(response.data.message)
      }

      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ status: string; message: string }>
      if (axiosError?.response?.status === 404) {
        return emptyCountResponse
      }
      throw error
    }
  },
}

