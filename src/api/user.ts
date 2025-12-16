import { apiClient } from '@/lib/axios'
import type { UpdateUserRequest, User } from '@/types/user'

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },

  updateMe: async (data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data)
    return response.data
  },

  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/users/me')
  },
}
