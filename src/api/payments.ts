import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'

export interface PaymentReceipt {
  orderId: number
  orderKey: string
  paymentKey: string
  orderStatus: string
  amount: number
  ticketId: number
  ticketStatus: string
}

export const paymentsApi = {
  getReceipt: async (orderId: string): Promise<ApiResponse<PaymentReceipt>> => {
    const response = await apiClient.get<ApiResponse<PaymentReceipt>>(
      `/payments/${orderId}/receipt`,
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
