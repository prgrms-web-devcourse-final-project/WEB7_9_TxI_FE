import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { AuthData, LoginRequest, SignupRequest } from '@/types/auth'

export const authApi = {
  signup: async (data: SignupRequest): Promise<ApiResponse<AuthData>> => {
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/signup', data)

    if (
      response.data.status === '400 BAD_REQUEST' ||
      response.data.status === '500 INTERNAL_SERVER_ERROR'
    ) {
      throw new Error(response.data.message)
    }
    return response.data
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthData>> => {
    const response = await apiClient.post<ApiResponse<AuthData>>('/auth/login', data)

    if (
      response.data.status === '400 BAD_REQUEST' ||
      response.data.status === '500 INTERNAL_SERVER_ERROR'
    ) {
      throw new Error(response.data.message)
    }
    return response.data
  },

  logout: async (): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/auth/logout')

    if (response.data.status === '400 BAD_REQUEST' || response.data.status === '401 UNAUTHORIZED') {
      throw new Error(response.data.message)
    }
    return response.data
  },

  verifyPassword: async (data: { password: string }): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/auth/verify-password', data)

    if (
      response.data.status === '404 NOT_FOUND' ||
      response.data.status === '500 INTERNAL_SERVER_ERROR'
    ) {
      throw new Error(response.data.message)
    }
    return response.data
  },
}
