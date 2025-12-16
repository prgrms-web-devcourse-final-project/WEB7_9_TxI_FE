import { apiClient } from '@/lib/axios'
import type { UpdateUserRequest, User, UserProfile, ApiResponse } from '@/types/user'

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/users/profile')
    // axios는 response.data를 반환하므로, 그 안의 data에 접근
    const apiResponse = response.data as any
    return apiResponse.data
  },

  updateProfile: async (data: UpdateUserRequest): Promise<UserProfile> => {
    const response = await apiClient.put<ApiResponse<UserProfile>>('/users/profile', data)
    const apiResponse = response.data as any
    return apiResponse.data
  },

  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/users/me')
  },
}
