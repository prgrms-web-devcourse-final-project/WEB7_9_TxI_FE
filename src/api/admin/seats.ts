import { apiClient } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'
import type { PageResponse } from '@/types/event'
import type { Seat } from '@/types/seat'
import type {
  AutoCreateSeatsRequest,
  BulkCreateSeatsRequest,
  SeatCreateRequest,
  SeatUpdateRequest,
} from '@/types/admin/seat'

const BASE_URL = '/admin/events'

export const adminSeatsApi = {
  bulkCreateSeats: async (
    eventId: number,
    data: BulkCreateSeatsRequest,
  ): Promise<ApiResponse<Seat[]>> => {
    const response = await apiClient.post<ApiResponse<Seat[]>>(
      `${BASE_URL}/${eventId}/seats/bulk`,
      data,
    )

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

  autoCreateSeats: async (
    eventId: number,
    data: AutoCreateSeatsRequest,
  ): Promise<ApiResponse<Seat[]>> => {
    const response = await apiClient.post<ApiResponse<Seat[]>>(
      `${BASE_URL}/${eventId}/seats/auto`,
      data,
    )

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

  createSingleSeat: async (
    eventId: number,
    data: SeatCreateRequest,
  ): Promise<ApiResponse<Seat>> => {
    const response = await apiClient.post<ApiResponse<Seat>>(
      `${BASE_URL}/${eventId}/seats/single`,
      data,
    )

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

  updateSeat: async (
    eventId: number,
    seatId: number,
    data: SeatUpdateRequest,
  ): Promise<ApiResponse<Seat>> => {
    const response = await apiClient.put<ApiResponse<Seat>>(
      `${BASE_URL}/${eventId}/seats/${seatId}`,
      data,
    )

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

  deleteSeat: async (
    eventId: number,
    seatId: number,
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${BASE_URL}/${eventId}/seats/${seatId}`,
    )

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  deleteAllEventSeats: async (
    eventId: number,
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${BASE_URL}/${eventId}/seats`,
    )

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  getSeatsByEvent: async (
    eventId: string,
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<PageResponse<Seat>>> => {
    const emptyResponse: ApiResponse<PageResponse<Seat>> = {
      status: '200 OK',
      message: '좌석 항목이 없습니다',
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
      const response = await apiClient.get<ApiResponse<PageResponse<Seat>>>(
        `${BASE_URL}/${eventId}/seats`,
        {
          params: { page, size },
          validateStatus: (status) => status < 500,
        },
      )

      if (response.status === 404 || response.data?.status === '404 NOT_FOUND') {
        return emptyResponse
      }

      if (response.data.status === '400 BAD_REQUEST') {
        throw Error(response.data.message)
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