import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
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

  getSeatsByEvent: async (eventId: string): Promise<ApiResponse<Seat[]>> => {
    const response = await apiClient.get<ApiResponse<Seat[]>>(`${BASE_URL}/${eventId}/seats`)

    if (response.data.status === '400 BAD_REQUEST') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },
}