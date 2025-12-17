import { apiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { UpdateUserRequest, User } from '@/types/user'

export const userApi = {
  getUserProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile')

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  updateUserProfile: async (data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', data)

    if (response.data.status === '500 INTERNAL_SERVER_ERROR') {
      throw Error(response.data.message)
    }

    return response.data
  },

  deleteUser: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>('/users/me')

    if (
      response.data.status === '500 INTERNAL_SERVER_ERROR' ||
      response.data.status === '404 NOT_FOUND'
    ) {
      throw Error(response.data.message)
    }

    return response.data
  },
}
