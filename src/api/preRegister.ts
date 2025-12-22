import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { PreRegister } from '@/types/preRegister'

export const preRegisterApi = {
  getMyPreRegisters: async (): Promise<ApiResponse<PreRegister[]>> => {
    const response = await apiClient.get<ApiResponse<PreRegister[]>>('/pre-register/me')

    if (response.data.status === '401 UNAUTHORIZED') {
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
