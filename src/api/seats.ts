import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { SeatGrade } from '@/types/seat'

export interface Seat {
  id: number
  eventId: number
  seatCode: string
  grade: string
  price: number
  seatStatus: 'AVAILABLE' | 'SOLD' | 'RESERVED'
}

export interface SeatSelectResponse {
  ticketId: number
  eventId: number
  seatId: number
  seatCode: string
  seatGrade: string
  seatPrice: number
  seatStatus: string
  ticketStatus: string
}

export const seatsApi = {
  getSeats: async (eventId: string, grade?: SeatGrade): Promise<ApiResponse<Seat[]>> => {
    const params = grade ? { grade } : undefined
    const response = await apiClient.get<ApiResponse<Seat[]>>(`/events/${eventId}/seats`, {
      params,
    })

    if (response.data.status === '400 BAD_REQUEST') {
      throw Error(response.data.message)
    }

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  selectSeat: async (eventId: string, seatId: string): Promise<ApiResponse<SeatSelectResponse>> => {
    const response = await apiClient.post<ApiResponse<SeatSelectResponse>>(
      `/events/${eventId}/seats/${seatId}/select`,
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

  deselectSeat: async (eventId: string, seatId: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `/events/${eventId}/seats/${seatId}/deselect`,
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
