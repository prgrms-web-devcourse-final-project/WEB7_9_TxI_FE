import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { QrTokenResponse, QrValidationResponse, Ticket } from '@/types/ticket'

export const ticketsApi = {
  getMyTickets: async (): Promise<ApiResponse<Ticket[]>> => {
    const response = await apiClient.get<ApiResponse<Ticket[]>>('/tickets/my')

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  getMyTicketDetail: async (ticketId: string): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.get<ApiResponse<Ticket>>(`/tickets/my/${ticketId}/details`)

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  generateQrToken: async (ticketId: number): Promise<ApiResponse<QrTokenResponse>> => {
    const response = await apiClient.post<ApiResponse<QrTokenResponse>>(
      `/tickets/${ticketId}/qr-token`,
    )

    if (
      response.data.status === '400 BAD_REQUEST' ||
      response.data.status === '401 UNAUTHORIZED' ||
      response.data.status === '404 NOT_FOUND' ||
      response.data.status === '500 INTERNAL_SERVER_ERROR'
    ) {
      throw Error(response.data.message)
    }

    return response.data
  },

  validateQrCode: async (token: string): Promise<ApiResponse<QrValidationResponse>> => {
    const response = await apiClient.post<ApiResponse<QrValidationResponse>>(
      '/tickets/entry/verify',
      {},
      {
        params: { token },
      },
    )

    if (
      response.data.status === '400 BAD_REQUEST' ||
      response.data.status === '401 UNAUTHORIZED' ||
      response.data.status === '404 NOT_FOUND' ||
      response.data.status === '500 INTERNAL_SERVER_ERROR'
    ) {
      throw Error(response.data.message)
    }

    return response.data
  },

  transferTicket: async (
    ticketId: number,
    targetNickname: string,
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/tickets/my/${ticketId}/transfer`,
      { targetNickname },
    )

    if (
      response.data.status === '400 BAD_REQUEST' ||
      response.data.status === '401 UNAUTHORIZED' ||
      response.data.status === '404 NOT_FOUND' ||
      response.data.status === '500 INTERNAL_SERVER_ERROR'
    ) {
      throw Error(response.data.message)
    }

    return response.data
  },
}
