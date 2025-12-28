import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type {
  EventCreateRequest,
  EventUpdateRequest,
  EventResponse,
  AdminEventDashboardResponse,
} from '@/types/admin/event'

const BASE_URL = '/api/v1/admin/events'

export const adminEventsApi = {
  createEvent: async (
    data: EventCreateRequest,
  ): Promise<ApiResponse<EventResponse>> => {
    const response = await apiClient.post<ApiResponse<EventResponse>>(
      BASE_URL,
      data,
    )

    if (response.data.status === '400 BAD_REQUEST') {
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

  updateEvent: async (
    eventId: number,
    data: EventUpdateRequest,
  ): Promise<ApiResponse<EventResponse>> => {
    const response = await apiClient.put<ApiResponse<EventResponse>>(
      `${BASE_URL}/${eventId}`,
      data,
    )

    if (response.data.status === '404 NOT_FOUND') {
      throw Error(response.data.message)
    }

    if (response.data.status === '400 BAD_REQUEST') {
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

  deleteEvent: async (
    eventId: number,
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${BASE_URL}/${eventId}`,
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

  getEventsDashboard: async (): Promise<
    ApiResponse<AdminEventDashboardResponse[]>
  > => {
    const response = await apiClient.get<
      ApiResponse<AdminEventDashboardResponse[]>
    >(`${BASE_URL}/dashboard`)

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },
}