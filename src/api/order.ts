import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  V2_PaymentConfirmResponse,
  PrepareOrderRequest,
  PrepareOrderResponse,
  ConfirmTossPaymentRequest,
} from '@/types/order'

export const orderApi = {
  createOrder: async (request: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> => {
    const response = await apiClient.post<ApiResponse<CreateOrderResponse>>('/order', request)

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

  confirmPayment: async (
    request: ConfirmPaymentRequest,
  ): Promise<ApiResponse<ConfirmPaymentResponse>> => {
    const response = await apiClient.post<ApiResponse<ConfirmPaymentResponse>>(
      '/payments/confirm',
      request,
    )

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  // 토스페이먼츠용 주문 준비 (v2)
  prepareOrder: async (
    request: PrepareOrderRequest,
  ): Promise<ApiResponse<PrepareOrderResponse>> => {
    const response = await apiClient.post<ApiResponse<PrepareOrderResponse>>(
      '../v2/orders/prepare',
      request,
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

  // 토스페이먼츠 결제 확인 (v2)
  confirmTossPayment: async (
    request: ConfirmTossPaymentRequest,
  ): Promise<ApiResponse<V2_PaymentConfirmResponse>> => {
    const response = await apiClient.post<ApiResponse<V2_PaymentConfirmResponse>>(
      '../v2/payments/confirm',
      request,
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
